const express = require("express");

const authController = require("../controller/authController");
const {
  authenticateToken,
  authenticateRefreshToken,
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.getCurrentUser);
router.post("/refresh", authController.refreshTokens);


module.exports = router;
