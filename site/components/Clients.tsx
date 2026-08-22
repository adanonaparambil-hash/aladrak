import { clients, clientele } from "@/lib/content";
import Reveal from "./Reveal";
import { years } from "@/lib/anniversary";

function Row({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-7 border-t border-ink/10">
      <div
        className={`flex gap-16 w-max ${
          reverse ? "animate-marquee-rev" : "animate-marquee"
        }`}
      >
        {doubled.map((c, i) => (
          <span
            key={i}
            className="font-display text-2xl md:text-3xl text-taupe/70 whitespace-nowrap hover:text-brand transition-colors duration-300"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Clients() {
  const half = Math.ceil(clients.length / 2);
  const total = clientele.reduce((n, g) => n + g.names.length, 0);
  return (
    <section className="bg-parchment text-ink relative z-20 overflow-hidden">
      <div className="py-20 md:py-28">
        <p className="label text-brand text-center mb-14">
          Trusted by the nation&apos;s finest
        </p>
        <Row items={clients.slice(0, half)} />
        <Row items={clients.slice(half)} reverse />
        <div className="border-t border-ink/10" />

        {/* ===== Full clientele, categorized ===== */}
        <div className="shell mt-20 md:mt-28">
          <Reveal className="grid md:grid-cols-12 md:items-end gap-6 mb-14">
            <h3 className="md:col-span-7 font-display h-section">
              {total}+ clients.
              <br />
              One relationship standard.
            </h3>
            <p className="md:col-span-4 md:col-start-9 text-taupe font-light leading-relaxed">
              Government and the public sector account for the dominant share
              of our turnover — a trust earned over {years()} years of delivery.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
            {clientele.map((g, gi) => (
              <Reveal key={g.group} delay={gi * 0.08}>
                <div>
                  <div className="flex items-baseline justify-between border-b border-ink/15 pb-4 mb-6">
                    <h4 className="font-display text-xl md:text-2xl">
                      {g.group}
                    </h4>
                    <span className="label text-gold">
                      {String(g.names.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-2.5 gap-y-2.5">
                    {g.names.map((n) => (
                      <span
                        key={n}
                        className="px-5 py-2.5 bg-white/60 border border-ink/15 rounded-full text-[clamp(0.875rem,0.95vw,1.1875rem)] text-ink/85 hover:border-gold hover:text-brand transition-colors duration-300"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
