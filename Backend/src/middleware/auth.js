const authController = require("../controller/authController");

// Middleware to authenticate access token
const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;



    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No access token provided.",
        debug:
          process.env.NODE_ENV === "production"
            ? {
                cookiesReceived: Object.keys(req.cookies),
                hasCookieHeader: !!req.headers.cookie,
              }
            : undefined,
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
    console.log(" Auth middleware error:", {
      error: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid access token.",
        code: "INVALID_TOKEN",
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
      code: "VERIFICATION_ERROR",
    });
  }
};

const authenticateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    console.log("Refresh token middleware:", {
      hasRefreshToken: !!refreshToken,
      cookiesReceived: Object.keys(req.cookies),
    });

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
        code: "INVALID_REFRESH_TOKEN",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    res.status(500).json({
      success: false,
      message: "Refresh token verification failed.",
      code: "REFRESH_VERIFICATION_ERROR",
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
};
