import { BadgeCheck, HandCoins, HeartHandshake, MessagesSquare, Boxes } from "lucide-react";
import { SectionHeading } from "@/components/brand/section-heading";
import { Stagger, StaggerItem } from "@/components/brand/reveal";

/**
 * Themes drawn from the store's customer feedback — phrased as what customers
 * value, not as guarantees.
 */
const FEATURES = [
  { icon: BadgeCheck, title: "Genuine products", body: "Customers repeatedly mention genuine products in their reviews. Ask us about sourcing for any product." },
  { icon: HandCoins, title: "Competitive pricing", body: "Shoppers highlight good prices. Message us for today’s price on the item you want." },
  { icon: HeartHandshake, title: "Friendly service", body: "A welcoming, no-pressure store experience — something reviewers call out often." },
  { icon: MessagesSquare, title: "Helpful guidance", body: "Not sure what fits your routine? Talk to the team in store or on WhatsApp." },
  { icon: Boxes, title: "Wide selection", body: "Proteins, gainers, creatine, pre-workouts, aminos, vitamins and accessories under one roof." },
];

export function WhyChoose() {
  return (
    <section className="container-fz py-24">
      <SectionHeading
        eyebrow="Why Fitzone"
        title={
          <>
            Your fitness. <span className="text-lime">Our commitment.</span>
          </>
        }
        description="What our customers tell us they value most about shopping at Fitzone."
      />
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map(({ icon: Icon, title, body }, i) => (
          <StaggerItem key={title}>
            <div className="group metal-border relative h-full overflow-hidden rounded-2xl p-6 transition-shadow duration-300 hover:shadow-[0_20px_50px_-20px_rgb(198_255_0/0.4)]">
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-lime/0 blur-2xl transition-colors duration-500 group-hover:bg-lime/20" />
              <span className="font-heading text-xs text-white/30">0{i + 1}</span>
              <span className="mt-4 grid size-12 place-items-center rounded-xl bg-lime/10 text-lime transition-all duration-300 group-hover:scale-110 group-hover:bg-lime group-hover:text-obsidian">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
