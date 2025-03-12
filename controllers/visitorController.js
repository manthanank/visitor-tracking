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

exports.getVisitorByIp = async (req, res) => {
  const { ipAddress } = req.params;

  if (!ipAddress) {
    return res.status(400).json({ error: "IP Address is required" });
  }

  try {
    const visitors = await Visitor.find({ ipAddress });

    if (!visitors || visitors.length === 0) {
      return res
        .status(404)
        .json({ error: "No visitor found with this IP address" });
    }

    res.json(visitors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required" });
  }

  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    const visitors = await Visitor.find({
      lastVisit: {
        $gte: start,
        $lte: end,
      },
    }).sort({ lastVisit: -1 });

    const visitorCount = visitors.length;

    res.json({
      startDate,
      endDate,
      visitorCount,
      visitors,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUniqueVisitorsDaily = async (req, res) => {
  const { projectName } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Create date range filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
      dateFilter.$gte.setHours(0, 0, 0, 0);
    } else {
      // Default to last 30 days if no start date provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      dateFilter.$gte = thirtyDaysAgo;
    }

    if (endDate) {
      dateFilter.$lte = new Date(endDate);
      dateFilter.$lte.setHours(23, 59, 59, 999);
    } else {
      // Default to current date if no end date provided
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      dateFilter.$lte = today;
    }

    // Create project filter
    const projectFilter = projectName === "All" ? {} : { projectName };

    // Aggregate to get unique visitors per day
    const dailyVisitors = await Visitor.aggregate([
      {
        $match: {
          ...projectFilter,
          lastVisit: dateFilter,
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" } },
            ipAddress: "$ipAddress",
          },
          lastVisit: { $max: "$lastVisit" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          uniqueVisitors: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          uniqueVisitors: 1,
        },
      },
    ]);

    res.json({
      projectName,
      period: {
        startDate: dateFilter.$gte.toISOString().split("T")[0],
        endDate: dateFilter.$lte.toISOString().split("T")[0],
      },
      dailyActiveUsers: dailyVisitors,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
