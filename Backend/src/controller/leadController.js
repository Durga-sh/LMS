// Backend/src/controller/leadController.js
const Lead = require("../model/Lead");
const mongoose = require("mongoose");

class LeadController {
  // Helper method to build filter query
  buildFilterQuery(filters, userId) {
    const query = { created_by: userId };

    if (!filters) return query;

    Object.keys(filters).forEach((field) => {
      const filterValue = filters[field];

      if (
        !filterValue ||
        (typeof filterValue === "object" &&
          Object.keys(filterValue).length === 0)
      ) {
        return;
      }

      switch (field) {
        // String fields - email, company, city, first_name, last_name
        case "email":
        case "company":
        case "city":
        case "first_name":
        case "last_name":
        case "phone":
        case "state":
          if (typeof filterValue === "string") {
            // Default to contains for string
            query[field] = { $regex: filterValue, $options: "i" };
          } else if (typeof filterValue === "object") {
            if (filterValue.equals) {
              query[field] = filterValue.equals;
            } else if (filterValue.contains) {
              query[field] = { $regex: filterValue.contains, $options: "i" };
            }
          }
          break;

        // Enum fields - status, source
        case "status":
        case "source":
          if (typeof filterValue === "string") {
            query[field] = filterValue;
          } else if (typeof filterValue === "object") {
            if (filterValue.equals) {
              query[field] = filterValue.equals;
            } else if (filterValue.in && Array.isArray(filterValue.in)) {
              query[field] = { $in: filterValue.in };
            }
          }
          break;

        // Number fields - score, lead_value
        case "score":
        case "lead_value":
          if (typeof filterValue === "number") {
            query[field] = filterValue;
          } else if (typeof filterValue === "object") {
            const numberQuery = {};
            if (filterValue.equals !== undefined)
              numberQuery.$eq = filterValue.equals;
            if (filterValue.gt !== undefined) numberQuery.$gt = filterValue.gt;
            if (filterValue.lt !== undefined) numberQuery.$lt = filterValue.lt;
            if (filterValue.gte !== undefined)
              numberQuery.$gte = filterValue.gte;
            if (filterValue.lte !== undefined)
              numberQuery.$lte = filterValue.lte;
            if (
              filterValue.between &&
              Array.isArray(filterValue.between) &&
              filterValue.between.length === 2
            ) {
              numberQuery.$gte = filterValue.between[0];
              numberQuery.$lte = filterValue.between[1];
            }
            if (Object.keys(numberQuery).length > 0) {
              query[field] = numberQuery;
            }
          }
          break;

        // Date fields - createdAt, updatedAt, last_activity_at
        case "createdAt":
        case "updatedAt":
        case "last_activity_at":
          if (typeof filterValue === "object") {
            const dateQuery = {};
            if (filterValue.on) {
              const date = new Date(filterValue.on);
              const nextDay = new Date(date);
              nextDay.setDate(date.getDate() + 1);
              dateQuery.$gte = date;
              dateQuery.$lt = nextDay;
            }
            if (filterValue.before) {
              dateQuery.$lt = new Date(filterValue.before);
            }
            if (filterValue.after) {
              dateQuery.$gt = new Date(filterValue.after);
            }
            if (
              filterValue.between &&
              Array.isArray(filterValue.between) &&
              filterValue.between.length === 2
            ) {
              dateQuery.$gte = new Date(filterValue.between[0]);
              dateQuery.$lte = new Date(filterValue.between[1]);
            }
            if (Object.keys(dateQuery).length > 0) {
              query[field] = dateQuery;
            }
          }
          break;

        // Boolean field - is_qualified
        case "is_qualified":
          if (typeof filterValue === "boolean") {
            query[field] = filterValue;
          } else if (
            typeof filterValue === "object" &&
            filterValue.equals !== undefined
          ) {
            query[field] = filterValue.equals;
          }
          break;
      }
    });

    return query;
  }

