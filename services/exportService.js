const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Visitor = require('../models/Visitor');

class ExportService {
  async exportToPDF(projectName, filters = {}) {
    const doc = new PDFDocument();
    const visitors = await this.getFilteredData(projectName, filters);
    
    // PDF Header
    doc.fontSize(20).text('Visitor Analytics Report', 50, 50);
    doc.fontSize(14).text(`Project: ${projectName}`, 50, 80);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, 50, 100);
    
    // Summary stats
    doc.text(`Total Visitors: ${visitors.length}`, 50, 130);
    
    // Visitor table
    let yPosition = 160;
    doc.fontSize(10);
    
    // Table headers
    doc.text('Timestamp', 50, yPosition);
    doc.text('Country', 150, yPosition);
    doc.text('City', 220, yPosition);
    doc.text('Device', 290, yPosition);
    doc.text('Browser', 360, yPosition);
    
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(500, yPosition).stroke();
    yPosition += 10;
    
    // Table data
    visitors.slice(0, 50).forEach(visitor => { // Limit to 50 for PDF
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.text(visitor.timestamp.toLocaleDateString(), 50, yPosition);
      doc.text(visitor.country || 'N/A', 150, yPosition);
      doc.text(visitor.city || 'N/A', 220, yPosition);
      doc.text(visitor.device || 'N/A', 290, yPosition);
      doc.text(visitor.browser || 'N/A', 360, yPosition);
      
      yPosition += 15;
    });
    
    return doc;
  }

  async exportToExcel(projectName, filters = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Visitors sheet
    const visitorsSheet = workbook.addWorksheet('Visitors');
    const visitors = await this.getFilteredData(projectName, filters);
    
    visitorsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Visitor ID', key: 'visitorId', width: 15 },
      { header: 'IP Address', key: 'ipAddress', width: 15 },
      { header: 'Country', key: 'country', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Device', key: 'device', width: 15 },
      { header: 'Browser', key: 'browser', width: 15 },
      { header: 'Referrer', key: 'referrer', width: 30 }
    ];

    visitors.forEach(visitor => {
      visitorsSheet.addRow({
        timestamp: visitor.timestamp,
        visitorId: visitor.visitorId,
        ipAddress: visitor.ipAddress,
        country: visitor.country,
        city: visitor.city,
        device: visitor.device,
        browser: visitor.browser,
        referrer: visitor.referrer
      });
    });

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    const stats = await this.getProjectStats(projectName, filters);
    
    summarySheet.addRow(['Metric', 'Value']);
    summarySheet.addRow(['Total Visitors', stats.totalVisitors]);
    summarySheet.addRow(['Top Country', stats.topCountry]);
    summarySheet.addRow(['Top Referrer', stats.topReferrer]);

    return workbook;
  }

  async getFilteredData(projectName, filters) {
    const filter = { projectName };
    
    if (filters.startDate && filters.endDate) {
      filter.timestamp = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.country) filter.country = new RegExp(filters.country, 'i');
    if (filters.city) filter.city = new RegExp(filters.city, 'i');
    
    return await Visitor.find(filter).sort({ timestamp: -1 });
  }

  async getProjectStats(projectName, filters) {
    const visitors = await this.getFilteredData(projectName, filters);
    
    return {
      totalVisitors: visitors.length,
      topCountry: this.getTopValue(visitors, 'country'),
      topReferrer: this.getTopValue(visitors, 'referrer')
    };
  }

  getTopValue(array, field) {
    const counts = {};
    array.forEach(item => {
      const value = item[field];
      if (value) counts[value] = (counts[value] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
  }
}

module.exports = new ExportService();