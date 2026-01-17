import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10">
            <Settings className="h-8 w-8 text-accent-400" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-clinical-white">Platform Settings</h2>
        <p className="text-charcoal-400">
          System configuration and integrations management coming soon
        </p>
      </div>
    </div>
  );
}
