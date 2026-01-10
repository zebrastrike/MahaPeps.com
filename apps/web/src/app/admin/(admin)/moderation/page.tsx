"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, AlertCircle, Info, RefreshCw, CheckCircle } from "lucide-react";

interface ViolationMatch {
  term: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string | null;
  replacement: string | null;
  context: string;
  fieldName: string;
}

interface ProductViolation {
  productId: string;
  productName: string;
  productSku: string;
  violations: ViolationMatch[];
  violationCount: number;
  highestSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isActive: boolean;
}

interface ModerationStats {
  totalProducts: number;
  productsWithViolations: number;
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
  activeProductsWithViolations: number;
}

export default function ModerationDashboard() {
  const [violations, setViolations] = useState<ProductViolation[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ProductViolation | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchViolations(), fetchStats()]);
  };

  const fetchViolations = async () => {
    setScanning(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/admin/moderation/scan`);

      if (!response.ok) throw new Error("Failed to fetch violations");

      const data = await response.json();
      setViolations(data);
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/admin/moderation/stats`);

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertTriangle className="w-4 h-4" />;
      case "HIGH":
        return <AlertCircle className="w-4 h-4" />;
      case "MEDIUM":
      case "LOW":
        return <Info className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredViolations =
    filterSeverity === "all"
      ? violations
      : violations.filter((v) => v.highestSeverity === filterSeverity);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderation dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                <p className="text-gray-600">Compliance violation scanner for product catalog</p>
              </div>
            </div>

            <button
              onClick={fetchViolations}
              disabled={scanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? "Scanning..." : "Rescan Products"}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Products</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">With Violations</div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.productsWithViolations}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Active & Violated</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.activeProductsWithViolations}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Compliance Rate</div>
              <div className="text-3xl font-bold text-green-600">
                {((1 - stats.productsWithViolations / stats.totalProducts) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Severity Breakdown */}
        {stats && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Violations by Severity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Critical: {stats.criticalViolations}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm">High: {stats.highViolations}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Medium: {stats.mediumViolations}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Low: {stats.lowViolations}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Severity:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {filteredViolations.length} of {violations.length} products
            </span>
          </div>
        </div>

        {/* Violations List */}
        {filteredViolations.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-600">
              No compliance violations found in your product catalog.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredViolations.map((violation) => (
              <div key={violation.productId} className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {violation.productName}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(
                          violation.highestSeverity
                        )} flex items-center gap-1`}
                      >
                        {getSeverityIcon(violation.highestSeverity)}
                        {violation.highestSeverity}
                      </span>
                      {violation.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">SKU: {violation.productSku}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {violation.violationCount}
                    </div>
                    <div className="text-xs text-gray-600">Violations</div>
                  </div>
                </div>

                {/* Violations */}
                <div className="space-y-2">
                  {violation.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${getSeverityColor(v.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Forbidden Term:</span>
                            <code className="px-2 py-0.5 bg-white rounded text-sm">
                              "{v.term}"
                            </code>
                            {v.category && (
                              <span className="text-xs">({v.category})</span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Field:</span> {v.fieldName}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium">Context:</span>{" "}
                            <span className="italic">{v.context}</span>
                          </div>
                        </div>
                      </div>

                      {v.replacement && (
                        <div className="mt-2 p-2 bg-white rounded text-sm">
                          <span className="font-medium text-green-700">Suggested Fix:</span>{" "}
                          <code className="text-green-600">"{v.replacement}"</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <a
                    href={`/admin/products/${violation.productId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    Edit Product
                  </a>
                  <button className="px-4 py-2 border rounded hover:bg-gray-50 text-sm font-medium">
                    View Auto-Fix Suggestions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

