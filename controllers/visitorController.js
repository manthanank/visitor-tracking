const Visitor = require("../models/Visitor");

exports.incrementVisitor = async (req, res) => {
  const { projectName } = req.body;
  const ipAddress = req.clientIp;
  const userAgent = req.headers["user-agent"];

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const existingVisit = await Visitor.findOne({ ipAddress, projectName });

    if (!existingVisit) {
      const newVisit = new Visitor({ ipAddress, projectName, userAgent });
      await newVisit.save();
    } else {
      existingVisit.lastVisit = new Date();
      existingVisit.userAgent = userAgent;
      await existingVisit.save();
    }

    const visitorCount = await Visitor.countDocuments({ projectName });

    res.json({
      message: "Visitor count updated successfully",
      projectName,
      uniqueVisitors: visitorCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getVisitorCount = async (req, res) => {
  const { projectName } = req.params;

  if (!projectName) {
    return res.status(400).json({ error: "Project Name is required" });
  }

  try {
    const visitorCount = await Visitor.countDocuments({ projectName });
    res.json({ projectName, uniqueVisitors: visitorCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.aggregate([
      {
        $group: {
          _id: { projectName: "$projectName" },
          uniqueVisitors: { $sum: 1 },
        },
      },
    ]);

    const result = visitors.map((v) => ({
      projectName: v._id.projectName,
      uniqueVisitors: v.uniqueVisitors,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
