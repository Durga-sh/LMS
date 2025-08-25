import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, CsvExportModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import leadAPI from "../api/leads";
import authAPI from "../api/auth";

const AdvancedFilterForm = ({ onApply, onClear }) => {
  const [filters, setFilters] = useState({
    email_operator: "contains",
    email_value: "",
    company_operator: "contains",
    company_value: "",
    city_operator: "contains",
    city_value: "",

    status_operator: "equals",
    status_value: "",
    source_operator: "equals",
    source_value: "",

    score_operator: "between",
    score_equals: "",
    score_min: "",
    score_max: "",

    lead_value_operator: "between",
    lead_value_equals: "",
    lead_value_min: "",
    lead_value_max: "",

    created_at_operator: "between",
    created_at_on: "",
    created_at_after: "",
    created_at_before: "",

    is_qualified: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    const apiFilters = {};
    if (filters.email_value.trim()) {
      if (filters.email_operator === "equals") {
        apiFilters.email = { equals: filters.email_value.trim() };
      } else if (filters.email_operator === "contains") {
        apiFilters.email = { contains: filters.email_value.trim() };
      }
    }

    if (filters.company_value.trim()) {
      if (filters.company_operator === "equals") {
        apiFilters.company = { equals: filters.company_value.trim() };
      } else if (filters.company_operator === "contains") {
        apiFilters.company = { contains: filters.company_value.trim() };
      }
    }

    if (filters.city_value.trim()) {
      if (filters.city_operator === "equals") {
        apiFilters.city = { equals: filters.city_value.trim() };
      } else if (filters.city_operator === "contains") {
        apiFilters.city = { contains: filters.city_value.trim() };
      }
    }

    if (filters.status_value) {
      apiFilters.status = { equals: filters.status_value };
    }

    if (filters.source_value) {
      apiFilters.source = { equals: filters.source_value };
    }
    if (filters.score_operator === "equals" && filters.score_equals !== "") {
      apiFilters.score = { equals: Number(filters.score_equals) };
    } else if (filters.score_operator === "gt" && filters.score_equals !== "") {
      apiFilters.score = { gt: Number(filters.score_equals) };
    } else if (filters.score_operator === "lt" && filters.score_equals !== "") {
      apiFilters.score = { lt: Number(filters.score_equals) };
    } else if (filters.score_operator === "between") {
      const scoreFilter = {};
      if (filters.score_min !== "") scoreFilter.gte = Number(filters.score_min);
      if (filters.score_max !== "") scoreFilter.lte = Number(filters.score_max);
      if (Object.keys(scoreFilter).length > 0) {
        apiFilters.score = scoreFilter;
      }
    }

    if (
      filters.lead_value_operator === "equals" &&
      filters.lead_value_equals !== ""
    ) {
      apiFilters.lead_value = { equals: Number(filters.lead_value_equals) };
    } else if (
      filters.lead_value_operator === "gt" &&
      filters.lead_value_equals !== ""
    ) {
      apiFilters.lead_value = { gt: Number(filters.lead_value_equals) };
    } else if (
      filters.lead_value_operator === "lt" &&
      filters.lead_value_equals !== ""
    ) {
      apiFilters.lead_value = { lt: Number(filters.lead_value_equals) };
    } else if (filters.lead_value_operator === "between") {
      const valueFilter = {};
      if (filters.lead_value_min !== "")
        valueFilter.gte = Number(filters.lead_value_min);
      if (filters.lead_value_max !== "")
        valueFilter.lte = Number(filters.lead_value_max);
      if (Object.keys(valueFilter).length > 0) {
        apiFilters.lead_value = valueFilter;
      }
    }

    if (filters.created_at_operator === "on" && filters.created_at_on) {
      apiFilters.createdAt = {
        on: new Date(filters.created_at_on).toISOString(),
      };
    } else if (
      filters.created_at_operator === "before" &&
      filters.created_at_before
    ) {
      const beforeDate = new Date(filters.created_at_before);
      beforeDate.setHours(23, 59, 59, 999);
      apiFilters.createdAt = {
        before: beforeDate.toISOString(),
      };
    } else if (
      filters.created_at_operator === "after" &&
      filters.created_at_after
    ) {
      apiFilters.createdAt = {
        after: new Date(filters.created_at_after).toISOString(),
      };
    } else if (filters.created_at_operator === "between") {
      const dateFilter = {};
      if (filters.created_at_after) {
        dateFilter.after = new Date(filters.created_at_after).toISOString();
      }
      if (filters.created_at_before) {
        const beforeDate = new Date(filters.created_at_before);
        beforeDate.setHours(23, 59, 59, 999);
        dateFilter.before = beforeDate.toISOString();
      }
      if (Object.keys(dateFilter).length > 0) {
        apiFilters.createdAt = dateFilter;
      }
    }

    if (filters.is_qualified !== "") {
      apiFilters.is_qualified = { equals: filters.is_qualified === "true" };
    }

    console.log("Applying filters:", apiFilters);
    onApply(apiFilters);
  };

  const handleClear = () => {
    setFilters({
      email_operator: "contains",
      email_value: "",
      company_operator: "contains",
      company_value: "",
      city_operator: "contains",
      city_value: "",
      status_operator: "equals",
      status_value: "",
      source_operator: "equals",
      source_value: "",
      score_operator: "between",
      score_equals: "",
      score_min: "",
      score_max: "",
      lead_value_operator: "between",
      lead_value_equals: "",
      lead_value_min: "",
      lead_value_max: "",
      created_at_operator: "between",
      created_at_on: "",
      created_at_after: "",
      created_at_before: "",
      is_qualified: "",
    });
    onClear();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Email Filter
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="email_operator"
              value={filters.email_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
            </select>
            <input
              type="text"
              name="email_value"
              value={filters.email_value}
              onChange={handleFilterChange}
              placeholder="Email value..."
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="col-span-full border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Company Filter
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="company_operator"
              value={filters.company_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
            </select>
            <input
              type="text"
              name="company_value"
              value={filters.company_value}
              onChange={handleFilterChange}
              placeholder="Company value..."
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="col-span-full border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            City Filter
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <select
              name="city_operator"
              value={filters.city_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="contains">Contains</option>
              <option value="equals">Equals</option>
            </select>
            <input
              type="text"
              name="city_value"
              value={filters.city_value}
              onChange={handleFilterChange}
              placeholder="City value..."
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status_value"
            value={filters.status_value}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="lost">Lost</option>
            <option value="won">Won</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <select
            name="source_value"
            value={filters.source_value}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="facebook_ads">Facebook Ads</option>
            <option value="google_ads">Google Ads</option>
            <option value="referral">Referral</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualified
          </label>
          <select
            name="is_qualified"
            value={filters.is_qualified}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Leads</option>
            <option value="true">Qualified Only</option>
            <option value="false">Not Qualified Only</option>
          </select>
        </div>

        <div className="col-span-full border rounded-lg p-4 bg-blue-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Score Filter
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <select
              name="score_operator"
              value={filters.score_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="equals">Equals</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
              <option value="between">Between</option>
            </select>
            {filters.score_operator === "equals" ||
            filters.score_operator === "gt" ||
            filters.score_operator === "lt" ? (
              <input
                type="number"
                name="score_equals"
                value={filters.score_equals}
                onChange={handleFilterChange}
                min="0"
                max="100"
                placeholder={
                  filters.score_operator === "equals"
                    ? "Score"
                    : filters.score_operator === "gt"
                    ? "Greater than..."
                    : "Less than..."
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <>
                <input
                  type="number"
                  name="score_min"
                  value={filters.score_min}
                  onChange={handleFilterChange}
                  min="0"
                  max="100"
                  placeholder="Min Score"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center justify-center text-gray-500">
                  to
                </span>
                <input
                  type="number"
                  name="score_max"
                  value={filters.score_max}
                  onChange={handleFilterChange}
                  min="0"
                  max="100"
                  placeholder="Max Score"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>
        </div>
        <div className="col-span-full border rounded-lg p-4 bg-green-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Lead Value Filter ($)
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <select
              name="lead_value_operator"
              value={filters.lead_value_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="equals">Equals</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
              <option value="between">Between</option>
            </select>
            {filters.lead_value_operator === "equals" ||
            filters.lead_value_operator === "gt" ||
            filters.lead_value_operator === "lt" ? (
              <input
                type="number"
                name="lead_value_equals"
                value={filters.lead_value_equals}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
                placeholder={
                  filters.lead_value_operator === "equals"
                    ? "Value"
                    : filters.lead_value_operator === "gt"
                    ? "Greater than..."
                    : "Less than..."
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <>
                <input
                  type="number"
                  name="lead_value_min"
                  value={filters.lead_value_min}
                  onChange={handleFilterChange}
                  min="0"
                  step="0.01"
                  placeholder="Min Value"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center justify-center text-gray-500">
                  to
                </span>
                <input
                  type="number"
                  name="lead_value_max"
                  value={filters.lead_value_max}
                  onChange={handleFilterChange}
                  min="0"
                  step="0.01"
                  placeholder="Max Value"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>
        </div>

        <div className="col-span-full border rounded-lg p-4 bg-yellow-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Created Date Filter
          </h4>
          <div className="grid grid-cols-4 gap-2">
            <select
              name="created_at_operator"
              value={filters.created_at_operator}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="on">On Date</option>
              <option value="before">Before Date</option>
              <option value="after">After Date</option>
              <option value="between">Between</option>
            </select>
            {filters.created_at_operator === "on" ? (
              <input
                type="date"
                name="created_at_on"
                value={filters.created_at_on}
                onChange={handleFilterChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : filters.created_at_operator === "before" ? (
              <input
                type="date"
                name="created_at_before"
                value={filters.created_at_before}
                onChange={handleFilterChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Before Date"
              />
            ) : filters.created_at_operator === "after" ? (
              <input
                type="date"
                name="created_at_after"
                value={filters.created_at_after}
                onChange={handleFilterChange}
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="After Date"
              />
            ) : (
              <>
                <input
                  type="date"
                  name="created_at_after"
                  value={filters.created_at_after}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="After"
                />
                <span className="flex items-center justify-center text-gray-500">
                  to
                </span>
                <input
                  type="date"
                  name="created_at_before"
                  value={filters.created_at_before}
                  onChange={handleFilterChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Before"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
const LeadManagementPage = () => {
  const navigate = useNavigate();
  const gridRef = useRef();

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadStats, setLeadStats] = useState(null);
  const [error, setError] = useState("");

  const [quickFilter] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    state: "",
    source: "website",
    status: "new",
    score: 0,
    lead_value: 0,
    is_qualified: false,
  });

  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const columnDefs = [
    {
      headerName: "Name",
      field: "full_name",
      valueGetter: (params) => {
        const data = params.data;
        if (!data) return "";
        return `${data.first_name || ""} ${data.last_name || ""}`.trim();
      },
      filter: "agTextColumnFilter",
      sortable: true,
      pinned: "left",
      width: 180,
      cellRenderer: (params) => {
        const value = params.value || "No Name";
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      headerName: "Email",
      field: "email",
      filter: "agTextColumnFilter",
      sortable: true,
      width: 200,
      cellRenderer: (params) => {
        const email = params.value || "";
        if (!email) return <span className="text-gray-400">No Email</span>;
        return (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {email}
          </a>
        );
      },
    },
    {
      headerName: "Phone",
      field: "phone",
      filter: "agTextColumnFilter",
      sortable: true,
      width: 140,
      cellRenderer: (params) => {
        const phone = params.value || "";
        if (!phone) return <span className="text-gray-400">No Phone</span>;
        return (
          <a
            href={`tel:${phone}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {phone}
          </a>
        );
      },
    },
    {
      headerName: "Company",
      field: "company",
      filter: "agTextColumnFilter",
      sortable: true,
      width: 150,
      cellRenderer: (params) => {
        const company = params.value || "No Company";
        return <span className="font-medium">{company}</span>;
      },
    },
    {
      headerName: "City",
      field: "city",
      filter: "agTextColumnFilter",
      sortable: true,
      width: 120,
      cellRenderer: (params) => {
        const city = params.value || "N/A";
        return <span>{city}</span>;
      },
    },
    {
      headerName: "State",
      field: "state",
      filter: "agTextColumnFilter",
      sortable: true,
      width: 120,
      cellRenderer: (params) => {
        const state = params.value || "N/A";
        return <span>{state}</span>;
      },
    },
    {
      headerName: "Source",
      field: "source",
      filter: "agSetColumnFilter",
      sortable: true,
      width: 130,
      cellRenderer: (params) => {
        const sourceLabels = {
          website: "Website",
          facebook_ads: "Facebook Ads",
          google_ads: "Google Ads",
          referral: "Referral",
          events: "Events",
          other: "Other",
        };
        const source = params.value || "unknown";
        const label = sourceLabels[source] || source;
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            {label}
          </span>
        );
      },
    },
    {
      headerName: "Status",
      field: "status",
      filter: "agSetColumnFilter",
      sortable: true,
      width: 120,
      cellRenderer: (params) => {
        const status = params.value || "new";
        const statusColors = {
          new: "bg-blue-100 text-blue-800 border-blue-200",
          contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
          qualified: "bg-green-100 text-green-800 border-green-200",
          lost: "bg-red-100 text-red-800 border-red-200",
          won: "bg-purple-100 text-purple-800 border-purple-200",
        };
        const colorClass =
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}
          >
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      headerName: "Score",
      field: "score",
      filter: "agNumberColumnFilter",
      sortable: true,
      width: 100,
      cellRenderer: (params) => {
        const score = params.value || 0;
        let colorClass = "text-red-600 bg-red-50";
        if (score >= 70) colorClass = "text-green-600 bg-green-50";
        else if (score >= 40) colorClass = "text-yellow-600 bg-yellow-50";
        return (
          <span
            className={`${colorClass} px-2 py-1 rounded font-semibold text-xs`}
          >
            {score}/100
          </span>
        );
      },
    },
    {
      headerName: "Lead Value",
      field: "lead_value",
      filter: "agNumberColumnFilter",
      sortable: true,
      width: 120,
      valueFormatter: (params) => `$${(params.value || 0).toLocaleString()}`,
      cellRenderer: (params) => {
        const value = params.value || 0;
        let colorClass = "text-gray-700";
        if (value >= 10000) colorClass = "text-green-600 font-semibold";
        else if (value >= 5000) colorClass = "text-blue-600 font-medium";
        return <span className={colorClass}>${value.toLocaleString()}</span>;
      },
    },
    {
      headerName: "Qualified",
      field: "is_qualified",
      filter: "agSetColumnFilter",
      sortable: true,
      width: 100,
      cellRenderer: (params) => {
        const isQualified = params.value || false;
        return isQualified ? (
          <span className="text-green-600 font-semibold px-2 py-1 bg-green-50 rounded text-xs">
            ✓ Yes
          </span>
        ) : (
          <span className="text-gray-500 px-2 py-1 bg-gray-50 rounded text-xs">
            ✗ No
          </span>
        );
      },
    },
    {
      headerName: "Last Activity",
      field: "last_activity_at",
      filter: "agDateColumnFilter",
      sortable: true,
      width: 140,
      valueFormatter: (params) => {
        if (!params.value) return "Never";
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      headerName: "Created",
      field: "createdAt",
      filter: "agDateColumnFilter",
      sortable: true,
      width: 140,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : "";
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 160,
      pinned: "right",
      sortable: false,
      filter: false,
      suppressMenu: true,
      cellRenderer: (params) => {
        const leadId = params.data?.id || params.node.id || Math.random();
        return (
          <div className="flex gap-1 h-full items-center justify-center">
            <button
              key={`view-${leadId}`}
              className="action-btn view-btn p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="View Details"
              onClick={() => handleViewLead(params.data)}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              key={`edit-${leadId}`}
              className="action-btn edit-btn p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Edit Lead"
              onClick={() => handleEditLead(params.data)}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              key={`delete-${leadId}`}
              className="action-btn delete-btn p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
              title="Delete Lead"
              onClick={() => handleDeleteLead(params.data)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
  };

  const fetchCurrentUser = useCallback(async () => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        setCurrentUser(result.user);
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Loading leads with params:", {
        page: paginationData.currentPage,
        limit: paginationData.pageSize,
        sort: "createdAt",
        order: "desc",
        ...advancedFilters,
      });

      const params = {
        page: paginationData.currentPage,
        limit: paginationData.pageSize,
        sort: "createdAt",
        order: "desc",
      };

      if (Object.keys(advancedFilters).length > 0) {
        params.filters = JSON.stringify(advancedFilters);
      }

      const result = await leadAPI.getLeads(params);
      console.log("API Response:", result);

      if (result.success) {
        let leadsData = [];
        let paginationInfo = null;

        if (Array.isArray(result.data)) {
          leadsData = result.data;
          paginationInfo = result.pagination;
        } else if (result.data && Array.isArray(result.data.data)) {
          leadsData = result.data.data;
          paginationInfo = result.data.pagination || result.pagination;
        } else if (result.data && result.data.leads) {
          leadsData = result.data.leads;
          paginationInfo = result.data.pagination || result.pagination;
        } else {
          console.warn("Unexpected data structure:", result);
          leadsData = result.data || [];
        }

        console.log("Processed leads data:", leadsData);
        console.log("Pagination info:", paginationInfo);

        const processedLeads = leadsData.map((lead) => ({
          id: lead._id || lead.id || Math.random().toString(),
          _id: lead._id || lead.id || "",
          first_name: lead.first_name || "",
          last_name: lead.last_name || "",
          email: lead.email || "",
          phone: lead.phone || "",
          company: lead.company || "",
          city: lead.city || "",
          state: lead.state || "",
          source: lead.source || "website",
          status: lead.status || "new",
          score: Number(lead.score) || 0,
          lead_value: Number(lead.lead_value) || 0,
          is_qualified: Boolean(lead.is_qualified),
          last_activity_at: lead.last_activity_at || null,
          createdAt:
            lead.createdAt || lead.created_at || new Date().toISOString(),
          updatedAt:
            lead.updatedAt || lead.updated_at || new Date().toISOString(),
        }));

        setRowData(processedLeads);
        setTotalCount(paginationInfo?.totalCount || processedLeads.length);
        setPaginationData((prev) => ({
          ...prev,
          totalPages:
            paginationInfo?.totalPages ||
            Math.ceil(
              (paginationInfo?.totalCount || processedLeads.length) /
                prev.pageSize
            ),
        }));

        console.log("Final processed data:", processedLeads);
      } else {
        console.error("API Error:", result.message);
        setError(result.message || "Failed to load leads");
        setRowData([]);
      }
    } catch (error) {
      console.error("Load leads error:", error);
      setError(
        error.message ||
          "Failed to load leads. Please check your connection and try again."
      );
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [paginationData.currentPage, paginationData.pageSize, advancedFilters]);

  const loadLeadStats = async () => {
    try {
      const result = await leadAPI.getLeadStats();
      if (result.success) {
        setLeadStats(result.data);
      } else {
        console.error("Failed to load stats:", result.message);
      }
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (gridRef.current?.api) {
        gridRef.current.api.setGridOption("quickFilterText", quickFilter);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [quickFilter]);

  function handleCellClicked(params) {
    if (params.column.colId === "actions") {
      const target = params.event.target;
      const actionButton = target.closest(".action-btn");

      if (actionButton && params.data) {
        const leadData = params.data;

        if (actionButton.classList.contains("view-btn")) {
          handleViewLead(leadData);
        } else if (actionButton.classList.contains("edit-btn")) {
          handleEditLead(leadData);
        } else if (actionButton.classList.contains("delete-btn")) {
          handleDeleteLead(leadData);
        }
      }
    }
  }

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const handleEditLead = (lead) => {
    setFormData({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      city: lead.city || "",
      state: lead.state || "",
      source: lead.source || "website",
      status: lead.status || "new",
      score: lead.score || 0,
      lead_value: lead.lead_value || 0,
      is_qualified: lead.is_qualified || false,
    });
    setSelectedLead(lead);
    setFormErrors([]);
    setShowEditModal(true);
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleCreateLead = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      city: "",
      state: "",
      source: "website",
      status: "new",
      score: 0,
      lead_value: 0,
      is_qualified: false,
    });
    setFormErrors([]);
    setSelectedLead(null);
    setShowCreateModal(true);
  };

  const handleShowStats = () => {
    loadLeadStats();
    setShowStatsModal(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors([]);

    try {
      const submitData = {
        ...formData,
        score: Number(formData.score) || 0,
        lead_value: Number(formData.lead_value) || 0,
      };

      let result;
      if (showEditModal && selectedLead) {
        result = await leadAPI.updateLead(selectedLead._id, submitData);
      } else {
        result = await leadAPI.createLead(submitData);
      }

      if (result.success) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedLead(null);
        await loadLeads();
        setError("");
      } else {
        setFormErrors(result.errors || [result.message]);
      }
    } catch (error) {
      console.error("Form submit error:", error);
      setFormErrors([error.message || "Operation failed. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLead) return;

    setSubmitting(true);
    try {
      const result = await leadAPI.deleteLead(selectedLead._id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedLead(null);
        await loadLeads();
        setError("");
      } else {
        setError(result.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Delete failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePageChange = (page) => {
    setPaginationData((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handlePageSizeChange = (pageSize) => {
    const newPageSize = Math.max(20, Number(pageSize)); // Ensure minimum of 20
    setPaginationData((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
  };

  const applyAdvancedFilters = (filters) => {
    console.log("Applying advanced filters:", filters);
    setAdvancedFilters(filters);
    setPaginationData((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    setShowAdvancedFilter(false);
  };

  const clearAdvancedFilters = () => {
    console.log("Clearing advanced filters");
    setAdvancedFilters({});
    setPaginationData((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    setShowAdvancedFilter(false);
  };

  const exportToCSV = () => {
    try {
      if (gridRef.current?.api) {
        const params = {
          fileName: `leads-export-${new Date().toISOString().slice(0, 10)}.csv`,
          columnKeys: [
            "first_name",
            "last_name",
            "email",
            "phone",
            "company",
            "city",
            "state",
            "source",
            "status",
            "score",
            "lead_value",
            "is_qualified",
            "createdAt",
          ],
          processCellCallback: (params) => {
            if (params.column.colId === "is_qualified") {
              return params.value ? "Yes" : "No";
            }
            if (params.column.colId === "lead_value") {
              return `$${(params.value || 0).toLocaleString()}`;
            }
            if (params.column.colId === "createdAt") {
              return params.value
                ? new Date(params.value).toLocaleDateString()
                : "";
            }
            return params.value;
          },
        };
        gridRef.current.api.exportDataAsCsv(params);
      } else {
        alert("Grid not ready for export. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Lead Management
              </h1>
              {loading && (
                <div className="ml-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-5 h-5" />
                  <span className="font-medium">
                    {currentUser.name || currentUser.email}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCreateLead}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
            <button
              onClick={() => loadLeads()}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleShowStats}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
            <button
              onClick={() => setShowAdvancedFilter(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                Object.keys(advancedFilters).length > 0
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {Object.keys(advancedFilters).length > 0 && (
                <span className="ml-1 bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                  {Object.keys(advancedFilters).length}
                </span>
              )}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Leads
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalCount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Qualified
                </h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {rowData.filter((lead) => lead.is_qualified).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Won Deals
                </h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {rowData.filter((lead) => lead.status === "won").length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(advancedFilters).length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-blue-800">
                  Active Filters:
                </span>
                {Object.entries(advancedFilters).map(([key, value]) => {
                  let displayText = "";
                  if (typeof value === "object") {
                    if (value.contains) {
                      displayText = `${key} contains "${value.contains}"`;
                    } else if (value.equals !== undefined) {
                      displayText = `${key} = ${value.equals}`;
                    } else if (
                      value.gte !== undefined ||
                      value.lte !== undefined
                    ) {
                      const min = value.gte !== undefined ? value.gte : "min";
                      const max = value.lte !== undefined ? value.lte : "max";
                      displayText = `${key}: ${min} - ${max}`;
                    } else if (value.after || value.before) {
                      if (value.after && value.before) {
                        displayText = `${key}: ${new Date(
                          value.after
                        ).toLocaleDateString()} - ${new Date(
                          value.before
                        ).toLocaleDateString()}`;
                      } else if (value.after) {
                        displayText = `${key} after ${new Date(
                          value.after
                        ).toLocaleDateString()}`;
                      } else {
                        displayText = `${key} before ${new Date(
                          value.before
                        ).toLocaleDateString()}`;
                      }
                    } else {
                      displayText = `${key}: ${JSON.stringify(value)}`;
                    }
                  } else {
                    displayText = `${key}: ${value}`;
                  }

                  return (
                    <span
                      key={key}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {displayText}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={clearAdvancedFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* AG Grid */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div
            className="ag-theme-quartz"
            style={{ height: "600px", width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={false}
              onCellClicked={handleCellClicked}
              loading={loading}
              animateRows={true}
              suppressMenuHide={false}
              rowHeight={50}
              headerHeight={50}
              suppressLoadingOverlay={false}
              suppressNoRowsOverlay={false}
              getRowId={(params) =>
                params.data.id || params.data._id || params.node.id
              }
              noRowsOverlayComponent={() =>
                "No leads found. Try adjusting your filters or add some leads."
              }
              loadingOverlayComponent={() => "Loading leads..."}
            />
          </div>

          {/* Custom Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing{" "}
                {Math.min(
                  (paginationData.currentPage - 1) * paginationData.pageSize +
                    1,
                  totalCount
                )}{" "}
                to{" "}
                {Math.min(
                  paginationData.currentPage * paginationData.pageSize,
                  totalCount
                )}{" "}
                of {totalCount} entries
              </span>
              <select
                value={paginationData.pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={paginationData.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(paginationData.currentPage - 1)}
                disabled={paginationData.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {/* Page numbers */}
              {(() => {
                const totalPages = paginationData.totalPages;
                const currentPage = paginationData.currentPage;
                const delta = 2;
                const range = [];
                const rangeWithDots = [];

                for (
                  let i = Math.max(2, currentPage - delta);
                  i <= Math.min(totalPages - 1, currentPage + delta);
                  i++
                ) {
                  range.push(i);
                }

                if (currentPage - delta > 2) {
                  rangeWithDots.push(1, "...");
                } else {
                  rangeWithDots.push(1);
                }

                rangeWithDots.push(...range);

                if (currentPage + delta < totalPages - 1) {
                  rangeWithDots.push("...", totalPages);
                } else {
                  rangeWithDots.push(totalPages);
                }

                return rangeWithDots.map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`dots-${index}`}
                        className="px-3 py-1 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}

              <button
                onClick={() => handlePageChange(paginationData.currentPage + 1)}
                disabled={
                  paginationData.currentPage === paginationData.totalPages
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(paginationData.totalPages)}
                disabled={
                  paginationData.currentPage === paginationData.totalPages
                }
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* View Lead Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Lead Details
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedLead.status === "new"
                        ? "bg-blue-100 text-blue-800"
                        : selectedLead.status === "contacted"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedLead.status === "qualified"
                        ? "bg-green-100 text-green-800"
                        : selectedLead.status === "lost"
                        ? "bg-red-100 text-red-800"
                        : selectedLead.status === "won"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedLead.status?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedLead(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900 font-medium text-lg">
                          {selectedLead.first_name} {selectedLead.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Email Address
                        </label>
                        <p className="text-gray-900">
                          <a
                            href={`mailto:${selectedLead.email}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedLead.email}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900">
                          <a
                            href={`tel:${selectedLead.phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedLead.phone}
                          </a>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Company
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedLead.company}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Location
                        </label>
                        <p className="text-gray-900">
                          {selectedLead.city}, {selectedLead.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                      Lead Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Source
                        </label>
                        <p className="text-gray-900 capitalize">
                          {selectedLead.source?.replace("_", " ") || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Lead Score
                        </label>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-semibold">
                            {selectedLead.score}/100
                          </p>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                selectedLead.score >= 70
                                  ? "bg-green-500"
                                  : selectedLead.score >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${selectedLead.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Lead Value
                        </label>
                        <p className="text-gray-900 font-semibold text-lg">
                          ${(selectedLead.lead_value || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Qualified Status
                        </label>
                        <p
                          className={`font-medium ${
                            selectedLead.is_qualified
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {selectedLead.is_qualified
                            ? "✓ Qualified"
                            : "✗ Not Qualified"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Last Activity
                        </label>
                        <p className="text-gray-900">
                          {selectedLead.last_activity_at
                            ? new Date(
                                selectedLead.last_activity_at
                              ).toLocaleDateString()
                            : "No activity recorded"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Created Date
                        </label>
                        <p className="text-gray-900">
                          {new Date(
                            selectedLead.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedLead.updatedAt &&
                        selectedLead.updatedAt !== selectedLead.createdAt && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Last Updated
                            </label>
                            <p className="text-gray-900">
                              {new Date(
                                selectedLead.updatedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditLead(selectedLead);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Lead
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedLead(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Lead Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditModal ? "Edit Lead" : "Create New Lead"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedLead(null);
                    setFormErrors([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {formErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-red-800 font-medium mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source *
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="website">Website</option>
                      <option value="facebook_ads">Facebook Ads</option>
                      <option value="google_ads">Google Ads</option>
                      <option value="referral">Referral</option>
                      <option value="events">Events</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="lost">Lost</option>
                      <option value="won">Won</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      name="score"
                      value={formData.score}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Value ($)
                    </label>
                    <input
                      type="number"
                      name="lead_value"
                      value={formData.lead_value}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_qualified"
                    checked={formData.is_qualified}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Mark as Qualified
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedLead(null);
                      setFormErrors([]);
                    }}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                    {submitting
                      ? "Saving..."
                      : showEditModal
                      ? "Update Lead"
                      : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Delete Lead</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLead(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Confirm Deletion
                    </h3>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to delete the lead for{" "}
                  <strong className="text-gray-900">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </strong>{" "}
                  from{" "}
                  <strong className="text-gray-900">
                    {selectedLead.company}
                  </strong>
                  ?
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedLead(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {submitting ? "Deleting..." : "Delete Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && leadStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Lead Statistics
                </h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">
                          Total Leads
                        </span>
                        <span className="text-2xl font-bold text-blue-800">
                          {leadStats.totalLeads}
                        </span>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 font-medium">
                          Qualified Leads
                        </span>
                        <span className="text-2xl font-bold text-green-800">
                          {leadStats.qualifiedLeads}
                        </span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-700 font-medium">
                          Average Score
                        </span>
                        <span className="text-2xl font-bold text-yellow-800">
                          {leadStats.averageScore || 0}/100
                        </span>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-700 font-medium">
                          Total Value
                        </span>
                        <span className="text-2xl font-bold text-purple-800">
                          ${(leadStats.totalLeadValue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Status Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(leadStats.statusBreakdown || {}).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                status === "new"
                                  ? "bg-blue-500"
                                  : status === "contacted"
                                  ? "bg-yellow-500"
                                  : status === "qualified"
                                  ? "bg-green-500"
                                  : status === "lost"
                                  ? "bg-red-500"
                                  : status === "won"
                                  ? "bg-purple-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span className="text-gray-700 capitalize font-medium">
                              {status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {count}
                            </span>
                            <span className="text-sm text-gray-500">
                              (
                              {((count / leadStats.totalLeads) * 100).toFixed(
                                1
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Source Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(leadStats.sourceBreakdown || {}).map(
                      ([source, count]) => (
                        <div
                          key={source}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="text-gray-700 capitalize font-medium">
                            {source.replace("_", " ")}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {count}
                            </span>
                            <span className="text-sm text-gray-500">
                              (
                              {((count / leadStats.totalLeads) * 100).toFixed(
                                1
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowStatsModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdvancedFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Advanced Filters
                </h2>
                <button
                  onClick={() => setShowAdvancedFilter(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <AdvancedFilterForm
                onApply={(filters) => {
                  applyAdvancedFilters(filters);
                  setShowAdvancedFilter(false);
                }}
                onClear={() => {
                  clearAdvancedFilters();
                  setShowAdvancedFilter(false);
                }}
                currentFilters={advancedFilters}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagementPage;
