"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  const src = images[active] ?? images[0];

  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 overflow-hidden rounded-xl border-2 bg-[#efe6db] transition-colors sm:size-20",
                i === active ? "border-lime" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1">
        <button
          type="button"
          onPointerMove={onMove}
          onPointerLeave={() => setZoom(null)}
          onClick={() => setOpen(true)}
          className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-white/10 bg-[#efe6db]"
          aria-label="Open full-size image"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={src}
                alt={`${name} — illustrative product photo ${active + 1}`}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-200 ease-out"
                style={zoom ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </motion.div>
          </AnimatePresence>
          <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-obsidian/70 px-3 py-1.5 text-xs text-white backdrop-blur">
            <Expand className="size-3.5" /> <span className="hidden sm:inline">Hover to zoom ·</span> Tap to expand
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[min(92vw,900px)] border-white/10 bg-obsidian p-2 sm:max-w-[min(92vw,900px)]">
          <DialogTitle className="sr-only">{name} image</DialogTitle>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#efe6db]">
            <Image src={src} alt={`${name} — full size`} fill sizes="900px" className="object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
