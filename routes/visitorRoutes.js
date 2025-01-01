const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");

router.post("/visit", visitorController.incrementVisitor);
router.get("/visit/:website", visitorController.getVisitorCount);
router.get("/visits", visitorController.getAllVisitors);

module.exports = router;
