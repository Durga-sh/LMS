const authController = require("../controller/authController");

// Middleware to authenticate access token
const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No access token provided.",
      });
    }

    const user = await authController.verifyAccessToken(accessToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired. Please refresh your token.",
        code: "TOKEN_EXPIRED",
      });
    }

    res.status(500).json({
      success: false,
      message: "Access token verification failed.",
    });
  }
};

const authenticateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No refresh token provided.",
      });
    }

    const user = await authController.verifyRefreshToken(refreshToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Refresh token verification failed.",
    });
  }
};


module.exports = {
  authenticateToken,
  authenticateRefreshToken,
};
