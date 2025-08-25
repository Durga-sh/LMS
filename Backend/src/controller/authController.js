const jwt = require("jsonwebtoken");
const User = require("../model/User");

class AuthController {
  generateAccessToken(userId) {
    return jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
  }

  setTokenCookies(res, accessToken, refreshToken) {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };
    console.log("Setting cookies with options:", {
      isProduction,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly,
      domain: isProduction ? undefined : undefined, 
    });

  
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

 
    if (isProduction) {
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Vary", "Origin");
    }
  }

  clearTokenCookies(res) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
  }

  validateRegistration({ name, email, password }) {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push("Name is required");
    } else if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Please provide a valid email address");
      }
    }
    if (!password) {
      errors.push("Password is required");
    } else {
      if (password.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push("Password must contain at least one number");
      }
    }

    return errors;
  }

  validateLogin({ email, password }) {
    const errors = [];


    if (!email || email.trim().length === 0) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Please provide a valid email address");
      }
    }
    if (!password || password.trim().length === 0) {
      errors.push("Password is required");
    }

    return errors;
  }

  register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const validationErrors = this.validateRegistration({
        name,
        email,
        password,
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      const user = new User({ name, email, password });
      await user.save();

      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      this.setTokenCookies(res, accessToken, refreshToken);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const validationErrors = this.validateLogin({ email, password });
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const accessToken = this.generateAccessToken(user._id);
      const refreshToken = this.generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      await user.save();

      this.setTokenCookies(res, accessToken, refreshToken);
      if (process.env.NODE_ENV === "production") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  logout = async (req, res) => {
    try {
      if (req.user) {
        req.user.refreshToken = null;
        await req.user.save();
      }

      this.clearTokenCookies(res);
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getCurrentUser = async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  verifyAccessToken = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      const user = await User.findById(decoded.userId);
      return user;
    } catch (error) {
      throw error;
    }
  };

  verifyRefreshToken = async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      const user = await User.findById(decoded.userId);
      if (user && user.refreshToken !== token) {
        throw new Error("Invalid refresh token");
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  refreshTokens = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "No refresh token provided",
        });
      }

      const user = await this.verifyRefreshToken(refreshToken);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const newAccessToken = this.generateAccessToken(user._id);
      const newRefreshToken = this.generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      this.setTokenCookies(res, newAccessToken, newRefreshToken);

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Refresh token error:", error);

      this.clearTokenCookies(res);

      res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  };
}

module.exports = new AuthController();
