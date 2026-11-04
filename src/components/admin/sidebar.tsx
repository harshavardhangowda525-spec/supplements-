"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FolderTree, Inbox, MessageSquareQuote, Receipt, Settings, ExternalLink } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/orders", label: "Online orders", icon: Receipt },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Store settings", icon: Settings },
];

export function AdminSidebar({ footer }: { footer?: React.ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <aside className="border-b border-white/10 bg-charcoal/70 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 p-4 lg:p-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <LogoMark className="size-8" />
          <span className="display text-2xl">FITZONE <span className="text-lime">ADMIN</span></span>
        </Link>
      </div>
      <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-4">
        <ul className="flex gap-1 lg:flex-col">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
                  active(href) ? "bg-lime text-obsidian" : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="size-4" /> {label}
              </Link>
            </li>
          ))}
          <li className="lg:mt-4">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap text-mist hover:text-lime">
              <ExternalLink className="size-4" /> View website
            </Link>
          </li>
        </ul>
      </nav>
      {footer && <div className="hidden p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">{footer}</div>}
    </aside>
  );
}
