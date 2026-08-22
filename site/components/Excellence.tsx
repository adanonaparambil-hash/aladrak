import { excellence, certifications } from "@/lib/content";
import Reveal from "./Reveal";

export default function Excellence() {
  return (
    <section className="bg-cream text-ink relative z-20">
      <div className="shell py-24 md:py-32">
        <Reveal className="text-center mb-10">
          <p className="label text-brand mb-4">Excellence at Adrak</p>
          <h2 className="font-display h-section">
            Built different, by design
          </h2>
        </Reveal>
        <Reveal className="flex flex-wrap justify-center gap-3 mb-16 md:mb-24">
          {certifications.map((c) => (
            <span
              key={c}
              className="px-6 py-2.5 bg-forest text-cream rounded-full label"
            >
              {c}
            </span>
          ))}
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
          {excellence.map((e, i) => (
            <Reveal key={e.title} delay={(i % 3) * 0.08} y={30}>
              <div className="group">
                <div className="font-display text-6xl text-transparent [-webkit-text-stroke:1px_var(--color-brand)] opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-[22px] leading-snug mt-5">
                  {e.title}
                </h3>
                <p className="text-taupe font-light leading-relaxed mt-3.5 max-w-sm">
                  {e.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
