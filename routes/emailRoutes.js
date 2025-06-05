const express = require('express');
const emailController = require('../controllers/emailController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailRequest:
 *       type: object
 *       required:
 *         - recipients
 *       properties:
 *         recipients:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           description: Array of email addresses
 *           example: ["admin@example.com", "manager@example.com"]
 *     
 *     SchedulerRequest:
 *       type: object
 *       required:
 *         - recipients
 *       properties:
 *         recipients:
 *           type: array
 *           items:
 *             type: string
 *             format: email
 *           description: Array of email addresses
 *           example: ["admin@example.com", "manager@example.com"]
 *         cronExpression:
 *           type: string
 *           description: Cron expression for scheduling
 *           example: "0 9 * * *"
 *           default: "0 9 * * *"
 */

/**
 * @swagger
 * /api/email/insights/send:
 *   post:
 *     summary: Send daily insights email immediately
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Daily insights sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                 summary:
 *                   type: object
 *       400:
 *         description: Bad request - invalid recipients
 *       500:
 *         description: Internal server error
 */
router.post('/insights/send', emailController.sendDailyInsights);

/**
 * @swagger
 * /api/email/insights/test:
 *   post:
 *     summary: Send test daily insights email immediately
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Test insights sent successfully
 *       400:
 *         description: Bad request - invalid recipients
 *       500:
 *         description: Internal server error
 */
router.post('/insights/test', emailController.sendTestInsights);

/**
 * @swagger
 * /api/email/insights/data:
 *   get:
 *     summary: Get daily insights data without sending email
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Daily insights data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/insights/data', emailController.getDailyInsights);

/**
 * @swagger
 * /api/email/test-config:
 *   post:
 *     summary: Test email configuration
 *     tags: [Email]
 *     responses:
 *       200:
 *         description: Email configuration test result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 details:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/test-config', emailController.testEmailConfig);

/**
 * @swagger
 * /api/email/scheduler/start:
 *   post:
 *     summary: Start daily insights email scheduler
 *     tags: [Email Scheduler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchedulerRequest'
 *     responses:
 *       200:
 *         description: Scheduler started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cronExpression:
 *                   type: string
 *                 recipients:
 *                   type: array
 *                 timezone:
 *                   type: string
 *       400:
 *         description: Bad request - invalid parameters
 *       500:
 *         description: Internal server error
 */
router.post('/scheduler/start', emailController.startScheduler);

/**
 * @swagger
 * /api/email/scheduler/stop:
 *   post:
 *     summary: Stop daily insights email scheduler
 *     tags: [Email Scheduler]
 *     responses:
 *       200:
 *         description: Scheduler stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/scheduler/stop', emailController.stopScheduler);

/**
 * @swagger
 * /api/email/scheduler/status:
 *   get:
 *     summary: Get daily insights email scheduler status
 *     tags: [Email Scheduler]
 *     responses:
 *       200:
 *         description: Scheduler status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: object
 *                   properties:
 *                     isRunning:
 *                       type: boolean
 *                     jobExists:
 *                       type: boolean
 *                     nextRun:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.get('/scheduler/status', emailController.getSchedulerStatus);

/**
 * @swagger
 * /api/email/cron-expressions:
 *   get:
 *     summary: Get available cron expressions for scheduling
 *     tags: [Email Scheduler]
 *     responses:
 *       200:
 *         description: Cron expressions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cronExpressions:
 *                   type: object
 *                 examples:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/cron-expressions', emailController.getCronExpressions);

module.exports = router;
