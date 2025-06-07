const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");
const exportController = require('../controllers/exportController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Visitor:
 *       type: object
 *       required:
 *         - ipAddress
 *         - projectName
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated unique ID
 *         ipAddress:
 *           type: string
 *           description: IP address of the visitor
 *         projectName:
 *           type: string
 *           description: Name of the project being visited
 *         userAgent:
 *           type: string
 *           description: User agent information
 *         location:
 *           type: string
 *           description: Visitor's location
 *         device:
 *           type: string
 *           description: Device used by the visitor
 *         browser:
 *           type: string
 *           description: Browser used by the visitor
 *         lastVisit:
 *           type: string
 *           format: date-time
 *           description: Date and time of the last visit
 *     
 *     FilterOptions:
 *       type: object
 *       properties:
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *         cities:
 *           type: array
 *           items:
 *             type: string
 *         devices:
 *           type: array
 *           items:
 *             type: string
 *         browsers:
 *           type: array
 *           items:
 *             type: string
 *         referrers:
 *           type: array
 *           items:
 *             type: string
 *     
 *     AdvancedAnalytics:
 *       type: object
 *       properties:
 *         totalVisitors:
 *           type: integer
 *         uniqueCountriesCount:
 *           type: integer
 *         uniqueCitiesCount:
 *           type: integer
 *         topCountries:
 *           type: array
 *           items:
 *             type: string
 *         topCities:
 *           type: array
 *           items:
 *             type: string
 *         deviceStats:
 *           type: array
 *           items:
 *             type: object
 *         referrerStats:
 *           type: array
 *           items:
 *             type: string
 *         hourlyStats:
 *           type: array
 *           items:
 *             type: integer
 *
 *     SessionRequest:
 *       type: object
 *       required:
 *         - projectName
 *         - action
 *       properties:
 *         projectName:
 *           type: string
 *           description: Name of the project
 *         action:
 *           type: string
 *           enum: [start, pageview, end]
 *           description: Session action to perform
 *         sessionId:
 *           type: string
 *           description: Session ID (required for pageview and end actions)
 *         url:
 *           type: string
 *           description: Page URL (required for pageview action)
 *         visitorId:
 *           type: string
 *           description: Visitor ID (optional, defaults to 'anonymous')
 *
 *     SessionStats:
 *       type: object
 *       properties:
 *         totalSessions:
 *           type: integer
 *           description: Total number of sessions
 *         avgDuration:
 *           type: number
 *           description: Average session duration in seconds
 *         avgPageViews:
 *           type: number
 *           description: Average page views per session
 *         totalPageViews:
 *           type: integer
 *           description: Total page views across all sessions
 *
 *     FilteredVisitorsResponse:
 *       type: object
 *       properties:
 *         visitors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Visitor'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalCount:
 *               type: integer
 *             hasNext:
 *               type: boolean
 *             hasPrev:
 *               type: boolean
 *         filterOptions:
 *           $ref: '#/components/schemas/FilterOptions'
 */

// ==========================================
// CORE VISITOR TRACKING OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/visit:
 *   post:
 *     summary: Track a visitor
 *     tags: [Visitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Visitor count updated successfully
 *       400:
 *         description: Project Name is required
 *       500:
 *         description: Internal server error
 */
router.post("/visit", visitorController.trackVisitor);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Get all visitors
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: List of all visitors
 *       500:
 *         description: Internal server error
 */
router.get("/visits", visitorController.getAllVisitors);

/**
 * @swagger
 * /api/visit/{id}:
 *   put:
 *     summary: Update visitor information
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the visitor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Visitor'
 *     responses:
 *       200:
 *         description: Updated visitor data
 *       500:
 *         description: Internal server error
 */
router.put("/visit/:id", visitorController.updateVisitorInfo);

/**
 * @swagger
 * /api/visit/{id}:
 *   delete:
 *     summary: Delete a visitor
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the visitor
 *     responses:
 *       200:
 *         description: Visitor deleted successfully
 *       500:
 *         description: Internal server error
 */
router.delete("/visit/:id", visitorController.deleteVisitor);

// ==========================================
// FILTERING AND SEARCHING OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/filter-visit:
 *   get:
 *     summary: Filter visitors by various parameters
 *     tags: [Visitors]
 *     parameters:
 *       - in: query
 *         name: device
 *         schema:
 *           type: string
 *         description: Device type filter
 *       - in: query
 *         name: browser
 *         schema:
 *           type: string
 *         description: Browser type filter
 *       - in: query
 *         name: projectName
 *         schema:
 *           type: string
 *         description: Project name filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter (YYYY-MM-DD)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Filtered visitor data with pagination
 *       500:
 *         description: Internal server error
 */
router.get("/filter-visit", visitorController.filterVisitors);

/**
 * @swagger
 * /api/visit-ip/{ipAddress}:
 *   get:
 *     summary: Get visitor by IP address
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: ipAddress
 *         schema:
 *           type: string
 *         required: true
 *         description: IP address of visitor
 *     responses:
 *       200:
 *         description: Visitor data
 *       400:
 *         description: IP Address is required
 *       404:
 *         description: No visitor found with this IP address
 *       500:
 *         description: Internal server error
 */
router.get("/visit-ip/:ipAddress", visitorController.getVisitorByIp);

/**
 * @swagger
 * /api/visits-by-date:
 *   get:
 *     summary: Get visitors by date range
 *     tags: [Visitors]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Visitors in date range
 *       400:
 *         description: Start date and end date are required or Invalid date format
 *       500:
 *         description: Internal server error
 */
router.get("/visits-by-date", visitorController.getVisitorsByDateRange);

// ==========================================
// PROJECT-SPECIFIC OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/visit/{projectName}:
 *   get:
 *     summary: Get visitor count for a project
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *     responses:
 *       200:
 *         description: Returns visitor count
 *       400:
 *         description: Project Name is required
 *       500:
 *         description: Internal server error
 */
router.get("/visit/:projectName", visitorController.getVisitorCount);

/**
 * @swagger
 * /api/total-visits:
 *   get:
 *     summary: Get total visits by project
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: Total visits grouped by project
 *       500:
 *         description: Internal server error
 */
router.get("/total-visits", visitorController.getTotalVisits);

/**
 * @swagger
 * /api/visit-trend/{projectName}:
 *   get:
 *     summary: Get visitor trend for a project
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Time period for trend analysis
 *     responses:
 *       200:
 *         description: Visitor trend data
 *       500:
 *         description: Internal server error
 */
router.get("/visit-trend/:projectName", visitorController.getVisitorTrend);

/**
 * @swagger
 * /api/visit-statistics/{projectName}:
 *   get:
 *     summary: Get visitor statistics for a project
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *     responses:
 *       200:
 *         description: Visitor statistics
 *       500:
 *         description: Internal server error
 */
router.get("/visit-statistics/:projectName", visitorController.getVisitorStatistics);

/**
 * @swagger
 * /api/unique-visitors-daily/{projectName}:
 *   get:
 *     summary: Get unique visitors per day (Daily Active Users - DAU)
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project or "All" for all projects
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD). Defaults to 30 days ago if not provided
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD). Defaults to today if not provided
 *     responses:
 *       200:
 *         description: Daily unique visitors data
 *       500:
 *         description: Internal server error
 */
router.get("/unique-visitors-daily/:projectName", visitorController.getUniqueVisitorsDaily);

/**
 * @swagger
 * /api/daily-stats/{projectName}:
 *   get:
 *     summary: Get daily visitor statistics for a project
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project or "All" for all projects
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Daily visitor statistics
 *       500:
 *         description: Internal server error
 */
router.get("/daily-stats/:projectName", visitorController.getDailyVisitorStats);

// ==========================================
// ANALYTICS OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all visitor locations
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of all locations with visitor count
 *       500:
 *         description: Internal server error
 */
router.get("/locations", visitorController.getAllLocations);

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all visitor devices
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: List of all devices with visitor count
 *       500:
 *         description: Internal server error
 */
router.get("/devices", visitorController.getAllDevices);

/**
 * @swagger
 * /api/active-visitors:
 *   get:
 *     summary: Get currently active visitors
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: minutes
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Time window in minutes to consider a visitor active
 *     responses:
 *       200:
 *         description: List of active visitors
 *       500:
 *         description: Internal server error
 */
router.get("/active-visitors", visitorController.getActiveVisitors);

/**
 * @swagger
 * /api/browser-os-stats:
 *   get:
 *     summary: Get browser and OS statistics
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Browser and OS usage statistics
 *       500:
 *         description: Internal server error
 */
router.get("/browser-os-stats", visitorController.getBrowserOsStats);

/**
 * @swagger
 * /api/export-visitors:
 *   get:
 *     summary: Export visitors data
 *     tags: [Export]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *     responses:
 *       200:
 *         description: Exported visitor data
 *       500:
 *         description: Internal server error
 */
router.get("/export-visitors", visitorController.exportVisitors);

/**
 * @swagger
 * /api/visitor-growth:
 *   get:
 *     summary: Get visitor growth over time
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Monthly visitor growth data
 *       500:
 *         description: Internal server error
 */
router.get("/visitor-growth", visitorController.getVisitorGrowth);

// ==========================================
// ENHANCED FILTERING AND ANALYTICS
// ==========================================

/**
 * @swagger
 * /api/{projectName}/visitors/filtered:
 *   get:
 *     summary: Get filtered visitors with advanced options
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter
 *       - in: query
 *         name: device
 *         schema:
 *           type: string
 *         description: Device filter
 *       - in: query
 *         name: browser
 *         schema:
 *           type: string
 *         description: Browser filter
 *       - in: query
 *         name: referrer
 *         schema:
 *           type: string
 *         description: Referrer filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: timestamp
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Filtered visitors with pagination and filter options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilteredVisitorsResponse'
 *       500:
 *         description: Failed to fetch visitors
 */
router.get('/:projectName/visitors/filtered', visitorController.getVisitorsWithFilters);

/**
 * @swagger
 * /api/{projectName}/analytics/advanced:
 *   get:
 *     summary: Get advanced analytics for a project
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Advanced analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdvancedAnalytics'
 *       500:
 *         description: Failed to fetch analytics
 */
router.get('/:projectName/analytics/advanced', visitorController.getAdvancedAnalytics);

/**
 * @swagger
 * /api/{projectName}/filter-options:
 *   get:
 *     summary: Get available filter options for a project
 *     tags: [Visitors]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *     responses:
 *       200:
 *         description: Available filter options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FilterOptions'
 *       500:
 *         description: Failed to fetch filter options
 */
router.get('/:projectName/filter-options', visitorController.getFilterOptions);

// ==========================================
// EXPORT OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/{projectName}/export/pdf:
 *   get:
 *     summary: Export project data as PDF
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export (YYYY-MM-DD)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter for export
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter for export
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to export PDF
 */
router.get('/:projectName/export/pdf', exportController.exportPDF);

/**
 * @swagger
 * /api/{projectName}/export/excel:
 *   get:
 *     summary: Export project data as Excel
 *     tags: [Export]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the project
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export (YYYY-MM-DD)
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Country filter for export
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City filter for export
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Failed to export Excel
 */
router.get('/:projectName/export/excel', exportController.exportExcel);

module.exports = router;