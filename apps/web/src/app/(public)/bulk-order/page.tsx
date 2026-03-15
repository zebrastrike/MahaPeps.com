"use client";

import { BulkOrderUpload } from "@/components/orders/bulk-order-upload";
import { Package } from "lucide-react";

export default function BulkOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-10 w-10 text-accent-700" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Order Center</h1>
              <p className="text-gray-600">
                Upload CSV files for large research material orders
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50 p-4">
            <h3 className="mb-2 font-semibold text-accent-900">Benefits of Bulk Ordering</h3>
            <ul className="space-y-1 text-sm text-accent-800">
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
