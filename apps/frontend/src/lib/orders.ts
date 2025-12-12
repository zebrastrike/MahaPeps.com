import { apiClient } from "./api-client";

export type OrderStatus = "processing" | "packed" | "shipped" | "delivered";

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  nextMilestone?: string;
};

export type OrderLineItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  batchId: string;
  coaUrl: string;
};

export type BatchDetail = {
  id: string;
  lotNumber: string;
  status: "allocated" | "in-transit" | "delivered";
  packaging: string;
  storage: string;
  notes: string;
  coaUrl: string;
};

export type OrderDetail = OrderSummary & {
  shipmentEta?: string;
  trackingNumber?: string;
  deliveryAddress: string;
  items: OrderLineItem[];
  batches: BatchDetail[];
  contactEmail: string;
};

export type DashboardOverview = {
  recentOrders: OrderSummary[];
  nextShipment: {
    orderId: string;
    eta: string;
    carrier: string;
    status: string;
    items: string[];
  };
  quickLinks: { label: string; href: string; description: string }[];
};

const fallbackOrders: OrderDetail[] = [
  {
    id: "ORD-4821",
    orderNumber: "ORD-4821",
    status: "processing",
    createdAt: "2024-08-12T10:30:00Z",
    total: 1245.5,
    nextMilestone: "Packing",
    shipmentEta: "2024-08-18",
    deliveryAddress: "Nova Research Lab, 221B Market St, Suite 300, San Francisco, CA",
    trackingNumber: undefined,
    contactEmail: "ops@novaresearch.com",
    items: [
      {
        sku: "SRP-10",
        name: "Signal Reference Peptide",
        quantity: 2,
        unitPrice: 320,
        batchId: "BCH-2407-01",
        coaUrl: "https://example.com/coa/signal-reference-peptide.pdf",
      },
      {
        sku: "BSK-500",
        name: "Buffer System Kit",
        quantity: 1,
        unitPrice: 605.5,
        batchId: "BCH-2406-11",
        coaUrl: "https://example.com/coa/buffer-system-kit.pdf",
      },
    ],
    batches: [
      {
        id: "BCH-2407-01",
        lotNumber: "LRP-2407",
        status: "allocated",
        packaging: "2 x 10 mg vials, tamper-evident seal",
        storage: "Store at -20°C; keep desiccated until opened.",
        notes: "Allocated for QA-cleared dispatch.",
        coaUrl: "https://example.com/coa/signal-reference-peptide.pdf",
      },
      {
        id: "BCH-2406-11",
        lotNumber: "BSK-2406",
        status: "allocated",
        packaging: "3 x 500 mL bottles, shrink-wrapped",
        storage: "Maintain at 2-8°C; avoid freezing.",
        notes: "Cooling packs requested for transit.",
        coaUrl: "https://example.com/coa/buffer-system-kit.pdf",
      },
    ],
  },
  {
    id: "ORD-1580",
    orderNumber: "ORD-1580",
    status: "shipped",
    createdAt: "2024-08-05T14:15:00Z",
    total: 890,
    nextMilestone: "Carrier in transit",
    shipmentEta: "2024-08-15",
    deliveryAddress: "Helix Core Facility, 900 1st Ave, Seattle, WA",
    trackingNumber: "GX-9930145",
    contactEmail: "purchasing@helixcore.io",
    items: [
      {
        sku: "BSK-250",
        name: "Buffer System Kit",
        quantity: 1,
        unitPrice: 380,
        batchId: "BCH-2403-09",
        coaUrl: "https://example.com/coa/buffer-system-kit-2403.pdf",
      },
      {
        sku: "SBR-10",
        name: "Surface Blocking Reagent",
        quantity: 2,
        unitPrice: 255,
        batchId: "BCH-2408-04",
        coaUrl: "https://example.com/coa/surface-blocking-reagent.pdf",
      },
    ],
    batches: [
      {
        id: "BCH-2403-09",
        lotNumber: "BSK-2403",
        status: "in-transit",
        packaging: "3 x 250 mL bottles",
        storage: "Keep refrigerated upon arrival; do not freeze.",
        notes: "Reserved inventory fulfilled from QA hold.",
        coaUrl: "https://example.com/coa/buffer-system-kit-2403.pdf",
      },
      {
        id: "BCH-2408-04",
        lotNumber: "SBR-2408",
        status: "in-transit",
        packaging: "10 x 10 mL vials",
        storage: "Ship with cold packs; refrigerate after receipt.",
        notes: "Latest lot with updated label artwork.",
        coaUrl: "https://example.com/coa/surface-blocking-reagent.pdf",
      },
    ],
  },
  {
    id: "ORD-1042",
    orderNumber: "ORD-1042",
    status: "delivered",
    createdAt: "2024-07-22T09:00:00Z",
    total: 450,
    nextMilestone: "Delivered",
    shipmentEta: "2024-07-28",
    deliveryAddress: "Atlas Analytics, 77 Industrial Way, Austin, TX",
    trackingNumber: "GX-9922011",
    contactEmail: "lab@atlasanalytics.ai",
    items: [
      {
        sku: "SBR-10",
        name: "Surface Blocking Reagent",
        quantity: 1,
        unitPrice: 225,
        batchId: "BCH-2408-04",
        coaUrl: "https://example.com/coa/surface-blocking-reagent.pdf",
      },
      {
        sku: "SRP-10",
        name: "Signal Reference Peptide",
        quantity: 1,
        unitPrice: 225,
        batchId: "BCH-2405-02",
        coaUrl: "https://example.com/coa/signal-reference-peptide-2405.pdf",
      },
    ],
    batches: [
      {
        id: "BCH-2408-04",
        lotNumber: "SBR-2408",
        status: "delivered",
        packaging: "10 x 10 mL vials",
        storage: "Store at 2-8°C after opening shipment.",
        notes: "Delivery confirmed with tamper seal intact.",
        coaUrl: "https://example.com/coa/surface-blocking-reagent.pdf",
      },
      {
        id: "BCH-2405-02",
        lotNumber: "LRP-2405",
        status: "delivered",
        packaging: "10 mg vial",
        storage: "Keep frozen; limit light exposure.",
        notes: "Archive COA included in carton.",
        coaUrl: "https://example.com/coa/signal-reference-peptide-2405.pdf",
      },
    ],
  },
];

