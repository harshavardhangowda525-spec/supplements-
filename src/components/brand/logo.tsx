import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-9", className)}>
      <rect width="40" height="40" rx="10" fill="#C6FF00" />
      <path d="M11 9h18l-2.4 5.2H17.4l-.9 3.6h8.3l-2.3 5H15.3L13 31H7.6L11 9Z" fill="#080A09" />
      <path d="M24.5 25.5h8.4L31 31h-8.4l1.9-5.5Z" fill="#080A09" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span className="display text-2xl tracking-wide text-white">FITZONE</span>
        <span className="font-heading text-[9px] font-semibold tracking-[0.42em] text-lime">SUPPLEMENTS</span>
      </span>
    </Link>
  );
}
