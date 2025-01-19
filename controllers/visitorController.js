const Visitor = require("../models/Visitor");
const geoip = require("geoip-lite");
const useragent = require("useragent");

exports.trackVisitor = async (req, res) => {
  const { projectName } = req.body;
  const ipAddress = req.clientIp;
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const existingVisit = await Visitor.findOne({ ipAddress, projectName });

    const geo = geoip.lookup(ip);
    const agent = useragent.parse(req.headers['user-agent']);
    const userAgent = agent.toString();
    const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";
    const device = agent.device.toString();
    const browser = agent.toAgent();

    if (!existingVisit) {
      const newVisit = new Visitor({ ipAddress, projectName, userAgent, location, device, browser });
      await newVisit.save();
    } else {
      existingVisit.lastVisit = new Date();
      existingVisit.userAgent = userAgent;
      await existingVisit.save();
    }

    const visitorCount = await Visitor.countDocuments({ projectName });

    res.json({
      message: "Visitor count updated successfully",
      projectName,
      uniqueVisitors: visitorCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorCount = async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const visitorCount = await Visitor.countDocuments({ projectName });
    res.json({ projectName, uniqueVisitors: visitorCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllVisitors = async (req, res) => {
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorTrend = async (req, res) => {
  const { projectName } = req.params;
  const { period = 'daily' } = req.query; // daily, weekly, monthly

  try {
    const groupBy = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" } },
      weekly: { $week: "$lastVisit" },
      monthly: { $month: "$lastVisit" }
    }[period];

    const trend = await Visitor.aggregate([
      { $match: { projectName } },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(trend);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.filterVisitors = async (req, res) => {
  const { device, browser, location } = req.query;
  const filter = {};

  if (device) filter.device = device;
  if (browser) filter.browser = browser;
  if (location) filter.location = location;

  try {
    const visitors = await Visitor.find(filter);
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    await Visitor.findByIdAndDelete(id);
    res.json({ message: "Visitor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateVisitorInfo = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedVisitor = await Visitor.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedVisitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorStatistics = async (req, res) => {
  const { projectName } = req.params;

  try {
    const statistics = await Visitor.aggregate([
      { $match: { projectName } },
      {
        $group: {
          _id: null,
          mostUsedBrowser: { $first: "$userAgent" }, // Simplified for example
          mostUsedDevice: { $first: "$device" }, // Simplified for example
        }
      }
    ]);

    res.json(statistics[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};