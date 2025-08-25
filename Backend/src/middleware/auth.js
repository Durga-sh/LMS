const authController = require("../controller/authController");

// Middleware to authenticate access token
const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    // Enhanced debug logging for production issues
    console.log("Auth middleware - detailed cookie analysis:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!req.cookies.refreshToken,
      allCookies: req.cookies,
      cookieNames: Object.keys(req.cookies),
      cookieHeader: req.headers.cookie,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers["user-agent"]?.substring(0, 50),
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    if (!accessToken) {
      console.log("❌ No access token found in cookies");
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

    console.log("🔍 Verifying access token...");
    const user = await authController.verifyAccessToken(accessToken);

    if (!user) {
      console.log("❌ Access token verification failed - user not found");
      return res.status(401).json({
        success: false,
        message: "Invalid access token. User not found.",
      });
    }

    console.log("✅ Access token verified for user:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Auth middleware error:", {
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
      console.log("🔄 Access token expired, client should refresh");
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
      console.log("❌ No refresh token found in cookies");
      return res.status(401).json({
        success: false,
        message: "Access denied. No refresh token provided.",
      });
    }

    console.log("🔍 Verifying refresh token...");
    const user = await authController.verifyRefreshToken(refreshToken);

    if (!user) {
      console.log("❌ Refresh token verification failed - user not found");
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. User not found.",
      });
    }

    console.log("✅ Refresh token verified for user:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log("❌ Refresh token middleware error:", error.message);

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
