"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutShell } from "@/components/layout/layout-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in?redirect=/admin");
      return;
    }

    try {
      // Verify token and check admin role
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        router.push("/sign-in?redirect=/admin");
        return;
      }

      const user = await response.json();

      if (user.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/sign-in?redirect=/admin");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <LayoutShell
      title="Admin"
      subtitle="Platform operations and governance"
      navigationDescription="Admin navigation"
      className="admin-shell"
      navigationItems={[
        { label: "Overview", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: "Orders", href: "/admin/orders" },
        { label: "Payments", href: "/admin/payments" },
        { label: "KYC", href: "/admin/kyc" },
        { label: "Users", href: "/admin/users" },
        { label: "Moderation", href: "/admin/moderation" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Audit", href: "/admin/audit" }
      ]}
    >
      {children}
    </LayoutShell>
  );
}
