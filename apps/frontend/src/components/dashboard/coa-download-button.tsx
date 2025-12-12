import { Download } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CoaDownloadButtonProps {
  href: string;
  label?: string;
}

export function CoaDownloadButton({ href, label = "Download COA" }: CoaDownloadButtonProps) {
  return (
    <Button asChild variant="outline" size="sm" className="justify-start">
      <Link href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
        <Download className="h-4 w-4" aria-hidden />
        <span>{label}</span>
      </Link>
    </Button>
  );
}
