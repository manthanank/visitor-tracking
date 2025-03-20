const Visitor = require("../models/Visitor");
const geoip = require("geoip-lite");
const useragent = require("useragent");
const logger = require("../middleware/logger");

class VisitorService {
  async trackVisitor(ipAddress, projectName, userAgentHeader) {
    if (!projectName) throw new Error("Project Name is required");

    const existingVisit = await Visitor.findOne({ ipAddress, projectName });
    const geo = geoip.lookup(ipAddress);
    const agent = useragent.parse(userAgentHeader);
    
    const visitData = {
      ipAddress,
      projectName,
      userAgent: agent.toString(),
      location: geo ? `${geo.city}, ${geo.country}` : "Unknown",
      device: agent.device.toString(),
      browser: agent.toAgent(),
      lastVisit: new Date(),
    };

    if (!existingVisit) {
      await new Visitor(visitData).save();
    } else {
      Object.assign(existingVisit, visitData);
      await existingVisit.save();
    }

    return await Visitor.countDocuments({ projectName });
  }

  async getVisitorCount(projectName) {
    if (!projectName) throw new Error("Project Name is required");
    
    const matchStage = projectName === "All" ? {} : { projectName };
    return await Visitor.countDocuments(matchStage);
  }

  async getAllVisitors() {
    return await Visitor.find().lean();
  }

  async getVisitorById(visitorId) {
    return await Visitor.findById(visitorId).lean();
  }
  
  async updateVisitor(id, updateData) {
    return await Visitor.findByIdAndUpdate(id, updateData, { new: true });
  }
  
  async deleteVisitor(id) {
    return await Visitor.findByIdAndDelete(id);
  }

  async getAllLocations() {
    const locations = await Visitor.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]);

    return locations.map((l) => ({
      location: l._id,
      visitorCount: l.count,
    }));
  }

  async getAllDevices() {
    const devices = await Visitor.aggregate([
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]);

    return devices.map((d) => ({
      device: d._id,
      visitorCount: d.count,
    }));
  }

  async getTotalVisits() {
    const visitors = await Visitor.aggregate([
      {
        $group: {
          _id: { projectName: "$projectName" },
          uniqueVisitors: { $sum: 1 },
        },
      },
    ]);

    return visitors.map((v) => ({
      projectName: v._id.projectName,
      uniqueVisitors: v.uniqueVisitors,
    }));
  }

  async getVisitorTrend(projectName, period) {
    const groupBy = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" } },
      weekly: { $week: "$lastVisit" },
      monthly: { $month: "$lastVisit" },
    }[period];

    const matchStage = projectName === "All" ? {} : { projectName };

    return await Visitor.aggregate([
      { $match: matchStage },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  }

  async filterVisitors(filters, pagination) {
    const { device, browser, projectName, startDate, endDate, location } = filters;
    const { page = 1, limit = 10 } = pagination;
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

    const visitors = await Visitor.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastVisit: -1 });
    const totalVisitors = await Visitor.countDocuments(filter);
    const totalPages = Math.ceil(totalVisitors / limit);

    return { 
      visitors, 
      totalVisitors, 
      totalPages, 
      currentPage: page 
    };
  }

  async getVisitorByIp(ipAddress) {
    if (!ipAddress) throw new Error("IP Address is required");
    
    const visitors = await Visitor.find({ ipAddress });
    
    if (!visitors || visitors.length === 0) {
      throw new Error("No visitor found with this IP address");
    }
    
    return visitors;
  }

  async getVisitorsByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    const visitors = await Visitor.find({
      lastVisit: {
        $gte: start,
        $lte: end,
      },
    }).sort({ lastVisit: -1 });

    return {
      startDate,
      endDate,
      visitorCount: visitors.length,
      visitors,
    };
  }

  async getVisitorStatistics(projectName) {
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

    return statistics[0];
  }

  async getUniqueVisitorsDaily(projectName, startDate, endDate) {
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

    return {
      projectName,
      period: {
        startDate: dateFilter.$gte.toISOString().split("T")[0],
        endDate: dateFilter.$lte.toISOString().split("T")[0],
      },
      dailyActiveUsers: dailyVisitors,
    };
  }

  async getActiveVisitors(minutes = 5) {
    const threshold = new Date(Date.now() - minutes * 60 * 1000);
    return await Visitor.find({ lastVisit: { $gte: threshold } }).lean();
  }

  async getBrowserOsStats() {
    const browserStats = await Visitor.aggregate([{ $group: { _id: "$browser", count: { $sum: 1 } } }]);
    const osStats = await Visitor.aggregate([{ $group: { _id: "$userAgent", count: { $sum: 1 } } }]);
    return { browserStats, osStats };
  }

  async exportVisitors(format = "json") {
    const visitors = await Visitor.find().lean();
    if (format === "csv") {
      const csv = visitors.map(v => `${v.ipAddress},${v.projectName},${v.browser},${v.device},${v.location},${v.lastVisit}`).join("\n");
      return `ipAddress,projectName,browser,device,location,lastVisit\n${csv}`;
    }
    return visitors;
  }

  async getVisitorGrowth() {
    return await Visitor.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$lastVisit" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = new VisitorService();