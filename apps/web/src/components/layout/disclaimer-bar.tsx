/**
 * CRITICAL COMPLIANCE COMPONENT
 *
 * This component contains all required legal disclaimers from GUARDRAILS.md
 * DO NOT modify or remove any disclaimer text without legal review
 *
 * All disclaimers MUST appear exactly as written to maintain legal compliance
 */

type DisclaimerVariant = "footer" | "product" | "checkout";

const DISCLAIMER_SECTIONS = {
  researchUseOnly: {
    title: "RESEARCH USE ONLY",
    text: "All products sold on this platform are intended solely for lawful laboratory research and analytical use. Not for human or veterinary consumption."
  },
  fda: {
    title: "FDA DISCLAIMER",
    text: "All statements on this website have not been evaluated by the Food and Drug Administration (FDA). All products are sold strictly for research, laboratory, or analytical purposes only. Products are not intended to diagnose, treat, cure, or prevent any disease."
  },
  nonPharmacy: {
    title: "NON-PHARMACY DISCLAIMER",
    text: "This site operates solely as a chemical and research materials supplier. We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act. We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act."
  },
  liability: {
    title: "LIABILITY & RESPONSIBILITY",
    text: "The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products. The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws."
  },
  noMedicalAdvice: {
    title: "NO MEDICAL ADVICE",
    text: "Nothing on this website constitutes medical, clinical, or healthcare advice. All information provided is for educational and research discussion purposes only."
  },
  ageRestriction: {
    title: "AGE RESTRICTION",
    text: "You must be at least 18 years of age to access this website or purchase products. By using this website, you represent and warrant that you are at least 18 years old."
  },
  international: {
    title: "INTERNATIONAL DISCLAIMER",
    text: "International customers are responsible for ensuring compliance with their country's import regulations. We do not guarantee deliverability to countries where peptides are controlled or prohibited substances."
  }
};

export function DisclaimerBar({ variant = "footer" }: { variant?: DisclaimerVariant }) {
  // Determine which disclaimers to show based on variant
  const sections = (() => {
    switch (variant) {
      case "product":
        return [DISCLAIMER_SECTIONS.researchUseOnly];
      case "checkout":
        return [
          DISCLAIMER_SECTIONS.researchUseOnly,
          DISCLAIMER_SECTIONS.liability,
          DISCLAIMER_SECTIONS.noMedicalAdvice
        ];
      case "footer":
      default:
        // Footer shows ALL disclaimers
        return Object.values(DISCLAIMER_SECTIONS);
    }
  })();

  return (
    <div className="mt-auto border-t border-charcoal-700/50 bg-charcoal-800/50 px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-4 text-xs leading-relaxed text-charcoal-300">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="font-bold text-clinical-white">{section.title}</h4>
            <p className="mt-1">{section.text}</p>
          </div>
        ))}

        {variant === "footer" && (
          <div className="border-t border-charcoal-700/50 pt-4 text-center text-charcoal-400">
            © {new Date().getFullYear()} MAHA Peptides. All rights reserved. Research materials only.
          </div>
        )}
      </div>
    </div>
  );
}
