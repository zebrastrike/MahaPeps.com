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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Search Bar */}
      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search by name, SKU, CAS number, or molecular formula..."
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {loadingSuggestions && (
                <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-accent-500" />
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
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
            className="flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-700"
          >
            <Search className="w-5 h-5" />
            Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold transition-colors ${
              showFilters || hasActiveFilters
                ? "border-accent-300 bg-accent-50 text-accent-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-accent-600 px-2 py-0.5 text-xs text-white">
                {Object.values(filters).filter((v) => v !== undefined && v !== "").length}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Advanced Filters */}
      {showFilters && filterOptions && (
        <div className="border-t bg-slate-50 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => updateFilter("category", e.target.value || undefined)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400 [&>option]:bg-white [&>option]:text-slate-800"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400 [&>option]:bg-white [&>option]:text-slate-800"
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
                className="text-sm font-medium text-accent-600 hover:text-accent-700"
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
