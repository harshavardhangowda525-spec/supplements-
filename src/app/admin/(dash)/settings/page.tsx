import { requireAdmin } from "@/lib/admin/auth";
import { adminSettings } from "@/lib/admin/queries";
import { SettingsForm } from "@/components/admin/settings-form";
import { SITE } from "@/lib/site";

export const metadata = { title: "Store settings" };

export default async function AdminSettingsPage() {
  const { sb } = await requireAdmin();
  const { raw } = await adminSettings(sb);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-5xl">Store settings</h1>
        <p className="mt-1 text-sm text-mist">
          Business information shown across the website. Phone ({SITE.phoneDisplay}), address and the Google rating
          snapshot live in <code className="text-white">src/lib/site.ts</code>.
        </p>
      </div>
      <SettingsForm raw={raw} defaultClosing={SITE.hours.closingTime} />
    </div>
  );
}
