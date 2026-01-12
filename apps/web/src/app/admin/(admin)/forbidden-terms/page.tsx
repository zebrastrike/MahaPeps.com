"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, AlertTriangle } from "lucide-react";

interface ForbiddenTerm {
  id: string;
  term: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string | null;
  replacement: string | null;
  active: boolean;
  createdAt: string;
}

const maskSensitiveTerm = (value: string) => (value ? "[redacted]" : value);

export default function ForbiddenTermsManager() {
  const [terms, setTerms] = useState<ForbiddenTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTerm, setEditingTerm] = useState<ForbiddenTerm | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<ForbiddenTerm>>({
    term: "",
    severity: "HIGH",
    category: "",
    replacement: "",
    active: true,
  });

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/compliance/forbidden-terms`);

      if (!response.ok) throw new Error("Failed to fetch terms");

      const data = await response.json();
      setTerms(data);
    } catch (error) {
      console.error("Error loading terms:", error);
      // Load mock data for development
      setTerms(getMockTerms());
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTerm(null);
    setFormData({
      term: "",
      severity: "HIGH",
      category: "",
      replacement: "",
      active: true,
    });
  };

  const handleEdit = (term: ForbiddenTerm) => {
    setEditingTerm(term);
    setIsCreating(false);
    setFormData({
      term: term.term,
      severity: term.severity,
      category: term.category || "",
      replacement: term.replacement || "",
      active: term.active,
    });
  };

  const handleSave = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const method = editingTerm ? "PATCH" : "POST";
      const url = editingTerm
        ? `${apiBaseUrl}/compliance/forbidden-terms/${editingTerm.id}`
        : `${apiBaseUrl}/compliance/forbidden-terms`;

      // TODO: Implement API call
      console.log("Save term:", { method, formData });

      // Mock save
      alert("Term saved (API integration pending)");

      setIsCreating(false);
      setEditingTerm(null);
      loadTerms();
    } catch (error) {
      console.error("Error saving term:", error);
    }
  };

  const handleDelete = async (termId: string) => {
    if (!confirm("Are you sure you want to delete this forbidden term?")) {
      return;
    }

    try {
      // TODO: Implement API call
      console.log("Delete term:", termId);
      alert("Term deleted (API integration pending)");
      loadTerms();
    } catch (error) {
      console.error("Error deleting term:", error);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTerm(null);
    setFormData({
      term: "",
      severity: "HIGH",
      category: "",
      replacement: "",
      active: true,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading forbidden terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                Forbidden Terms Manager
              </h1>
              <p className="text-gray-600 mt-1">
                Manage prohibited terms for compliance enforcement
              </p>
            </div>

            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Term
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTerm) && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingTerm ? "Edit Forbidden Term" : "Create New Forbidden Term"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                  placeholder="e.g., restricted term"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Term values are hidden in the UI for compliance.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category ?? ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., medical, claims"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suggested Replacement
                </label>
                <input
                  type="text"
                  value={formData.replacement ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, replacement: e.target.value })
                  }
                  placeholder="e.g., research peptide"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={handleSave}
                disabled={!formData.term}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Term
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Terms Table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Replacement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {terms.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {maskSensitiveTerm(term.term)}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(
                        term.severity
                      )}`}
                    >
                      {term.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {term.category || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {term.replacement ? (
                      <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {maskSensitiveTerm(term.replacement)}
                      </code>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        term.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {term.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(term)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Showing {terms.length} forbidden term{terms.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// Mock data for development
function getMockTerms(): ForbiddenTerm[] {
  return [
    {
      id: "1",
      term: "restricted-term-1",
      severity: "CRITICAL",
      category: "medical",
      replacement: "research peptide",
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      term: "restricted-term-2",
      severity: "CRITICAL",
      category: "dosing",
      replacement: "concentration",
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      term: "restricted-term-3",
      severity: "CRITICAL",
      category: "medical",
      replacement: "research application",
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

