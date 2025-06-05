const emailService = require('../services/emailService');
const schedulerService = require('../services/schedulerService');
const logger = require('../middleware/logger');

class EmailController {
  // Send daily insights immediately
  async sendDailyInsights(req, res) {
    try {
      const { recipients } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Recipients array is required and must contain at least one email address'
        });
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email addresses found',
          invalidEmails
        });
      }

      const results = await emailService.sendDailyInsightsToMultiple(recipients);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.json({
        success: successCount > 0,
        message: `Daily insights sent: ${successCount} successful, ${failureCount} failed`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      });
    } catch (error) {
      logger.error('Error in sendDailyInsights controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send daily insights',
        details: error.message
      });
    }
  }

  // Test email configuration
  async testEmailConfig(req, res) {
    try {
      const result = await emailService.testEmailConfiguration();
      
      res.json({
        success: result.success,
        message: result.success ? 'Email configuration is valid' : 'Email configuration test failed',
        details: result.error || result.message
      });
    } catch (error) {
      logger.error('Error in testEmailConfig controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test email configuration',
        details: error.message
      });
    }
  }

  // Start daily insights scheduler
  async startScheduler(req, res) {
    try {
      const { recipients, cronExpression = '0 9 * * *' } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Recipients array is required and must contain at least one email address'
        });
      }

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email addresses found',
          invalidEmails
        });
      }

      const result = await schedulerService.startDailyInsightsScheduler(recipients, cronExpression);
      
      res.json(result);
    } catch (error) {
      logger.error('Error in startScheduler controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start scheduler',
        details: error.message
      });
    }
  }

  // Stop daily insights scheduler
  async stopScheduler(req, res) {
    try {
      const result = await schedulerService.stopDailyInsightsScheduler();
      res.json(result);
    } catch (error) {
      logger.error('Error in stopScheduler controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop scheduler',
        details: error.message
      });
    }
  }

  // Get scheduler status
  async getSchedulerStatus(req, res) {
    try {
      const status = schedulerService.getSchedulerStatus();
      res.json({
        success: true,
        status
      });
    } catch (error) {
      logger.error('Error in getSchedulerStatus controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduler status',
        details: error.message
      });
    }
  }

  // Get available cron expressions
  async getCronExpressions(req, res) {
    try {
      const expressions = schedulerService.constructor.getCronExpressions();
      res.json({
        success: true,
        cronExpressions: expressions,
        examples: {
          'daily-9am': 'Every day at 9:00 AM',
          'daily-8am': 'Every day at 8:00 AM',  
          'daily-6pm': 'Every day at 6:00 PM',
          'weekdays-9am': 'Weekdays at 9:00 AM',
          'weekly-monday': 'Every Monday at 9:00 AM',
          'test-every-minute': 'Every minute (for testing only)'
        }
      });
    } catch (error) {
      logger.error('Error in getCronExpressions controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get cron expressions'
      });
    }
  }

  // Send test insights immediately
  async sendTestInsights(req, res) {
    try {
      const { recipients } = req.body;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Recipients array is required and must contain at least one email address'
        });
      }

      const result = await schedulerService.sendTestInsights(recipients);
      res.json(result);
    } catch (error) {
      logger.error('Error in sendTestInsights controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send test insights',
        details: error.message
      });
    }
  }

  // Get daily insights data without sending email
  async getDailyInsights(req, res) {
    try {
      const insights = await emailService.collectDailyInsights();
      res.json({
        success: true,
        data: insights,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getDailyInsights controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to collect daily insights',
        details: error.message
      });
    }
  }
}

module.exports = new EmailController();
