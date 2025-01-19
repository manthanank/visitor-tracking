const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");

router.post("/visit", visitorController.trackVisitor);
router.get("/visit/:projectName", visitorController.getVisitorCount);
router.get("/visits", visitorController.getAllVisitors);
router.get("/locations", visitorController.getAllLocations);
router.get("/total-visits", visitorController.getTotalVisits);
router.get("/visit-trend/:projectName", visitorController.getVisitorTrend);
router.get("/filter-visit", visitorController.filterVisitors);
router.delete("/visit/:id", visitorController.deleteVisitor);
router.put("/visit/:id", visitorController.updateVisitorInfo);
router.get("/visit-statistics/:projectName", visitorController.getVisitorStatistics);

module.exports = router;