const nodemailer = require('nodemailer');
const Visitor = require('../models/Visitor');
const Session = require('../models/Session');

class AlertService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Alert thresholds
    this.thresholds = {
      trafficSpike: 200, // 200% increase
      highTraffic: 1000, // visitors per hour
      lowTraffic: 5, // minimum visitors per hour
      sessionDrop: 50 // 50% decrease in sessions
    };
  }

  async checkTrafficSpikes() {
    try {
      const projects = await Visitor.distinct('projectName');
      
      for (const projectName of projects) {
        const currentHour = new Date();
        currentHour.setMinutes(0, 0, 0);
        
        const lastHour = new Date(currentHour);
        lastHour.setHours(lastHour.getHours() - 1);
        
        const previousHour = new Date(lastHour);
        previousHour.setHours(previousHour.getHours() - 1);
        
        // Get visitor counts for comparison
        const [currentCount, lastCount, previousCount] = await Promise.all([
          this.getVisitorCount(projectName, currentHour, new Date()),
          this.getVisitorCount(projectName, lastHour, currentHour),
          this.getVisitorCount(projectName, previousHour, lastHour)
        ]);
        
        const avgPrevious = (lastCount + previousCount) / 2;
        
        // Check for traffic spike
        if (avgPrevious > 0 && currentCount > avgPrevious * (1 + this.thresholds.trafficSpike / 100)) {
          await this.sendTrafficAlert(projectName, 'spike', {
            current: currentCount,
            average: avgPrevious,
            increase: ((currentCount - avgPrevious) / avgPrevious * 100).toFixed(1)
          });
        }
        
        // Check for high traffic
        if (currentCount > this.thresholds.highTraffic) {
          await this.sendTrafficAlert(projectName, 'high', { count: currentCount });
        }
        
        // Check for unusually low traffic
        if (avgPrevious > this.thresholds.lowTraffic && currentCount < this.thresholds.lowTraffic) {
          await this.sendTrafficAlert(projectName, 'low', {
            current: currentCount,
            expected: avgPrevious
          });
        }
      }
    } catch (error) {
      console.error('Error checking traffic spikes:', error);
    }
  }

  async checkSessionHealth() {
    try {
      const projects = await Session.distinct('projectName');
      
      for (const projectName of projects) {
        const currentHour = new Date();
        currentHour.setMinutes(0, 0, 0);
        
        const lastHour = new Date(currentHour);
        lastHour.setHours(lastHour.getHours() - 1);
        
        const [currentSessions, lastSessions] = await Promise.all([
          Session.countDocuments({
            projectName,
            startTime: { $gte: currentHour }
          }),
          Session.countDocuments({
            projectName,
            startTime: { $gte: lastHour, $lt: currentHour }
          })
        ]);
        
        // Check for session drop
        if (lastSessions > 0 && currentSessions < lastSessions * (1 - this.thresholds.sessionDrop / 100)) {
          await this.sendSessionAlert(projectName, {
            current: currentSessions,
            previous: lastSessions,
            decrease: ((lastSessions - currentSessions) / lastSessions * 100).toFixed(1)
          });
        }
      }
    } catch (error) {
      console.error('Error checking session health:', error);
    }
  }

  async getVisitorCount(projectName, startTime, endTime) {
    return await Visitor.countDocuments({
      projectName,
      timestamp: { $gte: startTime, $lt: endTime }
    });
  }

  async sendTrafficAlert(projectName, type, data) {
    const subject = `Traffic Alert: ${type.toUpperCase()} traffic detected for ${projectName}`;
    let message = '';
    
    switch (type) {
      case 'spike':
        message = `Traffic spike detected!\nCurrent: ${data.current} visitors\nAverage: ${data.average} visitors\nIncrease: ${data.increase}%`;
        break;
      case 'high':
        message = `High traffic alert!\nCurrent: ${data.count} visitors in the last hour`;
        break;
      case 'low':
        message = `Low traffic alert!\nCurrent: ${data.current} visitors\nExpected: ${data.expected} visitors`;
        break;
    }
    
    await this.sendEmail(subject, message);
  }

  async sendSessionAlert(projectName, data) {
    const subject = `Session Alert: Significant drop in sessions for ${projectName}`;
    const message = `Session drop detected!\nCurrent hour: ${data.current} sessions\nPrevious hour: ${data.previous} sessions\nDecrease: ${data.decrease}%`;
    
    await this.sendEmail(subject, message);
  }

  async sendEmail(subject, message) {
    try {
      const recipients = process.env.ALERT_EMAILS?.split(',') || [];
      
      if (recipients.length === 0) {
        console.log('No alert email recipients configured');
        return;
      }
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: recipients.join(','),
        subject,
        text: message,
        html: `<pre>${message}</pre>`
      });
      
      console.log(`Alert sent: ${subject}`);
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }

  startMonitoring() {
    // Check every 15 minutes
    setInterval(() => {
      this.checkTrafficSpikes();
      this.checkSessionHealth();
    }, 15 * 60 * 1000);
    
    console.log('Alert monitoring started');
  }
}

module.exports = new AlertService();