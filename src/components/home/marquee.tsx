const WORDS = ["Whey Protein", "Mass Gainers", "Creatine", "Pre-Workout", "BCAA & Aminos", "Vitamins", "Accessories"];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-lime py-4" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-10 motion-reduce:animate-none">
        {row.map((w, i) => (
          <span key={i} className="display flex items-center gap-10 text-3xl text-obsidian">
            {w}
            <svg viewBox="0 0 10 10" className="size-3 fill-obsidian">
              <path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
