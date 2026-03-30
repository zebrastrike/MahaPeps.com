"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
}

interface StackItem {
  id: string;
  role: string | null;
  sortOrder: number;
  product: Product;
}

interface Stack {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  focus: string | null;
  imageUrl: string | null;
  priceCents: number;
  savingsPercent: number;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  items: StackItem[];
}

export default function AdminStackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stackId = params.stackId as string;

  const [stack, setStack] = useState<Stack | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addProductId, setAddProductId] = useState("");
  const [addRole, setAddRole] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    focus: "",
    priceCents: 0,
    savingsPercent: 10,
    isActive: true,
    isPopular: false,
    displayOrder: 0,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const getToken = () => localStorage.getItem("token") || "";

  const fetchStack = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/stacks/${stackId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) { router.push("/admin/stacks"); return; }
      const data = await res.json();
      setStack(data);
      setForm({
        name: data.name,
        slug: data.slug,
        tagline: data.tagline || "",
        description: data.description || "",
        focus: data.focus || "",
        priceCents: data.priceCents,
        savingsPercent: data.savingsPercent,
        isActive: data.isActive,
        isPopular: data.isPopular,
        displayOrder: data.displayOrder,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiBase}/catalog/products`);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchStack(); fetchProducts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/admin/stacks/${stackId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setStack(updated);
        alert("Stack saved!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save");
      }
    } catch (e) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addProduct = async () => {
    if (!addProductId) return;
    try {
      const res = await fetch(`${apiBase}/admin/stacks/${stackId}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: addProductId,
          role: addRole || undefined,
          sortOrder: (stack?.items.length || 0) + 1,
        }),
      });
      if (res.ok) {
        setStack(await res.json());
        setAddProductId("");
        setAddRole("");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add product");
      }
    } catch (e) {
      alert("Failed to add product");
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Remove this product from the stack?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/stacks/${stackId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setStack(await res.json());
    } catch (e) {
      alert("Failed to remove");
    }
  };

  const updateItemRole = async (itemId: string, role: string) => {
    try {
      const res = await fetch(`${apiBase}/admin/stacks/${stackId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      if (res.ok) setStack(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  // Products not already in this stack
  const availableProducts = products.filter(
    (p) => !stack?.items.some((item) => item.product.id === p.id)
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-slate-400">Loading stack...</div>
      </div>
    );
  }

  if (!stack) return null;

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/stacks"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stacks
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{stack.name}</h1>
        <p className="text-sm text-slate-500">Edit stack details, pricing, and products</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left — Stack Details */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Stack Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Focus</label>
                <input
                  type="text"
                  value={form.focus}
                  onChange={(e) => setForm({ ...form, focus: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bundle Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(form.priceCents / 100).toFixed(2)}
                  onChange={(e) => setForm({ ...form, priceCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Savings %</label>
                <input
                  type="number"
                  value={form.savingsPercent}
                  onChange={(e) => setForm({ ...form, savingsPercent: parseInt(e.target.value || "10") })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value || "0") })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                Active (visible on site)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                Featured on homepage
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Right — Products in Stack */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Products ({stack.items.length})
            </h2>

            {/* Current Items */}
            <div className="space-y-3 mb-6">
              {stack.items.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">
                  No products added yet
                </p>
              ) : (
                stack.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-slate-300" />
                        <span className="text-sm font-medium text-slate-900">
                          {item.product.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.role || ""}
                      onChange={(e) => updateItemRole(item.id, e.target.value)}
                      placeholder="Role in this stack..."
                      className="w-full mt-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Add Product */}
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Add Product</h3>
              <select
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-2"
              >
                <option value="">Select product...</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                placeholder="Role description (optional)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mb-2"
              />
              <button
                onClick={addProduct}
                disabled={!addProductId}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add to Stack
              </button>
            </div>
          </div>

          {/* Preview Link */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <a
              href={`/stacks/${stack.slug}`}
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Preview: /stacks/{stack.slug} &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
