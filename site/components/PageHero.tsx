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
/**
 * How hard the image is held back. "light" is for pages whose photograph is the
 * point and is bright enough to survive being seen. "faint" is the floor, and
 * it is not free to use anywhere: it holds a 4.5:1 AA ratio for the lead
 * paragraph only over a background whose text-zone luma is ~150 or brighter —
 * measured, not guessed, when the HSE warm-up hero was cut (mean 151 across
 * the heading zone; 34% ink over that leaves cream at ~4.9:1 before the
 * text-shadow adds its local contrast). A darker photograph needs "light" or
 * stronger, or the paragraph sinks below AA.
 */
const SCRIM = {
  default: "bg-gradient-to-r from-ink/68 via-ink/38 to-ink/[0.03]",
  light: "bg-gradient-to-r from-ink/48 via-ink/24 to-transparent",
  faint: "bg-gradient-to-r from-ink/34 via-ink/16 to-transparent",
} as const;

const VEIL = {
  default: "bg-gradient-to-b from-ink/40 via-transparent to-ink",
  light: "bg-gradient-to-b from-ink/28 via-transparent to-ink",
  faint: "bg-gradient-to-b from-ink/16 via-transparent to-ink",
} as const;

export default function PageHero({
  img,
  alt,
  kicker,
  title,
  scrim = "default",
  children,
}: {
  img: string;
  alt: string;
  kicker: string;
  title: React.ReactNode;
  scrim?: keyof typeof SCRIM;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={alt} className="w-full h-full object-cover" />
        {/*
          Much lighter than the first attempt, which was opaque at the left edge
          and lost the PPE wall entirely. Contrast for the type is bought by the
          text-shadow below instead: a shadow darkens only the pixels around each
          glyph, where it is needed, rather than the whole left third of a
          photograph that is there to be looked at.
        */}
        <div className={`absolute inset-0 ${SCRIM[scrim]}`} />
        <div className={`absolute inset-0 ${VEIL[scrim]}`} />
      </div>
      {/* Three shadow layers, not one: a tight dark halo for glyph edges, a
          mid one for body, and a wide soft pool that lifts the whole block off
          a busy background. This is what pays for the lighter scrim above. */}
      <div className="relative shell [text-shadow:0_1px_2px_rgba(10,15,12,0.98),0_2px_8px_rgba(10,15,12,0.92),0_4px_26px_rgba(10,15,12,0.85)]">
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
