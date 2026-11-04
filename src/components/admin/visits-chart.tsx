/**
 * Single-series bar chart of daily page views. One hue (no legend — the title
 * names the series), recessive grid, 4px rounded data-ends, 2px gaps, per-bar
 * hover tooltip, and a table view for screen readers / exact values.
 */
export function VisitsChart({ data }: { data: { date: string; label: string; views: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const ticks = [niceMax, Math.round(niceMax / 2), 0];

  return (
    <figure className="metal-border rounded-2xl p-5 sm:p-6">
      <figcaption className="mb-5 flex items-baseline justify-between gap-3">
        <span className="font-heading text-sm font-semibold text-white">Daily page views</span>
        <span className="text-xs text-mist">Last {data.length} days</span>
      </figcaption>
      <div className="relative grid grid-cols-[auto_1fr] gap-3" aria-hidden="true">
        <div className="flex h-48 flex-col justify-between text-right text-[10px] text-mist tabular-nums">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {t}
            </span>
          ))}
        </div>
        <div className="relative h-48">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-white/[0.06]" style={{ bottom: `${(t / niceMax) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d) => (
              <div key={d.date} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-[#7FA300] transition-colors group-hover:bg-lime"
                  style={{ height: `${(d.views / niceMax) * 100}%`, minHeight: d.views ? 2 : 0 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border border-white/10 bg-obsidian px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                  <span className="text-mist">{d.label}</span> · <strong>{d.views}</strong> views
                </div>
              </div>
            ))}
          </div>
        </div>
        <div />
        <div className="flex justify-between text-[10px] text-mist">
          <span>{data[0]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
      <details className="mt-4 text-xs text-mist">
        <summary className="cursor-pointer hover:text-white">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr>
              <th className="py-1 font-medium">Date</th>
              <th className="py-1 text-right font-medium">Page views</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date} className="border-t border-white/5">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums text-white">{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