  // Validation helper
  validateLeadData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.first_name !== undefined) {
      if (!data.first_name || data.first_name.trim().length === 0) {
        errors.push("First name is required");
      } else if (data.first_name.trim().length > 50) {
        errors.push("First name cannot exceed 50 characters");
      }
    }

    if (!isUpdate || data.last_name !== undefined) {
      if (!data.last_name || data.last_name.trim().length === 0) {
        errors.push("Last name is required");
      } else if (data.last_name.trim().length > 50) {
        errors.push("Last name cannot exceed 50 characters");
      }
    }

    if (!isUpdate || data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0) {
        errors.push("Email is required");
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push("Please provide a valid email address");
        }
      }
    }

    if (!isUpdate || data.phone !== undefined) {
      if (!data.phone || data.phone.trim().length === 0) {
        errors.push("Phone number is required");
      }
    }

    if (!isUpdate || data.company !== undefined) {
      if (!data.company || data.company.trim().length === 0) {
        errors.push("Company is required");
      }
    }

    if (!isUpdate || data.city !== undefined) {
      if (!data.city || data.city.trim().length === 0) {
        errors.push("City is required");
      }
    }

    if (!isUpdate || data.state !== undefined) {
      if (!data.state || data.state.trim().length === 0) {
        errors.push("State is required");
      }
    }

    if (!isUpdate || data.source !== undefined) {
      const validSources = [
        "website",
        "facebook_ads",
        "google_ads",
        "referral",
        "events",
        "other",
      ];
      if (!data.source || !validSources.includes(data.source)) {
        errors.push(
          "Source must be one of: website, facebook_ads, google_ads, referral, events, other"
        );
      }
    }

    if (data.status !== undefined) {
      const validStatuses = ["new", "contacted", "qualified", "lost", "won"];
      if (data.status && !validStatuses.includes(data.status)) {
        errors.push(
          "Status must be one of: new, contacted, qualified, lost, won"
        );
      }
    }

    if (data.score !== undefined) {
      if (
        typeof data.score !== "number" ||
        data.score < 0 ||
        data.score > 100
      ) {
        errors.push("Score must be a number between 0 and 100");
      }
    }

    if (data.lead_value !== undefined) {
      if (typeof data.lead_value !== "number" || data.lead_value < 0) {
        errors.push("Lead value must be a positive number");
      }
    }

    return errors;
  }

  // Create a new lead
  createLead = async (req, res) => {
    try {
      const validationErrors = this.validateLeadData(req.body);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Check if email already exists
      const existingLead = await Lead.findOne({
        email: req.body.email,
        created_by: req.user._id,
      });

      if (existingLead) {
        return res.status(409).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }

      const leadData = {
        ...req.body,
        created_by: req.user._id,
      };

      const lead = new Lead(leadData);
      await lead.save();

      res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: lead,
      });
    } catch (error) {
      console.error("Create lead error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get leads with pagination and filtering
  getLeads = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        ...filters
      } = req.query;

      // Validate and sanitize pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Build filter query
      const query = this.buildFilterQuery(filters, req.user._id);

      // Build sort object
      const sortObj = {};
      sortObj[sort] = order === "asc" ? 1 : -1;

      // Execute queries
      const [leads, totalCount] = await Promise.all([
        Lead.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
        Lead.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limitNum);

      res.status(200).json({
        success: true,
        data: leads,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      });
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get single lead by ID
  getLeadById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
      }

      const lead = await Lead.findOne({
        _id: id,
        created_by: req.user._id,
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error("Get lead by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Update lead
  updateLead = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
      }

      const validationErrors = this.validateLeadData(req.body, true);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      // Check if email is being updated and already exists
      if (req.body.email) {
        const existingLead = await Lead.findOne({
          email: req.body.email,
          created_by: req.user._id,
          _id: { $ne: id },
        });

        if (existingLead) {
          return res.status(409).json({
            success: false,
            message: "Lead with this email already exists",
          });
        }
      }

      const lead = await Lead.findOneAndUpdate(
        {
          _id: id,
          created_by: req.user._id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Lead updated successfully",
        data: lead,
      });
    } catch (error) {
      console.error("Update lead error:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Delete lead
  deleteLead = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lead ID",
        });
      }

      const lead = await Lead.findOneAndDelete({
        _id: id,
        created_by: req.user._id,
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: "Lead not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error) {
      console.error("Delete lead error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get lead statistics (bonus feature)
  getLeadStats = async (req, res) => {
    try {
      const userId = req.user._id;

      const stats = await Lead.aggregate([
        { $match: { created_by: userId } },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            averageScore: { $avg: "$score" },
            totalLeadValue: { $sum: "$lead_value" },
            qualifiedLeads: {
              $sum: { $cond: [{ $eq: ["$is_qualified", true] }, 1, 0] },
            },
            statusBreakdown: {
              $push: "$status",
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalLeads: 1,
            averageScore: { $round: ["$averageScore", 2] },
            totalLeadValue: 1,
            qualifiedLeads: 1,
            statusBreakdown: 1,
          },
        },
      ]);

      // Get status breakdown
      const statusStats = await Lead.aggregate([
        { $match: { created_by: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get source breakdown
      const sourceStats = await Lead.aggregate([
        { $match: { created_by: userId } },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]);

      const result = stats[0] || {
        totalLeads: 0,
        averageScore: 0,
        totalLeadValue: 0,
        qualifiedLeads: 0,
      };

      result.statusBreakdown = statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      result.sourceBreakdown = sourceStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get lead stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

module.exports = new LeadController();
