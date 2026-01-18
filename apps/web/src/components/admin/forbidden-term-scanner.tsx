"use client";

import { useEffect, useState } from "react";

/**
 * CRITICAL COMPLIANCE COMPONENT
 *
 * Scans text for forbidden medical claims and therapeutic language
 * Based on GUARDRAILS.md Section 2: Forbidden Terms
 *
 * DO NOT disable or bypass this scanner without legal approval
 */

// Forbidden terms from GUARDRAILS.md
const FORBIDDEN_TERMS = {
  medicalClaims: [
    "cure",
    "cures",
    "curing",
    "treat",
    "treats",
    "treating",
    "treatment",
    "therapy",
    "therapeutic",
    "heal",
    "heals",
    "healing",
    "diagnose",
    "diagnosis",
    "prevent",
    "prevents",
    "preventing",
    "prevention"
  ],
  healthBenefits: [
    "weight loss",
    "lose weight",
    "burn fat",
    "fat burning",
    "anti-aging",
    "antiaging",
    "muscle gain",
    "muscle growth",
    "build muscle",
    "improve performance",
    "boost energy",
    "increase energy",
    "enhance recovery"
  ],
  medicalConditions: [
    "diabetes",
    "cancer",
    "alzheimer",
    "arthritis",
    "obesity",
    "depression",
    "anxiety",
    "hypertension",
    "high blood pressure"
  ],
  regulatedSubstances: [
    "anabolic",
    "steroid",
    "hgh",
    "human growth hormone",
    "testosterone"
  ],
  therapeuticLanguage: [
    "clinical",
    "patient",
    "patients",
    "dose",
    "dosage",
    "prescription",
    "medication",
    "medicine",
    "drug",
    "pharmaceutical"
  ]
};

interface ScanResult {
  violations: string[];
  isClean: boolean;
  violationsByCategory: Record<string, string[]>;
}

function scanText(text: string): ScanResult {
  const lowerText = text.toLowerCase();
  const violations: string[] = [];
  const violationsByCategory: Record<string, string[]> = {};

  // Check each category
  Object.entries(FORBIDDEN_TERMS).forEach(([category, terms]) => {
    const foundTerms: string[] = [];

    terms.forEach((term) => {
      // Use word boundaries to avoid false positives
      const regex = new RegExp(`\\b${term}\\b`, "i");
      if (regex.test(text)) {
        foundTerms.push(term);
        violations.push(term);
      }
    });

    if (foundTerms.length > 0) {
      violationsByCategory[category] = foundTerms;
    }
  });

  return {
    violations,
    isClean: violations.length === 0,
    violationsByCategory
  };
}

interface ForbiddenTermScannerProps {
  text: string;
  fieldName?: string;
  onViolationsChange?: (hasViolations: boolean) => void;
}

export function ForbiddenTermScanner({
  text,
  fieldName = "Text",
  onViolationsChange
}: ForbiddenTermScannerProps) {
  const [scanResult, setScanResult] = useState<ScanResult>({
    violations: [],
    isClean: true,
    violationsByCategory: {}
  });

  useEffect(() => {
    if (!text.trim()) {
      setScanResult({ violations: [], isClean: true, violationsByCategory: {} });
      onViolationsChange?.(false);
      return;
    }

    const result = scanText(text);
    setScanResult(result);
    onViolationsChange?.(!result.isClean);
  }, [text, onViolationsChange]);

  if (scanResult.isClean) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-600">✓</span>
          <span className="font-medium text-emerald-900">No compliance violations detected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border-2 border-red-500 bg-red-50 p-4">
      <div className="mb-2 flex items-start gap-2">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-bold text-red-900">COMPLIANCE VIOLATION DETECTED</h4>
          <p className="mt-1 text-sm text-red-800">
            {fieldName} contains forbidden medical claims or therapeutic language
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {Object.entries(scanResult.violationsByCategory).map(([category, terms]) => (
          <div key={category} className="rounded bg-white p-3">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-900">
              {category.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div className="flex flex-wrap gap-1">
              {terms.map((term) => (
                <code
                  key={term}
                  className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                >
                  &quot;{term}&quot;
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-900">
        <p className="font-semibold">⚡ Action Required:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1">
          <li>Remove or replace all highlighted terms</li>
          <li>Use neutral, research-focused language only</li>
          <li>Focus on product specifications and analytical properties</li>
          <li>Examples: &quot;Research peptide for laboratory use&quot; instead of &quot;treats diabetes&quot;</li>
        </ul>
      </div>
    </div>
  );
}

export { scanText };
