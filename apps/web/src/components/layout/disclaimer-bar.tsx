type DisclaimerVariant = "footer" | "product" | "checkout";

const DISCLAIMER_COPY: Record<DisclaimerVariant, string> = {
  footer: `All statements on this website have not been evaluated by the Food and Drug Administration (FDA).
All products are sold strictly for research, laboratory, or analytical purposes only.
Products are not intended to diagnose, treat, cure, or prevent any disease.

This site operates solely as a chemical and research materials supplier.
We are not a compounding pharmacy or chemical compounding facility as defined under Section 503A of the Federal Food, Drug, and Cosmetic Act.
We are not an outsourcing facility as defined under Section 503B of the Federal Food, Drug, and Cosmetic Act.

Nothing on this website constitutes medical, clinical, or healthcare advice.
All information provided is for educational and research discussion purposes only.`,
  product: `All products sold on this platform are intended solely for lawful laboratory research and analytical use.
Not for human or veterinary consumption.`,
  checkout: `All products sold on this platform are intended solely for lawful laboratory research and analytical use.
Not for human or veterinary consumption.

The purchaser assumes full responsibility for the proper handling, storage, use, and disposal of all products.
The purchaser is responsible for ensuring compliance with all applicable local, state, federal, and international laws.

Nothing on this website constitutes medical, clinical, or healthcare advice.
All information provided is for educational and research discussion purposes only.`,
};

export function DisclaimerBar({ variant = "footer" }: { variant?: DisclaimerVariant }) {
  return (
    <div className="mt-auto border-t border-slate-200 bg-slate-100 px-6 py-3 text-xs text-slate-700">
      <p className="whitespace-pre-line">{DISCLAIMER_COPY[variant]}</p>
    </div>
  );
}
