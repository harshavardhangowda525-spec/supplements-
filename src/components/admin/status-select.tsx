"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteReview, setInquiryStatus, setOrderStatus, setReviewStatus } from "@/lib/admin/actions";

export function StatusSelect({ id, value, kind }: { id: string; value: string; kind: "inquiry" | "review" | "order" }) {
  const [current, setCurrent] = useState(value);
  const [pending, start] = useTransition();
  const options =
    kind === "inquiry" ? ["new", "contacted", "closed"] : kind === "order" ? ["paid", "ready", "collected", "cancelled"] : ["pending", "approved", "rejected"];
  return (
    <select
      aria-label="Status"
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setCurrent(next);
        start(async () => {
          const res =
            kind === "inquiry" ? await setInquiryStatus(id, next) : kind === "order" ? await setOrderStatus(id, next) : await setReviewStatus(id, next);
          if (!res.ok) {
            setCurrent(value);
            toast.error(res.message ?? "Update failed");
          } else toast.success("Status updated");
        });
      }}
      className="h-9 rounded-lg border border-white/15 bg-charcoal px-2 text-xs capitalize focus:border-lime focus:outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function DeleteReviewButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        confirm("Delete this review permanently?") &&
        start(async () => {
          const res = await deleteReview(id);
          if (res.ok) toast.success("Review deleted");
          else toast.error(res.message ?? "Could not delete");
        })
      }
      className="grid size-9 place-items-center rounded-lg text-mist hover:text-red-300"
      aria-label="Delete review"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
