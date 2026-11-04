import { cn } from "@/lib/utils";

export type FzVariant = "primary" | "outline" | "ghost" | "whatsapp" | "dark";
export type FzSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-heading font-semibold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow,border-color,transform] duration-200 select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime active:scale-[0.98] [&_svg]:shrink-0";

const variants: Record<FzVariant, string> = {
  primary:
    "bg-lime text-obsidian hover:bg-lime-soft hover:shadow-[0_0_0_1px_rgb(198_255_0/0.6),0_12px_40px_-8px_rgb(198_255_0/0.65)]",
  outline:
    "border border-white/20 bg-white/[0.03] text-white backdrop-blur hover:border-lime/70 hover:text-lime hover:shadow-[0_0_30px_-10px_rgb(198_255_0/0.7)]",
  ghost: "text-white/80 hover:bg-white/5 hover:text-lime",
  whatsapp:
    "bg-[#25D366] text-[#062b15] hover:bg-[#3be37a] hover:shadow-[0_12px_40px_-10px_rgb(37_211_102/0.7)]",
  dark: "bg-obsidian text-white border border-white/10 hover:border-lime/60 hover:text-lime",
};

const sizes: Record<FzSize, string> = {
  sm: "h-9 px-4 text-[11px] [&_svg]:size-3.5",
  md: "h-11 px-6 text-xs [&_svg]:size-4",
  lg: "h-14 px-8 text-sm [&_svg]:size-5",
};

export function fzButton(variant: FzVariant = "primary", size: FzSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}
