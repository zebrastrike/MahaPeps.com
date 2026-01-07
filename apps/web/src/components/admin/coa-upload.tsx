"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

interface CoaUploadProps {
  batchId: string;
  batchCode: string;
  onUploadSuccess: () => void;
  onClose?: () => void;
}

export function CoaUpload({ batchId, batchCode, onUploadSuccess, onClose }: CoaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [purityPercent, setPurityPercent] = useState<string>("");
  const [testingLab, setTestingLab] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        setFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a COA file");
      return;
    }

    if (!purityPercent || parseFloat(purityPercent) < 0 || parseFloat(purityPercent) > 100) {
      setError("Please enter a valid purity percentage (0-100)");
      return;
    }

    if (!testingLab.trim()) {
      setError("Please enter the testing lab name");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedById", "admin-user-id"); // TODO: Get from auth context
      formData.append("purityPercent", purityPercent);
      formData.append("testingLab", testingLab);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/batches/${batchId}/coa`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      setSuccess(true);

      // Call success callback after 1 second
      setTimeout(() => {
        onUploadSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload COA");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPurityPercent("");
    setTestingLab("");
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Upload Certificate of Analysis</h3>
            <p className="text-sm text-gray-600">Batch: {batchCode}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {success ? (
        <div className="py-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-green-700 mb-2">COA Uploaded Successfully!</h4>
          <p className="text-gray-600 mb-4">Batch has been activated and is now available for sale.</p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Upload Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              COA File (PDF Only) <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="coa-file-input"
              />
              <label
                htmlFor="coa-file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                {file ? (
                  <div className="text-sm">
                    <p className="font-semibold text-blue-600">{file.name}</p>
                    <p className="text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="text-gray-700 font-medium">Click to upload COA</p>
                    <p className="text-gray-500">PDF only, max 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Purity Percentage */}
          <div>
            <label htmlFor="purity" className="block text-sm font-medium mb-2">
              Purity Percentage <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="purity"
                value={purityPercent}
                onChange={(e) => setPurityPercent(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                placeholder="98.50"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-gray-600 font-medium">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter the purity as shown in the COA report</p>
          </div>

          {/* Testing Lab */}
          <div>
            <label htmlFor="lab" className="block text-sm font-medium mb-2">
              Testing Laboratory <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lab"
              value={testingLab}
              onChange={(e) => setTestingLab(e.target.value)}
              placeholder="e.g., Analytical Labs Inc."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Name of the accredited lab that performed testing</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold mb-1">Compliance Note</p>
            <p className="text-gray-700">
              Batches require a valid COA before activation. Once uploaded, this batch will be
              automatically activated and available for research orders.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload COA & Activate Batch
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
