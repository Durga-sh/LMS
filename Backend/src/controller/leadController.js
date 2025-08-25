const Lead = require("../model/Lead");
const mongoose = require("mongoose");

class LeadController {
  buildFilterQuery(filters, userId) {
    const query = { created_by: userId };

    console.log("Building filter query with filters:", filters);

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

      console.log(`Processing filter for ${field}:`, filterValue);

      switch (field) {
        case "email":
        case "company":
        case "city":
        case "first_name":
        case "last_name":
        case "phone":
        case "state":
          if (typeof filterValue === "string") {
            query[field] = { $regex: filterValue, $options: "i" };
          } else if (typeof filterValue === "object") {
            if (filterValue.equals) {
              query[field] = filterValue.equals;
            } else if (filterValue.contains) {
              query[field] = { $regex: filterValue.contains, $options: "i" };
            }
          }
          break;

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
              console.log(`Added number query for ${field}:`, numberQuery);
            }
          }
          break;

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
              dateQuery.$lte = new Date(filterValue.before);
            }
            if (filterValue.after) {
              dateQuery.$gte = new Date(filterValue.after);
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
              console.log(`Added date query for ${field}:`, dateQuery);
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
            console.log(
              `Added boolean query for ${field}:`,
              filterValue.equals
            );
          }
          break;
      }
    });

    console.log("Final query:", JSON.stringify(query, null, 2));
    return query;
  }

  buildAdvancedFilterQuery(filters, userId) {
    const query = { created_by: userId };

    console.log("Building advanced filter query with filters:", filters);

    if (!filters || Object.keys(filters).length === 0) {
      return query;
    }

    Object.keys(filters).forEach((field) => {
      const filterConfig = filters[field];

      if (!filterConfig || typeof filterConfig !== "object") {
        return;
      }

      console.log(`Processing advanced filter for ${field}:`, filterConfig);

      switch (field) {
        // String fields (email, company, city)
        case "email":
        case "company":
        case "city":
          if (filterConfig.equals) {
            query[field] = filterConfig.equals;
          } else if (filterConfig.contains) {
            query[field] = { $regex: filterConfig.contains, $options: "i" };
          }
          break;

        // Enum fields (status, source)
        case "status":
        case "source":
          if (filterConfig.equals) {
            query[field] = filterConfig.equals;
          } else if (
            filterConfig.in &&
            Array.isArray(filterConfig.in) &&
            filterConfig.in.length > 0
          ) {
            query[field] = { $in: filterConfig.in };
          }
          break;

        // Number fields (score, lead_value)
        case "score":
        case "lead_value":
          if (filterConfig.equals !== undefined) {
            query[field] = filterConfig.equals;
          } else {
            const rangeQuery = {};
            if (filterConfig.gte !== undefined)
              rangeQuery.$gte = filterConfig.gte;
            if (filterConfig.lte !== undefined)
              rangeQuery.$lte = filterConfig.lte;
            if (filterConfig.gt !== undefined) rangeQuery.$gt = filterConfig.gt;
            if (filterConfig.lt !== undefined) rangeQuery.$lt = filterConfig.lt;
            if (Object.keys(rangeQuery).length > 0) {
              query[field] = rangeQuery;
              console.log(`Added number query for ${field}:`, rangeQuery);
            }
          }
          break;

        // Date fields (createdAt, last_activity_at)
        case "createdAt":
        case "last_activity_at":
          if (filterConfig.on) {
            const onDate = new Date(filterConfig.on);
            const nextDay = new Date(onDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query[field] = {
              $gte: onDate,
              $lt: nextDay,
            };
            console.log(`Added date "on" query for ${field}:`, query[field]);
          } else {
            const dateQuery = {};
            if (filterConfig.after)
              dateQuery.$gte = new Date(filterConfig.after);
            if (filterConfig.before)
              dateQuery.$lte = new Date(filterConfig.before);
            if (Object.keys(dateQuery).length > 0) {
              query[field] = dateQuery;
              console.log(`Added date range query for ${field}:`, dateQuery);
            }
          }
          break;

        // Boolean fields (is_qualified)
        case "is_qualified":
          if (filterConfig.equals !== undefined) {
            query[field] = filterConfig.equals;
            console.log(
              `Added boolean query for ${field}:`,
              filterConfig.equals
            );
          }
          break;

        default:
          console.warn(`Unknown filter field: ${field}`);
      }
    });

    console.log("Final advanced query:", JSON.stringify(query, null, 2));
    return query;
  }

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

  getLeads = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        filters = "{}",
      } = req.query;

      console.log("Raw query params:", req.query);

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(20, parseInt(limit))); // Ensure minimum of 20
      const skip = (pageNum - 1) * limitNum;

      let parsedFilters = {};
      try {
        if (typeof filters === "string" && filters !== "{}") {
          parsedFilters = JSON.parse(filters);
        } else if (typeof filters === "object") {
          parsedFilters = filters;
        }
      } catch (error) {
        console.error("Error parsing filters:", error);
        parsedFilters = {};
      }

      console.log("Parsed filters:", parsedFilters);
      const query = this.buildAdvancedFilterQuery(parsedFilters, req.user._id);
      console.log("MongoDB query:", JSON.stringify(query, null, 2));

      const sortObj = {};
      sortObj[sort] = order === "asc" ? 1 : -1;

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
        appliedFilters: parsedFilters,
      });
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

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

      const statusStats = await Lead.aggregate([
        { $match: { created_by: userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

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
