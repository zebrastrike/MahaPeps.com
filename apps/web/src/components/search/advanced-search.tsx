"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchFilters {
  category?: string;
  minPurity?: number;
  maxPurity?: number;
  minPrice?: number;
  maxPrice?: number;
  hasCoa?: boolean;
}

interface Suggestion {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: "product";
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear?: () => void;
}

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterOptions, setFilterOptions] = useState<{
    categories: string[];
    purityRange: { min: number; max: number };
    priceRange: { min: number; max: number };
  } | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchFilterOptions = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/catalog/search/filters`);

      if (!response.ok) throw new Error("Failed to fetch filter options");

      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    setLoadingSuggestions(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(
        `${apiBaseUrl}/catalog/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(query, filters);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name, filters);
  };

  const handleClear = () => {
    setQuery("");
    setFilters({});
    setSuggestions([]);
    setShowSuggestions(false);
    if (onClear) onClear();
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const hasActiveFilters =
    Object.values(filters).filter((v) => v !== undefined && v !== "").length > 0;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-100" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search by name, SKU, CAS number, or molecular formula..."
                className="w-full rounded-lg border border-blue-500 bg-blue-600 py-3 pl-10 pr-10 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-blue-100 hover:bg-blue-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {loadingSuggestions && (
                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-100" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{suggestion.name}</div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        SKU: {suggestion.sku} • {suggestion.category}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter((v) => v !== undefined && v !== "").length}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Advanced Filters */}
      {showFilters && filterOptions && (
        <div className="px-4 pb-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => updateFilter("category", e.target.value || undefined)}
                className="w-full rounded-lg border border-blue-500 bg-blue-600 px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 [&>option]:bg-blue-600 [&>option]:text-white"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat?.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Purity Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Purity (%)
              </label>
              <input
                type="number"
                min={filterOptions.purityRange.min}
                max={filterOptions.purityRange.max}
                step="0.1"
                value={filters.minPurity || ""}
                onChange={(e) =>
                  updateFilter("minPurity", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="e.g., 95"
                className="w-full rounded-lg border border-blue-500 bg-blue-600 px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Purity (%)
              </label>
              <input
                type="number"
                min={filterOptions.purityRange.min}
                max={filterOptions.purityRange.max}
                step="0.1"
                value={filters.maxPurity || ""}
                onChange={(e) =>
                  updateFilter("maxPurity", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="e.g., 100"
                className="w-full rounded-lg border border-blue-500 bg-blue-600 px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* COA Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                COA Status
              </label>
              <select
                value={
                  filters.hasCoa === undefined ? "" : filters.hasCoa ? "true" : "false"
                }
                onChange={(e) =>
                  updateFilter(
                    "hasCoa",
                    e.target.value === "" ? undefined : e.target.value === "true"
                  )
                }
                className="w-full rounded-lg border border-blue-500 bg-blue-600 px-3 py-2 text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 [&>option]:bg-blue-600 [&>option]:text-white"
              >
                <option value="">Any</option>
                <option value="true">COA Available</option>
                <option value="false">No COA</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({})}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
