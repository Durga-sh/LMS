// Backend/src/routes/leads.js
const express = require("express");
const leadController = require("../controller/leadController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// All lead routes require authentication
router.use(authenticateToken);

// Lead CRUD routes
router.post("/", leadController.createLead);
router.get("/", leadController.getLeads);
router.get("/stats", leadController.getLeadStats); // Stats endpoint before :id to avoid conflict
router.get("/:id", leadController.getLeadById);
router.put("/:id", leadController.updateLead);
router.delete("/:id", leadController.deleteLead);

module.exports = router;
