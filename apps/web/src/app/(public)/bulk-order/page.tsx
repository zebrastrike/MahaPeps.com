"use client";

import { BulkOrderUpload } from "@/components/orders/bulk-order-upload";
import { Package } from "lucide-react";

export default function BulkOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Order Center</h1>
              <p className="text-gray-600">
                Upload CSV files for large research material orders
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Benefits of Bulk Ordering</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload hundreds of items at once via CSV</li>
              <li>• Volume discounts available (contact for pricing)</li>
              <li>• Priority processing for institutional orders</li>
              <li>• Dedicated account manager for large accounts</li>
            </ul>
          </div>
        </div>

        <BulkOrderUpload />
      </div>
    </div>
  );
}
