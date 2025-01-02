const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    website: { type: String, required: true },
    ipAddress: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visitor", visitorSchema);
