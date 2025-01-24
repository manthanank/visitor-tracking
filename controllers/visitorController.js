const Visitor = require("../models/Visitor");
const geoip = require("geoip-lite");
const useragent = require("useragent");
const logger = require("../middleware/logger");

exports.trackVisitor = async (req, res) => {
  const { projectName } = req.body;
  const ipAddress =
    req.clientIp ||
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress;

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const existingVisit = await Visitor.findOne({ ipAddress, projectName });
    const geo = geoip.lookup(ipAddress);
    const agent = useragent.parse(req.headers["user-agent"]);
    const userAgent = agent.toString();
    const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";
    const device = agent.device.toString();
    const browser = agent.toAgent();

    const visitData = {
      ipAddress,
      projectName,
      userAgent,
      location,
      device,
      browser,
      lastVisit: new Date(),
    };

    if (!existingVisit) {
      const newVisit = new Visitor(visitData);
      await newVisit.save();
    } else {
      Object.assign(existingVisit, visitData);
      await existingVisit.save();
    }

    const visitorCount = await Visitor.countDocuments({ projectName });

    res.json({
      message: "Visitor count updated successfully",
      projectName,
      uniqueVisitors: visitorCount,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorCount = async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const matchStage = projectName === "All" ? {} : { projectName };
    const visitorCount = await Visitor.countDocuments(matchStage);
    res.json({ projectName, uniqueVisitors: visitorCount });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.json(visitors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Visitor.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]);

    const result = locations.map((l) => ({
      location: l._id,
      visitorCount: l.count,
    }));

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Visitor.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]);

    const result = devices.map((d) => ({
      device: d._id,
      visitorCount: d.count,
    }));

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTotalVisits = async (req, res) => {
  try {
    const visitors = await Visitor.aggregate([
      {
        $group: {
          _id: { projectName: "$projectName" },
          uniqueVisitors: { $sum: 1 },
        },
      },
    ]);

    const result = visitors.map((v) => ({
      projectName: v._id.projectName,
      uniqueVisitors: v.uniqueVisitors,
    }));

    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorTrend = async (req, res) => {
  const { projectName } = req.params;
  const { period } = req.query;

  try {
    const groupBy = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" } },
      weekly: { $week: "$lastVisit" },
      monthly: { $month: "$lastVisit" },
    }[period];

    const matchStage = projectName === "All" ? {} : { projectName };

    const trend = await Visitor.aggregate([
      { $match: matchStage },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(trend);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.filterVisitors = async (req, res) => {
  const { device, browser, projectName, startDate, endDate, location } =
    req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (device && device !== "All") filter.device = device;
  if (browser && browser !== "All") filter.browser = browser;
  if (projectName && projectName !== "All") filter.projectName = projectName;
  if (startDate || endDate) {
    filter.lastVisit = {};
    if (startDate)
      filter.lastVisit.$gte = new Date(startDate).setHours(0, 0, 0, 0);
    if (endDate)
      filter.lastVisit.$lte = new Date(endDate).setHours(23, 59, 59, 999);
  }
  if (location && location !== "All") filter.location = location;

  try {
    const visitors = await Visitor.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastVisit: -1 });
    const totalVisitors = await Visitor.countDocuments(filter);
    const totalPages = Math.ceil(totalVisitors / limit);

    res.json({ visitors, totalVisitors, totalPages, currentPage: page });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    await Visitor.findByIdAndDelete(id);
    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateVisitorInfo = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedVisitor = await Visitor.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updatedVisitor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorStatistics = async (req, res) => {
  const { projectName } = req.params;

  try {
    const matchStage = projectName === "All" ? {} : { projectName };

    const statistics = await Visitor.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          mostUsedBrowser: { $first: "$userAgent" },
          mostUsedDevice: { $first: "$device" },
          mostVisitedLocation: { $first: "$location" },
        },
      },
    ]);

    res.json(statistics[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
