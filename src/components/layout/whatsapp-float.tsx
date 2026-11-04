"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { WhatsAppLink } from "@/components/brand/tracked-links";
import { WhatsAppIcon } from "@/components/brand/icons";
import { storeAssistanceMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function WhatsAppFloat() {
  return (
    <Suspense fallback={<FloatView lifted={false} />}>
      <FloatWithPath />
    </Suspense>
  );
}

function FloatWithPath() {
  const pathname = usePathname();
  return <FloatView lifted={pathname.startsWith("/product/")} />;
}

function FloatView({ lifted }: { lifted: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      className={cn("fixed right-4 z-30 sm:right-6", lifted ? "bottom-24 md:bottom-6" : "bottom-5 sm:bottom-6")}
    >
      <WhatsAppLink
        source="floating_button"
        message={storeAssistanceMessage()}
        className="group relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgb(37_211_102/0.6)] transition-transform hover:scale-105"
        aria-label="Chat with Fitzone Supplements on WhatsApp"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25 motion-reduce:hidden" />
        <WhatsAppIcon className="relative size-7" />
        <span className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-obsidian opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
          Ask us anything
        </span>
      </WhatsAppLink>
    </motion.div>
  );
}
