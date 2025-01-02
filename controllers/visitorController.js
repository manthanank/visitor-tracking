const Visitor = require("../models/Visitor");

// Increment visitor count for a website
exports.incrementVisitor = async (req, res) => {
    const { website, projectName } = req.body;
    const ipAddress = req.clientIp;

    if (!website || !projectName) {
        return res.status(400).json({ error: 'Website and Project Name are required' });
    }

    try {
        const existingVisit = await Visitor.findOne({ website, ipAddress, projectName });

        if (!existingVisit) {
            const newVisit = new Visitor({ website, ipAddress, projectName });
            await newVisit.save();
        }

        const visitorCount = await Visitor.countDocuments({ website, projectName });

        res.json({
            message: 'Visitor count updated successfully',
            website,
            projectName,
            uniqueVisitors: visitorCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get visitor count for a specific website
exports.getVisitorCount = async (req, res) => {
    const { website } = req.params;
  
    if (!website) {
        return res.status(400).json({ error: 'Website is required' });
    }
  
    try {
        const visitorCount = await Visitor.countDocuments({ website });
        res.json({ website, uniqueVisitors: visitorCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Get visitor counts for all websites
  exports.getAllVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.aggregate([
            {
                $group: {
                    _id: { website: '$website', projectName: '$projectName' },
                    uniqueVisitors: { $sum: 1 },
                },
            },
        ]);
  
        const result = visitors.map((v) => ({
            website: v._id.website,
            projectName: v._id.projectName,
            uniqueVisitors: v.uniqueVisitors,
        }));
  
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  