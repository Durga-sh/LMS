// frontend/src/api/leads.js - Lead API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class LeadAPI {
  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  }

  // Create a new lead
  async createLead(leadData) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(leadData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Create lead API error:", error);
      throw error;
    }
  }

  // Get leads with pagination and filtering
  async getLeads(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add all parameters to query string
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          if (typeof params[key] === "object") {
            queryParams.append(key, JSON.stringify(params[key]));
          } else {
            queryParams.append(key, params[key]);
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/leads?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Get leads API error:", error);
      throw error;
    }
  }

  // Get single lead by ID
  async getLeadById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Get lead by ID API error:", error);
      throw error;
    }
  }

  // Update lead
  async updateLead(id, leadData) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(leadData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Update lead API error:", error);
      throw error;
    }
  }

  // Delete lead
  async deleteLead(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Delete lead API error:", error);
      throw error;
    }
  }

  // Get lead statistics
  async getLeadStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/leads/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("Get lead stats API error:", error);
      throw error;
    }
  }

  // Helper methods for filtering
  buildStringFilter(value, operator = "contains") {
    if (!value) return undefined;

    switch (operator) {
      case "equals":
        return { equals: value };
      case "contains":
      default:
        return { contains: value };
    }
  }

  buildNumberFilter(value, operator = "equals") {
    if (value === undefined || value === null || value === "") return undefined;

    const numValue = Number(value);
    if (isNaN(numValue)) return undefined;

    switch (operator) {
      case "equals":
        return { equals: numValue };
      case "gt":
        return { gt: numValue };
      case "lt":
        return { lt: numValue };
      case "gte":
        return { gte: numValue };
      case "lte":
        return { lte: numValue };
      default:
        return { equals: numValue };
    }
  }

  buildDateFilter(value, operator = "on") {
    if (!value) return undefined;

    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined;

    switch (operator) {
      case "on":
        return { on: date.toISOString() };
      case "before":
        return { before: date.toISOString() };
      case "after":
        return { after: date.toISOString() };
      default:
        return { on: date.toISOString() };
    }
  }

  buildEnumFilter(value, operator = "equals") {
    if (!value || (Array.isArray(value) && value.length === 0))
      return undefined;

    switch (operator) {
      case "equals":
        return { equals: value };
      case "in":
        return { in: Array.isArray(value) ? value : [value] };
      default:
        return { equals: value };
    }
  }

  buildBooleanFilter(value) {
    if (value === undefined || value === null || value === "") return undefined;
    return { equals: Boolean(value) };
  }
}

export default new LeadAPI();
