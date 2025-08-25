// Backend/src/model/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      enum: {
        values: [
          "website",
          "facebook_ads",
          "google_ads",
          "referral",
          "events",
          "other",
        ],
        message:
          "Source must be one of: website, facebook_ads, google_ads, referral, events, other",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["new", "contacted", "qualified", "lost", "won"],
        message: "Status must be one of: new, contacted, qualified, lost, won",
      },
      default: "new",
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score must be between 0 and 100"],
      max: [100, "Score must be between 0 and 100"],
      default: 0,
    },
    lead_value: {
      type: Number,
      required: [true, "Lead value is required"],
      min: [0, "Lead value must be positive"],
      default: 0,
    },
    last_activity_at: {
      type: Date,
      default: null,
    },
    is_qualified: {
      type: Boolean,
      default: false,
    },
    // Adding user reference for multi-tenant support
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ score: 1 });
leadSchema.index({ lead_value: 1 });
leadSchema.index({ created_by: 1 });
leadSchema.index({ createdAt: 1 });
leadSchema.index({ last_activity_at: 1 });

// Virtual for full name
leadSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtual fields are serialized
leadSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Lead", leadSchema);