const dashboardOverviewFallback: DashboardOverview = {
  recentOrders: fallbackOrders.map(({ id, orderNumber, status, createdAt, total, nextMilestone }) => ({
    id,
    orderNumber,
    status,
    createdAt,
    total,
    nextMilestone,
  })),
  nextShipment: {
    orderId: "ORD-1580",
    eta: "2024-08-15",
    carrier: "Ground Express",
    status: "Label created",
    items: ["Buffer System Kit x1", "Surface Blocking Reagent x2"],
  },
  quickLinks: [
    {
      label: "Track orders",
      href: "/dashboard/orders",
      description: "View statuses, invoices, and proof of delivery.",
    },
    {
      label: "Update settings",
      href: "/dashboard/settings",
      description: "Manage contact info, passwords, and addresses.",
    },
    {
      label: "Browse catalog",
      href: "/catalog",
      description: "See available products with batch-level details.",
    },
  ],
};

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return apiClient<DashboardOverview>("/client/dashboard", { fallback: dashboardOverviewFallback, cache: "no-store" });
}

export async function fetchOrders(): Promise<OrderSummary[]> {
  const summaries = fallbackOrders.map(({ id, orderNumber, status, createdAt, total, nextMilestone }) => ({
    id,
    orderNumber,
    status,
    createdAt,
    total,
    nextMilestone,
  }));

  return apiClient<OrderSummary[]>("/client/orders", { fallback: summaries, cache: "no-store" });
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const fallback = fallbackOrders.find((order) => order.id === orderId) ?? null;
  return apiClient<OrderDetail | null>(`/client/orders/${orderId}`, { fallback, cache: "no-store" });
}
