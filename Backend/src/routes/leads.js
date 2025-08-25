
const express = require("express");
const leadController = require("../controller/leadController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();


router.use(authenticateToken);

router.post("/", leadController.createLead);
router.get("/", leadController.getLeads);
router.get("/stats", leadController.getLeadStats);
router.get("/:id", leadController.getLeadById);
router.put("/:id", leadController.updateLead);
router.delete("/:id", leadController.deleteLead);

module.exports = router;
