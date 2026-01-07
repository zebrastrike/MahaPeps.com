"use client";

import { useState } from "react";
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

interface BulkOrderItem {
  sku: string;
  quantity: number;
  productName?: string;
  price?: number;
  valid: boolean;
  error?: string;
}

interface BulkOrderUploadProps {
  onOrderSubmit?: (items: BulkOrderItem[]) => void;
}

export function BulkOrderUpload({ onOrderSubmit }: BulkOrderUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<BulkOrderItem[]>([]);
  const [parsing, setParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        alert("Please upload a CSV file");
        return;
      }

      if (selectedFile.size > 1 * 1024 * 1024) {
        alert("File size must be less than 1MB");
        return;
      }

      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    setParsing(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must contain a header row and at least one data row");
        return;
      }

      // Parse header
      const header = lines[0].toLowerCase();
      const skuIndex = header.indexOf("sku");
      const quantityIndex = header.indexOf("quantity");

      if (skuIndex === -1 || quantityIndex === -1) {
        alert('CSV must contain "sku" and "quantity" columns');
        return;
      }

      // Parse data rows
      const parsedItems: BulkOrderItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");

        if (values.length < 2) continue;

        const sku = values[skuIndex]?.trim() || "";
        const quantity = parseInt(values[quantityIndex]?.trim() || "0");

        if (!sku || !quantity || quantity < 1) {
          parsedItems.push({
            sku,
            quantity,
            valid: false,
            error: "Invalid SKU or quantity",
          });
          continue;
        }

        // TODO: Validate SKU against product database
        // For now, mark as valid if SKU and quantity exist
        parsedItems.push({
          sku,
          quantity,
          productName: `Product ${sku}`, // TODO: Fetch from API
          price: 45.99, // TODO: Fetch from API
          valid: true,
        });
      }

      setItems(parsedItems);
      setShowPreview(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file");
    } finally {
      setParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = "sku,quantity\nBPC-157-5MG,2\nTB500-2MG,1\nGHKCU-10MG,3";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-order-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    const validItems = items.filter((item) => item.valid);

    if (validItems.length === 0) {
      alert("No valid items to order");
      return;
    }

    if (onOrderSubmit) {
      onOrderSubmit(validItems);
    }

    alert(
      `Bulk order submitted with ${validItems.length} items (functionality pending full integration)`
    );
  };

  const handleReset = () => {
    setFile(null);
    setItems([]);
    setShowPreview(false);
  };

  const validItemCount = items.filter((i) => i.valid).length;
  const invalidItemCount = items.filter((i) => !i.valid).length;
  const totalEstimate = items
    .filter((i) => i.valid && i.price)
    .reduce((sum, item) => sum + item.quantity * (item.price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Order Upload</h3>
              <p className="text-sm text-gray-600">Upload a CSV file with SKU and quantity</p>
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="bulk-order-file"
            />
            <label htmlFor="bulk-order-file" className="cursor-pointer">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Click to upload CSV file
              </p>
              <p className="text-sm text-gray-500">
                CSV format: sku, quantity (max 1MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB • {items.length} items
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {showPreview && items.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Preview</h3>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Valid Items</div>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {validItemCount}
              </div>
            </div>

            {invalidItemCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Invalid Items</div>
                <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {invalidItemCount}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Estimated Total</div>
              <div className="text-2xl font-bold text-blue-600">
                ${totalEstimate.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {items.map((item, idx) => (
                  <tr key={idx} className={item.valid ? "" : "bg-red-50"}>
                    <td className="px-4 py-3 text-sm font-mono">{item.sku}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.valid ? item.productName : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {item.price ? `$${item.price.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {item.valid && item.price
                        ? `$${(item.quantity * item.price).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.valid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          <CheckCircle className="w-3 h-3" />
                          Valid
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded"
                          title={item.error}
                        >
                          <AlertCircle className="w-3 h-3" />
                          Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={validItemCount === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Bulk Order ({validItemCount} items)
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <strong>Research Use Only:</strong> All products are intended for laboratory
            research applications only. Bulk orders will be reviewed for compliance before
            fulfillment.
          </div>
        </div>
      )}
    </div>
  );
}
