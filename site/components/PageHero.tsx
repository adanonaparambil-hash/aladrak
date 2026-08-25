import Reveal from "./Reveal";

/**
 * The banner at the top of a standalone page.
 *
 * All three of these pages had the same fault: the photograph was dropped to
 * 20–25% opacity and then covered with a full-width scrim, which is two ways of
 * hiding the same picture. A hero photograph is not texture — it is the first
 * thing the page says.
 *
 * So the image runs at full strength and legibility is bought by DIRECTION
 * instead. The horizontal pass is opaque at the left edge, where every heading
 * on this site sits, and clears to almost nothing on the right, where the
 * subject of the photograph usually is. The vertical pass only seats the image
 * against the fixed header above and the section below; it stays transparent
 * through the middle so it never dims the picture twice.
 *
 * One component rather than three copies, so the balance is tuned in one place.
 */
export default function PageHero({
  img,
  alt,
  kicker,
  title,
  children,
}: {
  img: string;
  alt: string;
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-transparent to-ink" />
      </div>
      <div className="relative shell">
        <Reveal>
          <p className="label text-gold mb-6">{kicker}</p>
          <h1 className="font-display text-cream text-5xl md:text-7xl leading-[1.02] max-w-3xl">
            {title}
          </h1>
          {children}
        </Reveal>
      </div>
    </section>
  );
}
