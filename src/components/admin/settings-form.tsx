"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveSettings, type ActionResult } from "@/lib/admin/actions";
import { fzButton } from "@/components/brand/button-styles";
import { Field, FormMessage, TextArea, TextInput } from "@/components/forms/fields";

type Raw = { hours_text: string | null; closing_time: string | null; announcement: string | null; maps_url: string | null; reviews_url: string | null } | null;

export function SettingsForm({ raw, defaultClosing }: { raw: Raw; defaultClosing: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSettings, { ok: false });
  const e = state.errors ?? {};
  return (
    <form action={action} className="metal-border max-w-2xl space-y-5 rounded-2xl p-6">
      <Field label="Opening hours (confirmed by the owner)" name="hoursText" hint="e.g. Mon–Sat: 10:00 AM – 9:30 PM. Leave blank to show “hours being confirmed”." error={e.hoursText}>
        <TextArea name="hoursText" defaultValue={raw?.hours_text ?? ""} />
      </Field>
      <Field label="Closing time" name="closingTime" error={e.closingTime}>
        <TextInput name="closingTime" defaultValue={raw?.closing_time ?? defaultClosing} required />
      </Field>
      <Field label="Announcement bar (optional)" name="announcement" hint="Shown at the top of every page." error={e.announcement}>
        <TextInput name="announcement" defaultValue={raw?.announcement ?? ""} maxLength={200} />
      </Field>
      <Field label="Verified Google Maps listing URL" name="mapsUrl" hint="Replaces the auto-generated map search link." error={e.mapsUrl}>
        <TextInput name="mapsUrl" type="url" defaultValue={raw?.maps_url ?? ""} />
      </Field>
      <Field label="Google reviews URL" name="reviewsUrl" hint="Used by “Read reviews on Google” buttons." error={e.reviewsUrl}>
        <TextInput name="reviewsUrl" type="url" defaultValue={raw?.reviews_url ?? ""} />
      </Field>
      {state.message && <FormMessage status={state.ok ? "success" : "error"} message={state.message} />}
      <button type="submit" disabled={pending} className={fzButton("primary", "md")}>
        <Save /> {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
