import { cn } from "@/lib/utils";
import { stockLabel, stockStatus } from "@/lib/format";

export function StockPill({ stock, className }: { stock: number; className?: string }) {
  const s = stockStatus(stock);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        s === "in_stock" && "text-lime",
        s === "low_stock" && "text-amber-300",
        s === "out_of_stock" && "text-red-300",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          s === "in_stock" && "bg-lime shadow-[0_0_8px_#c6ff00]",
          s === "low_stock" && "bg-amber-300",
          s === "out_of_stock" && "bg-red-400",
        )}
        aria-hidden="true"
      />
      {stockLabel(stock)}
    </span>
  );
}
