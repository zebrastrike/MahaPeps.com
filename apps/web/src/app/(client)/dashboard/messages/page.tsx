"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products - messaging feature not needed for B2C
    router.push("/products");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-charcoal-300">Redirecting...</p>
    </div>
  );
}
