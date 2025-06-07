const exportService = require('../services/exportService');

const exportPDF = async (req, res) => {
  try {
    const { projectName } = req.params;
    const filters = req.query;
    
    const doc = await exportService.exportToPDF(projectName, filters);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}-report.pdf"`);
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
};

const exportExcel = async (req, res) => {
  try {
    const { projectName } = req.params;
    const filters = req.query;
    
    const workbook = await exportService.exportToExcel(projectName, filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}-report.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
};

module.exports = {
  exportPDF,
  exportExcel
};