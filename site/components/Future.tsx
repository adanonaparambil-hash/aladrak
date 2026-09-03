import { future, offices, sustainability } from "@/lib/content";
import Reveal from "./Reveal";
import GroupCompanies from "./GroupCompanies";
import ContactForms from "./ContactForms";
import { asset } from "@/lib/asset";

export default function Future() {
  return (
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

        {/* Work with us — the two forms. Placed with the office details rather
            than in a page of their own: someone who has scrolled this far is
            already looking for a way to make contact. */}
        <div className="mt-20 md:mt-24 pt-14 border-t border-white/10">
          <Reveal>
            <p className="label text-gold mb-5">Work with us</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-10">
              Start a conversation
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <ContactForms />
          </Reveal>
        </div>

        {/* Offices — each detail with its own icon, as on the Contact page */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-20 md:mt-24 pt-14 border-t border-white/10">
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
  );
}
