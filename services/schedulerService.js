const cron = require('node-cron');
const emailService = require('./emailService');
const logger = require('../middleware/logger');

class SchedulerService {
  constructor() {
    this.dailyInsightsJob = null;
    this.isSchedulerRunning = false;
  }

  startDailyInsightsScheduler(recipients = [], cronExpression = '0 9 * * *') {
    try {
      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        throw new Error('Invalid cron expression');
      }

      // Stop existing scheduler if running
      this.stopDailyInsightsScheduler();

      // Create new scheduled job
      this.dailyInsightsJob = cron.schedule(cronExpression, async () => {
        logger.info('Starting daily insights email job');
        
        try {
          const emailRecipients = recipients.length > 0 
            ? recipients 
            : [process.env.DEFAULT_EMAIL_RECIPIENT].filter(Boolean);

          if (emailRecipients.length === 0) {
            logger.warn('No email recipients configured for daily insights');
            return;
          }

          const results = await emailService.sendDailyInsightsToMultiple(emailRecipients);
          
          const successCount = results.filter(r => r.success).length;
          const failureCount = results.filter(r => !r.success).length;

          logger.info(`Daily insights job completed: ${successCount} successful, ${failureCount} failed`);
          
          if (failureCount > 0) {
            const failures = results.filter(r => !r.success);
            logger.error('Failed email deliveries:', failures);
          }
        } catch (error) {
          logger.error('Error in daily insights scheduled job:', error);
        }
      }, {
        scheduled: false,
        timezone: process.env.TIMEZONE || 'UTC'
      });

      // Start the job
      this.dailyInsightsJob.start();
      this.isSchedulerRunning = true;

      logger.info(`Daily insights scheduler started with cron expression: ${cronExpression}`);
      logger.info(`Recipients: ${recipients.join(', ')}`);
      logger.info(`Timezone: ${process.env.TIMEZONE || 'UTC'}`);

      return {
        success: true,
        message: 'Daily insights scheduler started successfully',
        cronExpression,
        recipients,
        timezone: process.env.TIMEZONE || 'UTC'
      };
    } catch (error) {
      logger.error('Error starting daily insights scheduler:', error);
      throw error;
    }
  }

  stopDailyInsightsScheduler() {
    try {
      if (this.dailyInsightsJob) {
        this.dailyInsightsJob.stop();
        this.dailyInsightsJob.destroy();
        this.dailyInsightsJob = null;
        this.isSchedulerRunning = false;
        logger.info('Daily insights scheduler stopped');
      }
      
      return {
        success: true,
        message: 'Daily insights scheduler stopped successfully'
      };
    } catch (error) {
      logger.error('Error stopping daily insights scheduler:', error);
      throw error;
    }
  }

  getSchedulerStatus() {
    return {
      isRunning: this.isSchedulerRunning,
      jobExists: this.dailyInsightsJob !== null,
      nextRun: this.dailyInsightsJob ? 'Check logs for next execution time' : null
    };
  }

  // Predefined cron expressions for common schedules
  static getCronExpressions() {
    return {
      'daily-9am': '0 9 * * *',        // Every day at 9:00 AM
      'daily-8am': '0 8 * * *',        // Every day at 8:00 AM
      'daily-6pm': '0 18 * * *',       // Every day at 6:00 PM
      'weekdays-9am': '0 9 * * 1-5',   // Weekdays at 9:00 AM
      'weekly-monday': '0 9 * * 1',     // Every Monday at 9:00 AM
      'test-every-minute': '* * * * *'  // Every minute (for testing only)
    };
  }

  // Test function to send insights immediately
  async sendTestInsights(recipients) {
    try {
      logger.info('Sending test daily insights');
      
      const emailRecipients = recipients && recipients.length > 0 
        ? recipients 
        : [process.env.DEFAULT_EMAIL_RECIPIENT].filter(Boolean);

      if (emailRecipients.length === 0) {
        throw new Error('No email recipients provided for test insights');
      }

      const results = await emailService.sendDailyInsightsToMultiple(emailRecipients);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      logger.info(`Test insights completed: ${successCount} successful, ${failureCount} failed`);
      
      return {
        success: successCount > 0,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      logger.error('Error sending test insights:', error);
      throw error;
    }
  }

  // Configure default scheduler based on environment variables
  configureDefaultScheduler() {
    try {
      const recipients = process.env.EMAIL_RECIPIENTS 
        ? process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim())
        : [];
      
      const cronExpression = process.env.DAILY_INSIGHTS_CRON || '0 9 * * *';
      
      if (recipients.length > 0) {
        logger.info('Starting scheduler with recipients:', recipients);
        return this.startDailyInsightsScheduler(recipients, cronExpression);
      } else {
        logger.warn('No email recipients configured in environment variables. Scheduler not started.');
        logger.info('Available environment variables:', {
          emailRecipientsSet: !!process.env.EMAIL_RECIPIENTS,
          emailUserSet: !!process.env.EMAIL_USER,
          emailPasswordSet: !!process.env.EMAIL_PASSWORD
        });
        return {
          success: false,
          message: 'No email recipients configured'
        };
      }
    } catch (error) {
      logger.error('Error configuring default scheduler:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = new SchedulerService();
