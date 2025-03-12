const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");

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

// ==========================================
// ANALYTICS OPERATIONS
// ==========================================

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all visitor locations
 *     tags: [Visitors]
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
 *     tags: [Visitors]
 *     responses:
 *       200:
 *         description: List of all devices with visitor count
 *       500:
 *         description: Internal server error
 */
router.get("/devices", visitorController.getAllDevices);

module.exports = router;