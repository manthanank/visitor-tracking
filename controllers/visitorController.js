const visitorService = require("../services/visitorService");
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
    const visitorCount = await visitorService.trackVisitor(
      ipAddress,
      projectName,
      req.headers["user-agent"]
    );

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
    const visitorCount = await visitorService.getVisitorCount(projectName);
    res.json({ projectName, uniqueVisitors: visitorCount });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await visitorService.getAllVisitors();
    res.json(visitors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await visitorService.getAllLocations();
    res.json(locations);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllDevices = async (req, res) => {
  try {
    const devices = await visitorService.getAllDevices();
    res.json(devices);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTotalVisits = async (req, res) => {
  try {
    const result = await visitorService.getTotalVisits();
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
    const trend = await visitorService.getVisitorTrend(projectName, period);
    res.json(trend);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.filterVisitors = async (req, res) => {
  const { device, browser, projectName, startDate, endDate, location } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    const filters = { device, browser, projectName, startDate, endDate, location };
    const pagination = { page, limit };
    
    const result = await visitorService.filterVisitors(filters, pagination);
    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    await visitorService.deleteVisitor(id);
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
    const updatedVisitor = await visitorService.updateVisitor(id, updateData);
    res.json(updatedVisitor);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorStatistics = async (req, res) => {
  const { projectName } = req.params;

  try {
    const statistics = await visitorService.getVisitorStatistics(projectName);
    res.json(statistics);
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
    const visitors = await visitorService.getVisitorByIp(ipAddress);
    res.json(visitors);
  } catch (error) {
    if (error.message === "No visitor found with this IP address") {
      return res.status(404).json({ error: error.message });
    }
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and end date are required" });
  }

  try {
    const result = await visitorService.getVisitorsByDateRange(startDate, endDate);
    res.json(result);
  } catch (error) {
    if (error.message === "Invalid date format. Use YYYY-MM-DD") {
      return res.status(400).json({ error: error.message });
    }
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUniqueVisitorsDaily = async (req, res) => {
  const { projectName } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const result = await visitorService.getUniqueVisitorsDaily(
      projectName,
      startDate,
      endDate
    );
    res.json(result);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// You can add these additional controllers to expose other service methods

exports.getActiveVisitors = async (req, res) => {
  const { minutes } = req.query;
  
  try {
    const activeVisitors = await visitorService.getActiveVisitors(
      minutes ? parseInt(minutes) : 5
    );
    res.json(activeVisitors);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getBrowserOsStats = async (req, res) => {
  try {
    const stats = await visitorService.getBrowserOsStats();
    res.json(stats);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.exportVisitors = async (req, res) => {
  const { format } = req.query;
  
  try {
    const data = await visitorService.exportVisitors(format);
    
    if (format === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment("visitors.csv");
    }
    
    res.send(data);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorGrowth = async (req, res) => {
  try {
    const growth = await visitorService.getVisitorGrowth();
    res.json(growth);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDailyVisitorStats = async (req, res) => {
  const { projectName } = req.params;
  const { days } = req.query;
  
  try {
    const daysToLookBack = parseInt(days) || 7; // Default to 7 days if not specified
    const dailyStats = await visitorService.getDailyVisitorStats(projectName, daysToLookBack);
    res.json(dailyStats);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getVisitorsWithFilters = async (req, res) => {
  try {
    const { projectName } = req.params;
    const {
      startDate,
      endDate,
      country,
      city,
      device,
      browser,
      referrer,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { projectName };

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Location filters
    if (country) filter.country = new RegExp(country, 'i');
    if (city) filter.city = new RegExp(city, 'i');

    // Device/Browser filters
    if (device) filter.device = new RegExp(device, 'i');
    if (browser) filter.browser = new RegExp(browser, 'i');

    // Referrer filter
    if (referrer) filter.referrer = new RegExp(referrer, 'i');

    // Pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with filters
    const [visitors, totalCount] = await Promise.all([
      Visitor.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Visitor.countDocuments(filter)
    ]);

    // Get filter options for frontend
    const filterOptions = await getFilterOptions(projectName);

    res.json({
      visitors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + visitors.length < totalCount,
        hasPrev: page > 1
      },
      filterOptions
    });
  } catch (error) {
    console.error('Error fetching filtered visitors:', error);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
};

const getFilterOptions = async (projectName) => {
  try {
    const options = await Visitor.aggregate([
      { $match: { projectName } },
      {
        $group: {
          _id: null,
          countries: { $addToSet: '$country' },
          cities: { $addToSet: '$city' },
          devices: { $addToSet: '$device' },
          browsers: { $addToSet: '$browser' },
          referrers: { $addToSet: '$referrer' }
        }
      }
    ]);

    return options[0] || {
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
      referrers: []
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {};
  }
};

// Advanced analytics endpoint
const getAdvancedAnalytics = async (req, res) => {
  try {
    const { projectName } = req.params;
    const { startDate, endDate } = req.query;

    const matchStage = { projectName };
    if (startDate && endDate) {
      matchStage.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const analytics = await Visitor.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalVisitors: { $sum: 1 },
          uniqueCountries: { $addToSet: '$country' },
          uniqueCities: { $addToSet: '$city' },
          deviceBreakdown: {
            $push: {
              device: '$device',
              browser: '$browser'
            }
          },
          topReferrers: { $push: '$referrer' },
          hourlyDistribution: {
            $push: { $hour: '$timestamp' }
          }
        }
      },
      {
        $project: {
          totalVisitors: 1,
          uniqueCountriesCount: { $size: '$uniqueCountries' },
          uniqueCitiesCount: { $size: '$uniqueCities' },
          topCountries: '$uniqueCountries',
          topCities: '$uniqueCities',
          deviceStats: '$deviceBreakdown',
          referrerStats: '$topReferrers',
          hourlyStats: '$hourlyDistribution'
        }
      }
    ]);

    res.json(analytics[0] || {});
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  trackVisitor: exports.trackVisitor,
  getVisitorCount: exports.getVisitorCount,
  getAllVisitors: exports.getAllVisitors,
  getAllLocations: exports.getAllLocations,
  getAllDevices: exports.getAllDevices,
  getTotalVisits: exports.getTotalVisits,
  getVisitorTrend: exports.getVisitorTrend,
  filterVisitors: exports.filterVisitors,
  deleteVisitor: exports.deleteVisitor,
  updateVisitorInfo: exports.updateVisitorInfo,
  getVisitorStatistics: exports.getVisitorStatistics,
  getVisitorByIp: exports.getVisitorByIp,
  getVisitorsByDateRange: exports.getVisitorsByDateRange,
  getUniqueVisitorsDaily: exports.getUniqueVisitorsDaily,
  getActiveVisitors: exports.getActiveVisitors,
  getBrowserOsStats: exports.getBrowserOsStats,
  exportVisitors: exports.exportVisitors,
  getVisitorGrowth: exports.getVisitorGrowth,
  getDailyVisitorStats: exports.getDailyVisitorStats,
  getVisitorsWithFilters,
  getFilterOptions,
  getAdvancedAnalytics
};