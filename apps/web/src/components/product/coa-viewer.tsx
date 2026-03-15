"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText } from "lucide-react";

interface CoaData {
  fileId: string;
  downloadUrl: string;
  uploadedAt: string | null;
  purityPercent: string;
  testingLab: string | null;
  batchCode: string;
}

interface CoaViewerProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CoaViewer({ batchId, isOpen, onClose }: CoaViewerProps) {
  const [coaData, setCoaData] = useState<CoaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && batchId) {
      fetchCoaData();
    }
  }, [isOpen, batchId]);

  const fetchCoaData = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/batches/${batchId}/coa`);

      if (!response.ok) {
        throw new Error("COA not found");
      }

      const data = await response.json();
      setCoaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load COA");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!coaData) return;

    // Open in new tab to trigger browser download
    window.open(coaData.downloadUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-accent-700" />
            <div>
              <h2 className="text-lg font-semibold">Certificate of Analysis</h2>
              {coaData && (
                <p className="text-sm text-gray-600">Batch: {coaData.batchCode}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-140px)] overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-600"></div>
                <p className="text-gray-600">Loading COA...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-semibold mb-2">COA Not Available</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {coaData && !loading && !error && (
            <div className="p-4 space-y-4">
              {/* COA Metadata */}
              <div className="grid grid-cols-3 gap-4 rounded-xl bg-accent-50 p-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Purity</p>
                  <p className="text-2xl font-bold text-accent-700">
                    {parseFloat(coaData.purityPercent).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Testing Lab</p>
                  <p className="text-sm font-semibold">
                    {coaData.testingLab || "Unavailable"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Upload Date</p>
                  <p className="text-sm">
                    {coaData.uploadedAt
                      ? new Date(coaData.uploadedAt).toLocaleDateString()
                      : "Unavailable"}
                  </p>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  src={coaData.downloadUrl}
                  className="w-full h-[600px]"
                  title="Certificate of Analysis"
                />
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="font-semibold mb-1">Research Use Only</p>
                <p className="text-gray-700">
                  This Certificate of Analysis is provided for research verification purposes only.
                  All products are intended for laboratory research use only and not for human consumption.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {coaData && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Uploaded:{" "}
              {coaData.uploadedAt
                ? new Date(coaData.uploadedAt).toLocaleDateString()
                : "Unavailable"}
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-full bg-accent-600 px-4 py-2 text-white transition-colors hover:bg-accent-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
