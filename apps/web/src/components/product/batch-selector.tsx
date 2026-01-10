"use client";

import { useState, useEffect } from "react";
import { Check, FileText, AlertTriangle } from "lucide-react";

interface Batch {
  id: string;
  batchCode: string;
  purityPercent: string;
  manufacturedAt: string;
  expiresAt: string;
  testingLab: string | null;
  isActive: boolean;
  hasCoa: boolean;
  coaFileCount: number;
}

interface BatchSelectorProps {
  productId: string;
  variantId-: string;
  selectedBatchId-: string;
  onBatchSelect: (batch: Batch) => void;
  onViewCoa-: (batchId: string) => void;
}

export function BatchSelector({
  productId,
  variantId,
  selectedBatchId,
  onBatchSelect,
  onViewCoa,
}: BatchSelectorProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [productId, variantId]);

  const fetchBatches = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const endpoint = variantId
        - `${apiBaseUrl}/batches/variant/${variantId}`
        : `${apiBaseUrl}/batches/product/${productId}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await response.json();
      setBatches(data);

      // Auto-select first active batch with COA if none selected
      if (!selectedBatchId && data.length > 0) {
        const firstActive =
          data.find((b: Batch) => b.isActive && b.hasCoa) ||
          data.find((b: Batch) => b.isActive);
        if (firstActive) {
          onBatchSelect(firstActive);
        }
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  if (loading) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">No batches available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Select Batch</label>

      <div className="relative">
        {/* Selected Batch Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
        >
          {selectedBatch - (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{selectedBatch.batchCode}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <span className="font-medium text-blue-600">
                    {parseFloat(selectedBatch.purityPercent).toFixed(2)}% Purity
                  </span>
                  <span>-</span>
                  <span>Exp: {new Date(selectedBatch.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedBatch.hasCoa && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onViewCoa) onViewCoa(selectedBatch.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View COA
                </button>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Select a batch...</span>
          )}

          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen - "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80 overflow-auto">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => {
                    onBatchSelect(batch);
                    setIsOpen(false);
                  }}
                  disabled={!batch.isActive}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                    !batch.isActive - "opacity-50 cursor-not-allowed" : ""
                  } ${batch.id === selectedBatchId - "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{batch.batchCode}</p>
                        {batch.id === selectedBatchId && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                        {!batch.isActive && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium text-blue-600">
                          {parseFloat(batch.purityPercent).toFixed(2)}%
                        </span>
                        <span>-</span>
                        <span>Mfg: {new Date(batch.manufacturedAt).toLocaleDateString()}</span>
                        <span>-</span>
                        <span>Exp: {new Date(batch.expiresAt).toLocaleDateString()}</span>
                      </div>

                      {batch.testingLab && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tested by: {batch.testingLab}
                        </p>
                      )}
                    </div>

                    {batch.hasCoa && (
                      <div className="ml-3 flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        <FileText className="w-3 h-3" />
                        <span>COA</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Batch Info Card */}
      {selectedBatch && (
        <div className="border rounded-lg p-3 bg-gray-50 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600 text-xs mb-0.5">Manufactured</p>
              <p className="font-medium">
                {new Date(selectedBatch.manufacturedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs mb-0.5">Expires</p>
              <p className="font-medium">
                {new Date(selectedBatch.expiresAt).toLocaleDateString()}
              </p>
            </div>
            {selectedBatch.testingLab && (
              <>
                <div className="col-span-2">
                  <p className="text-gray-600 text-xs mb-0.5">Testing Laboratory</p>
                  <p className="font-medium">{selectedBatch.testingLab}</p>
                </div>
              </>
            )}
          </div>

          {!selectedBatch.hasCoa && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              COA not yet uploaded for this batch
            </div>
          )}
        </div>
      )}
    </div>
  );
}
