"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

interface StackItem {
  id: string;
  role: string | null;
  sortOrder: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
  };
}

interface Stack {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  focus: string | null;
  priceCents: number;
  savingsPercent: number;
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  items: StackItem[];
  _count?: { items: number };
}

export default function AdminStacksPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    focus: "",
    priceCents: 0,
    savingsPercent: 10,
    isPopular: false,
  });

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const getToken = () => localStorage.getItem("token") || "";

  const fetchStacks = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/stacks`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setStacks(await res.json());
    } catch (e) {
      console.error("Failed to fetch stacks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStacks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/admin/stacks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ name: "", slug: "", tagline: "", description: "", focus: "", priceCents: 0, savingsPercent: 10, isPopular: false });
        fetchStacks();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create stack");
      }
    } catch (e) {
      alert("Failed to create stack");
    }
  };

  const toggleActive = async (stack: Stack) => {
    await fetch(`${apiBase}/admin/stacks/${stack.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: !stack.isActive }),
    });
    fetchStacks();
  };

  const togglePopular = async (stack: Stack) => {
    await fetch(`${apiBase}/admin/stacks/${stack.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isPopular: !stack.isPopular }),
    });
    fetchStacks();
  };

  const deleteStack = async (stack: Stack) => {
    if (!confirm(`Delete "${stack.name}"? This cannot be undone.`)) return;
    await fetch(`${apiBase}/admin/stacks/${stack.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchStacks();
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-slate-400">Loading stacks...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Stacks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage curated product bundles. {stacks.length} stacks total.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Stack
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Stack</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                placeholder='e.g., "The Warrior"'
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
                placeholder="Short one-liner"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Focus / Category</label>
              <input
                type="text"
                value={form.focus}
                onChange={(e) => setForm({ ...form, focus: e.target.value })}
                placeholder='e.g., "Recovery & Healing"'
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <label className="text-sm text-slate-700">Featured / Popular</label>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create Stack
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stacks Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Stack</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Focus</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">Products</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Price</th>
              <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stacks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No stacks yet. Create your first one above.
                </td>
              </tr>
            ) : (
              stacks.map((stack) => (
                <tr key={stack.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/stacks/${stack.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {stack.name}
                    </Link>
                    {stack.tagline && (
                      <p className="text-xs text-slate-400 mt-0.5">{stack.tagline}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{stack.focus || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {stack.items.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    ${(stack.priceCents / 100).toFixed(2)}
                    <span className="text-xs text-green-600 ml-1">-{stack.savingsPercent}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      stack.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {stack.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePopular(stack)}
                        title={stack.isPopular ? "Remove from featured" : "Mark as featured"}
                        className={`p-1.5 rounded transition-colors ${
                          stack.isPopular ? "text-yellow-500 hover:bg-yellow-50" : "text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Star className="h-4 w-4" fill={stack.isPopular ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleActive(stack)}
                        title={stack.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded text-slate-400 hover:bg-slate-100"
                      >
                        {stack.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/admin/stacks/${stack.id}`}
                        className="p-1.5 rounded text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteStack(stack)}
                        className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
