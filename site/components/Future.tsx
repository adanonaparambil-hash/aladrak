import { future, offices, site, sustainability } from "@/lib/content";
import Reveal from "./Reveal";
import GroupCompanies from "./GroupCompanies";
import ContactForms from "./ContactForms";
import { asset } from "@/lib/asset";

export default function Future() {
  return (
    <>
    <section id="contact" className="relative z-20 bg-ink text-cream overflow-hidden">
      {/* dusk aerial backdrop */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/images/projects/al-maskaan.jpg")}
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/75 to-ink" />
      </div>

      <div className="relative shell py-28 md:py-40">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-7">
            <p className="label text-gold mb-6">Commitment to the Future</p>
            <h2 className="font-display h-section">
              The next chapter is regional.
            </h2>
            <p className="font-light text-cream/80 text-lg leading-relaxed mt-8">
              {future}
            </p>
          </Reveal>
          <Reveal delay={0.15} tilt className="lg:col-span-5">
            <figure className="rounded-2xl overflow-hidden border border-white/15 bg-white/5 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/images/projects/dubai-ellington.jpg")}
                alt="Ellington House, Dubai — architectural render"
                className="w-full h-auto"
              />
              <figcaption className="label text-cream/70 px-6 py-4">
                Ellington House, Dubai — under development
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* Sustainability */}
        <Reveal delay={0.1} className="mt-14">
          <p className="label text-cream/70 mb-6">Reducing · Reusing · Recycling</p>
          <div className="flex flex-wrap gap-3">
            {sustainability.map((s) => (
              <span
                key={s}
                className="px-6 py-2.5 bg-white/5 backdrop-blur-sm border border-white/15 rounded-full label text-cream/80 hover:border-gold hover:text-gold transition-colors duration-300"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Group companies — logo wall */}
        <Reveal delay={0.15} className="mt-16">
          <p className="label text-cream/50 mb-8">The Adrak Group</p>
          <GroupCompanies />
        </Reveal>

        </div>
      </section>

      {/* ===== Work with us — its own LIGHT section =====
          It was a block inside the near-black contact section, which made the
          single place on the page where a visitor is asked to type the
          darkest thing on it. Cream, with the site's light-section palette
          (brand green for the kicker, forest for the heading, white panels),
          so the form reads as a form. The dark offices block below keeps the
          section rhythm the rest of the page uses.

          #work-with-us moves onto the <section> itself — it is the nav's
          Contact target — and keeps its scroll-margin so the fixed header
          does not sit over the heading on arrival. */}
      <section
        id="work-with-us"
        className="relative z-20 bg-cream text-ink scroll-mt-28 md:scroll-mt-32"
      >
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-brand mb-5">Work with us</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-forest mb-10">
              Start a conversation
            </h2>
          </Reveal>
          {/* The five columns beside the form carry what someone weighing up
              whether to write actually wants to know: what happens after they
              press submit, and how to just call instead.

              Passed IN to ContactForms rather than placed beside it. The tabs
              and the per-tab blurb live inside that component, above the form,
              so a parent holding the aside as a sibling had to guess their
              combined height to line the two panels up — it guessed 4.5rem
              against an actual ~9rem, and the aside sat visibly high. As a slot
              both panels are children of one grid row and agree by
              construction. */}
          <Reveal delay={0.08}>
            <ContactForms
              aside={
                <div className="rounded-3xl border border-ink/10 bg-white shadow-[0_2px_18px_rgba(10,15,12,0.05)] p-7 md:p-8">
                  <p className="label text-brand mb-6">What happens next</p>
                  <ol className="space-y-6">
                    {[
                      ["01", "We acknowledge it", "Every enquiry and registration reaches a named person — not a shared tray — within one working day."],
                      ["02", "The right desk reviews it", "Estimation for tenders and project enquiries; procurement for supplier registrations, against our pre-qualification criteria."],
                      ["03", "We come back with next steps", "A scope conversation, a site visit, a request for documents, or an honest no — but an answer either way."],
                    ].map(([no, title, body]) => (
                      <li key={no} className="flex gap-4">
                        <span className="label label-xs text-brand flex-none pt-1">{no}</span>
                        <div>
                          <p className="font-display text-lg text-forest leading-snug">{title}</p>
                          <p className="text-ink/70 font-light text-[14px] leading-relaxed mt-1.5">{body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-8 pt-7 border-t border-ink/10">
                    <p className="label label-xs text-ink/50 mb-4">Rather just talk?</p>
                    <a
                      href={`tel:${site.phone.replace(/[^0-9+]/g, "")}`}
                      className="font-display text-2xl md:text-[28px] text-forest hover:text-brand transition-colors duration-300 block leading-none"
                    >
                      {site.phone}
                    </a>
                    <a
                      href={`mailto:${site.email}`}
                      className="text-ink/75 font-light hover:text-brand transition-colors duration-300 inline-block mt-3"
                    >
                      {site.email}
                    </a>
                    <p className="label label-xs text-ink/45 mt-5 leading-relaxed">
                      Head office · Halban, Barka · Sun–Thu
                    </p>
                  </div>
                </div>
              }
            />
          </Reveal>
        </div>
      </section>

      {/* ===== Offices — back to dark, closing the page as it opened ===== */}
      <section className="relative z-20 bg-ink text-cream">
        <div className="shell py-20 md:py-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {offices.map((o, i) => {
            const line =
              "flex items-start gap-3 text-cream/80 font-light leading-relaxed text-[clamp(0.9375rem,0.85vw,1.25rem)]";
            const icon = "flex-none mt-[0.35em] text-gold";
            /**
             * Enlarges a contact link's hit area without moving anything.
             *
             * These sat on a 19px line box — the phone number, which on a
             * handset is the single most important thing to be able to hit, was
             * the hardest. Padding grows the box and the matching negative
             * margin takes the growth back out of the layout, so the rows keep
             * their spacing and the target roughly doubles. inline-block is what
             * makes both apply.
             */
            const tap = "inline-block py-2 -my-2";
            return (
              <Reveal key={o.name} delay={i * 0.08} y={26}>
                <div className="space-y-4">
                  <p className="label text-gold">{o.name}</p>

                  <p className={line}>
                    <svg className={icon} width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                      <path
                        d="M7.5 1.5c-2.2 0-4 1.8-4 4 0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <circle cx="7.5" cy="5.5" r="1.4" fill="currentColor" />
                    </svg>
                    <span>
                      {o.address.map((a) => (
                        <span key={a} className="block">
                          {a}
                        </span>
                      ))}
                    </span>
                  </p>

                  {o.phone && (
                    <p className={line}>
                      <svg className={icon} width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                        <path
                          d="M3 2.5h2.2l1.1 2.7-1.5 1.1a7.4 7.4 0 0 0 3.9 3.9l1.1-1.5 2.7 1.1V12a1 1 0 0 1-1 1A10.5 10.5 0 0 1 2 3.5a1 1 0 0 1 1-1Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          fill="none"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>
                        <a
                          href={`tel:${o.phone.replace(/[^0-9+]/g, "")}`}
                          className={`hover:text-gold transition-colors duration-300 ${tap}`}
                        >
                          {o.phone}
                        </a>
                        {o.fax && (
                          <span className="block text-cream/60">Fax: {o.fax}</span>
                        )}
                      </span>
                    </p>
                  )}

                  <p className={line}>
                    <svg className={icon} width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                      <rect
                        x="1.8"
                        y="3.3"
                        width="11.4"
                        height="8.4"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <path d="M2.2 4 7.5 8.2 12.8 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    </svg>
                    <a
                      href={`mailto:${o.email}`}
                      className={`hover:text-gold transition-colors duration-300 break-all ${tap}`}
                    >
                      {o.email}
                    </a>
                  </p>

                  {/* a maps SEARCH for the address — not a fabricated pin */}
                  <p className={line}>
                    <svg className={icon} width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                      <path
                        d="M13.2 1.8 1.8 6.3l4.3 1.6 1.6 4.3 5.5-10.4Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `Al Adrak ${o.address.join(" ")}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:text-gold transition-colors duration-300 ${tap}`}
                    >
                      Location
                    </a>
                  </p>
                </div>
              </Reveal>
            );
          })}
          </div>
        </div>
      </section>
    </>
  );
}
