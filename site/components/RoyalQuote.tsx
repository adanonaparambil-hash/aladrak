import Reveal from "./Reveal";

/** Dedication band — as the brochure opens. */
export default function RoyalQuote() {
  return (
    <section className="relative z-20 bg-cream text-ink border-t border-ink/10">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28 text-center">
        <Reveal>
          <span className="font-display text-6xl text-gold leading-none">”</span>
          <blockquote className="font-serifit italic text-2xl md:text-[32px] leading-snug text-ink/85 -mt-4">
            The elevation of Oman to the level of your aspirations and
            expectations in all fields will be the theme of the next stage…
            We will keep our eyes fixed on the supreme interest of our country.
          </blockquote>
          <p className="label text-brand mt-10">
            His Majesty Sultan Haitham bin Tarik
          </p>
        </Reveal>
      </div>
    </section>
  );
}
