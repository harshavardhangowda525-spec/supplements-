"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { updateVariantQuick } from "@/lib/admin/actions";

export function QuickVariant({ variantId, label, stock, price }: { variantId: string; label: string; stock: number; price: number }) {
  const [s, setS] = useState(String(stock));
  const [p, setP] = useState(String(price));
  const [pending, start] = useTransition();
  const dirty = s !== String(stock) || p !== String(price);

  function save() {
    start(async () => {
      const res = await updateVariantQuick({ variantId, stock: Number(s), price: Number(p) });
      if (res.ok) toast.success(`${label} updated`);
      else toast.error(res.message ?? "Update failed");
    });
  }

  const input = "h-8 rounded-lg border border-white/15 bg-white/[0.03] px-2 text-sm tabular-nums focus:border-lime focus:outline-none";
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="w-40 truncate text-mist">{label}</span>
      <label className="flex items-center gap-1">
        ₹<input aria-label={`Price for ${label}`} type="number" min={0} value={p} onChange={(e) => setP(e.target.value)} className={`${input} w-24`} />
      </label>
      <label className="flex items-center gap-1">
        Stock
        <input aria-label={`Stock for ${label}`} type="number" min={0} value={s} onChange={(e) => setS(e.target.value)} className={`${input} w-20`} />
      </label>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || pending}
        className="grid size-8 place-items-center rounded-lg bg-lime text-obsidian disabled:bg-white/10 disabled:text-white/30"
        aria-label={`Save ${label}`}
      >
        <Check className="size-4" />
      </button>
    </div>
  );
}
