const nodemailer = require('nodemailer');
const visitorService = require('./visitorService');
const logger = require('../middleware/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Log configuration (without password) for debugging
      logger.info('Initializing email transporter with config:', {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        passwordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
      });

      // Fix: Change createTransporter to createTransport
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async generateDailyInsightHTML(data) {
    const {
      totalVisitors,
      yesterdayVisitors,
      topLocations,
      topDevices,
      topBrowsers,
      projectStats,
      dailyTrend,
      growth
    } = data;

    // Helper function to format numbers with commas
    const formatNumber = (num) => num.toLocaleString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Visitor Insights</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        
        /* Add spacing between sections */
        .section-divider {
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            margin: 40px 0;
            border-radius: 1px;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 25px; /* Increased gap */
            margin-bottom: 40px; /* Increased margin */
        }
        .stat-card {
            background: #f8f9fa;
            padding: 25px; /* Increased padding */
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #667eea;
            transition: transform 0.2s ease;
            margin-bottom: 20px; /* Added bottom margin */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin: 0 0 10px 0; /* Added bottom margin */
        }
        .stat-label {
            color: #666;
            margin: 0;
            font-size: 14px;
            font-weight: 500;
        }
        .section {
            margin-bottom: 35px; /* Increased margin */
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 12px; /* Increased padding */
            margin-bottom: 25px; /* Increased margin */
            font-size: 20px;
        }
        .top-list {
            background: #f8f9fa;
            padding: 25px; /* Increased padding */
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .top-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0; /* Increased padding */
            border-bottom: 1px dashed #dee2e6; /* Changed to dashed */
            position: relative;
        }
        .top-item:last-child {
            border-bottom: none;
        }
        .top-item:hover {
            background-color: rgba(102, 126, 234, 0.05);
            border-radius: 4px;
            margin: 0 -10px;
            padding: 15px 10px;
        }
        
        /* Add visual indicators */
        .top-item::before {
            content: "—";
            color: #667eea;
            font-weight: bold;
            margin-right: 10px;
            position: absolute;
            left: -15px;
        }
        
        .growth-positive {
            color: #28a745;
        }
        .growth-negative {
            color: #dc3545;
        }
        .footer {
            background: #f8f9fa;
            padding: 25px; /* Increased padding */
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 2px dashed #dee2e6; /* Added dashed border */
        }
        .trend-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0; /* Increased padding */
            border-bottom: 1px dotted #dee2e6; /* Changed to dotted */
            position: relative;
        }
        .trend-item:last-child {
            border-bottom: none;
        }
        
        /* Add day indicators */
        .trend-item::before {
            content: "📅";
            margin-right: 10px;
            position: absolute;
            left: -20px;
        }
        
        /* Add section spacing helpers */
        .section-gap {
            height: 30px;
        }
        
        /* Improve visual hierarchy */
        .item-name {
            font-weight: 500;
            color: #333;
        }
        
        .item-value {
            font-weight: 600;
            color: #667eea;
        }
        
        /* Add styling for separator spans */
        .item-separator {
            color: #ccc;
            margin: 0 8px;
            font-weight: 300;
            opacity: 0.7;
        }
        
        /* Add visual separators for better readability */
        .visual-separator {
            text-align: center;
            margin: 30px 0;
            color: #ccc;
            font-size: 18px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 20px;
            }
            .stat-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .section {
                margin-bottom: 30px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Daily Visitor Insights</h1>
            <p>${new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>
        
        <div class="content">
            <!-- Stats Overview Section -->
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-number">${formatNumber(totalVisitors)}</div>
                    <div class="stat-label">Total Unique Visitors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${formatNumber(yesterdayVisitors)}</div>
                    <div class="stat-label">Yesterday's Visitors</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number ${growth >= 0 ? 'growth-positive' : 'growth-negative'}">
                        ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                    </div>
                    <div class="stat-label">Growth Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${projectStats.length}</div>
                    <div class="stat-label">Active Projects</div>
                </div>
            </div>

            <!-- Section Divider -->
            <div class="section-divider"></div>

            <!-- Top Locations Section -->
            <div class="section">
                <h2>🌍 Top Locations</h2>
                <div class="top-list">
                    ${topLocations.length > 0 ? topLocations.map((location, index) => `
                        <div class="top-item">
                            <span class="item-name">${index + 1}. ${location.location}</span>
                            <span class="item-separator"> - </span>
                            <strong class="item-value">${formatNumber(location.visitorCount)} visitors</strong>
                        </div>
                    `).join('') : '<div class="top-item"><span class="item-name">No location data available</span><span class="item-value">— —</span></div>'}
                </div>
            </div>

            <!-- Visual Separator -->
            <div class="visual-separator">• • •</div>

            <!-- Top Devices Section -->
            <div class="section">
                <h2>📱 Top Devices</h2>
                <div class="top-list">
                    ${topDevices.length > 0 ? topDevices.map((device, index) => `
                        <div class="top-item">
                            <span class="item-name">${index + 1}. ${device.device}</span>
                            <span class="item-separator"> - </span>
                            <strong class="item-value">${formatNumber(device.visitorCount)} visitors</strong>
                        </div>
                    `).join('') : '<div class="top-item"><span class="item-name">No device data available</span><span class="item-value">— —</span></div>'}
                </div>
            </div>

            <!-- Visual Separator -->
            <div class="visual-separator">• • •</div>

            <!-- Top Browsers Section -->
            <div class="section">
                <h2>🌐 Top Browsers</h2>
                <div class="top-list">
                    ${topBrowsers.length > 0 ? topBrowsers.map((browser, index) => `
                        <div class="top-item">
                            <span class="item-name">${index + 1}. ${browser._id}</span>
                            <span class="item-separator"> - </span>
                            <strong class="item-value">${formatNumber(browser.count)} visitors</strong>
                        </div>
                    `).join('') : '<div class="top-item"><span class="item-name">No browser data available</span><span class="item-value">— —</span></div>'}
                </div>
            </div>

            <!-- Section Divider -->
            <div class="section-divider"></div>

            <!-- Project Statistics Section -->
            <div class="section">
                <h2>📈 Project Statistics</h2>
                <div class="top-list">
                    ${projectStats.length > 0 ? projectStats.map((project, index) => `
                        <div class="top-item">
                            <span class="item-name">${index + 1}. ${project.projectName}</span>
                            <span class="item-separator"> - </span>
                            <strong class="item-value">${formatNumber(project.uniqueVisitors)} unique visitors</strong>
                        </div>
                    `).join('') : '<div class="top-item"><span class="item-name">No project data available</span><span class="item-value">— —</span></div>'}
                </div>
            </div>

            <!-- Visual Separator -->
            <div class="visual-separator">- - - - -</div>

            <!-- 7-Day Trend Section -->
            <div class="section">
                <h2>📊 7-Day Visitor Trend</h2>
                <div class="top-list">
                    ${dailyTrend.length > 0 ? dailyTrend.map(day => `
                        <div class="trend-item">
                            <span class="item-name">${new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                            <span class="item-separator"> - </span>
                            <strong class="item-value">${formatNumber(day.uniqueVisitors)} visitors</strong>
                        </div>
                    `).join('') : '<div class="trend-item"><span class="item-name">No trend data available</span><span class="item-value">— —</span></div>'}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>📧 Visitor Tracking System</strong></p>
            <p>This is an automated daily report from your analytics dashboard.</p>
            <p>Generated on ${new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}</p>
        </div>
    </div>
</body>
</html>`;
  }

  async collectDailyInsights() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
      const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split('T')[0];

      // Get total unique visitors
      const totalVisitors = await visitorService.getVisitorCount('All');

      // Get yesterday's visitors
      const yesterdayData = await visitorService.getVisitorsByDateRange(yesterdayStr, yesterdayStr);
      const yesterdayVisitors = yesterdayData.visitorCount;

      // Get day before yesterday's visitors for growth calculation
      const dayBeforeData = await visitorService.getVisitorsByDateRange(dayBeforeYesterdayStr, dayBeforeYesterdayStr);
      const dayBeforeVisitors = dayBeforeData.visitorCount;

      // Calculate growth rate
      const growth = dayBeforeVisitors > 0 
        ? ((yesterdayVisitors - dayBeforeVisitors) / dayBeforeVisitors) * 100 
        : 0;

      // Get top locations
      const topLocations = await visitorService.getAllLocations();
      const sortedLocations = topLocations
        .sort((a, b) => b.visitorCount - a.visitorCount)
        .slice(0, 5);

      // Get top devices
      const topDevices = await visitorService.getAllDevices();
      const sortedDevices = topDevices
        .sort((a, b) => b.visitorCount - a.visitorCount)
        .slice(0, 5);

      // Get browser stats
      const { browserStats } = await visitorService.getBrowserOsStats();
      const topBrowsers = browserStats
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get project statistics
      const projectStats = await visitorService.getTotalVisits();

      // Get 7-day trend
      const dailyStats = await visitorService.getDailyVisitorStats('All', 7);
      const dailyTrend = dailyStats.dailyStats;

      return {
        totalVisitors,
        yesterdayVisitors,
        topLocations: sortedLocations,
        topDevices: sortedDevices,
        topBrowsers,
        projectStats,
        dailyTrend,
        growth
      };
    } catch (error) {
      logger.error('Error collecting daily insights:', error);
      throw error;
    }
  }

  async sendDailyInsights(recipientEmail) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized. Check email configuration.');
      }

      const insights = await this.collectDailyInsights();
      const htmlContent = await this.generateDailyInsightHTML(insights);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `📊 Daily Visitor Insights - ${new Date().toLocaleDateString()}`,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Daily insights email sent successfully to ${recipientEmail}`, {
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId,
        recipient: recipientEmail
      };
    } catch (error) {
      logger.error('Error sending daily insights email:', error);
      throw error;
    }
  }

  async sendDailyInsightsToMultiple(recipients) {
    const results = [];
    
    for (const email of recipients) {
      try {
        const result = await this.sendDailyInsights(email);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          recipient: email
        });
      }
    }

    return results;
  }

  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      logger.info('Testing email configuration...');
      logger.info('Email config check:', {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        passwordSet: !!process.env.EMAIL_PASSWORD,
        passwordLength: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
      });
      
      // Test the connection
      await this.transporter.verify();
      logger.info('Email configuration test successful');
      
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      logger.error('Email configuration test failed:', {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      
      return { 
        success: false, 
        error: error.message,
        code: error.code,
        details: this.getErrorSuggestion(error)
      };
    }
  }

  getErrorSuggestion(error) {
    if (error.code === 'EAUTH') {
      return 'GMAIL AUTHENTICATION FAILED:\n' +
             '1. Ensure 2-Factor Authentication is enabled on your Gmail account\n' +
             '2. Generate a NEW App Password at: https://myaccount.google.com/apppasswords\n' +
             '3. Select "Mail" app and "Other" device, name it "Visitor Tracking"\n' +
             '4. Copy the 16-character password (remove spaces) to your .env file\n' +
             '5. Restart your server after updating .env\n' +
             'Current password length: ' + (process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
    }
    if (error.code === 'ENOTFOUND') {
      return 'Network connection issue. Check your internet connection.';
    }
    if (error.code === 'ECONNECTION') {
      return 'Connection refused. Check if the email service is accessible.';
    }
    return 'Please check your email configuration settings.';
  }
}

module.exports = new EmailService();
