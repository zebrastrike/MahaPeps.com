"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products catalog - pricing shown on individual products
    router.push("/products");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-charcoal-300">Redirecting to product catalog...</p>
    </div>
  );
}
