const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    lastVisit: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);
