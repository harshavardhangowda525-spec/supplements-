import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-300 px-2 py-0.5 font-heading text-[10px] font-bold tracking-[0.12em] text-obsidian uppercase",
        className,
      )}
      title="Sample listing — not real store inventory, price or stock"
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function DemoNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-4 text-sm text-amber-100/90",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
      <p>
        <strong className="font-semibold text-amber-200">Sample catalogue.</strong> Products, brands, prices and stock
        shown are demonstration data until Fitzone publishes its actual catalogue. Message us on WhatsApp for real
        availability and pricing.
      </p>
    </div>
  );
}
