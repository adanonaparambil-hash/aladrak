import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { hse, site } from "@/lib/content";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "Health, Safety & Environment — Al Adrak",
  description:
    "How Al Adrak trains and protects a 6,000-strong workforce: an in-house training centre, daily toolbox talks, working-at-height practice, and ISO 45001, 14001 and 9001 certification.",
};

export default function HsePage() {
  return (
    <main className="bg-ink min-h-screen">
      <Header />

      {/* Hero band */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/images/hse/hse-ppe-wall.jpg")}
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />
        </div>
        <div className="relative shell">
          <Reveal>
            <p className="label text-gold mb-6">{hse.kicker}</p>
            <h1 className="font-display text-cream text-5xl md:text-7xl leading-[1.02] max-w-3xl">
              {hse.title}
            </h1>
            <p className="text-cream/80 font-light text-lg md:text-xl leading-relaxed mt-8 max-w-2xl">
              {hse.lead}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Certification strip */}
      <section className="relative border-y border-cream/10 bg-forest/30">
        <div className="shell py-10 md:py-12">
          <div className="grid sm:grid-cols-3 gap-8 md:gap-12">
            {hse.certs.map((c) => (
              <Reveal key={c.code}>
                <p className="font-display text-2xl md:text-3xl text-gold">{c.code}</p>
                <p className="label label-xs text-cream/60 mt-2.5 leading-relaxed">{c.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* The training centre */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-cream/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hse.centre.img}
                  alt={hse.centre.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-6">
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream">
                {hse.centre.title}
              </h2>
              <p className="text-cream/80 font-light leading-relaxed mt-6 text-[15px] md:text-base">
                {hse.centre.body}
              </p>
              <blockquote className="font-serifit italic text-cream/75 text-lg md:text-xl leading-snug mt-8 pl-5 border-l border-gold/50">
                {hse.trainingQuote}
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works, in practice */}
      <section className="relative bg-forest/20 border-y border-cream/10">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">In practice</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-2xl">
              Six things that happen on every project
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-12 mt-16">
            {hse.pillars.map((p, i) => (
              <Reveal key={p.no} delay={i * 0.05}>
                <div className="border-t border-cream/15 pt-6">
                  <span className="label label-xs text-gold/80">{p.no}</span>
                  <h3 className="font-display text-xl md:text-2xl text-cream mt-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-cream/70 font-light leading-relaxed mt-3 text-[15px]">
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Inside the training centre */}
      <section className="relative">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <p className="label text-gold mb-5">Inside the training centre</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight text-cream max-w-2xl mb-14">
              Where it is taught before it is done
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {hse.gallery.map((g, i) => (
              <Reveal key={g.src} delay={(i % 3) * 0.06}>
                <figure className="group">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-cream/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.src}
                      alt={g.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="text-cream/60 font-light text-[14px] leading-relaxed mt-3.5">
                    {g.label}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact band */}
      <section className="relative border-t border-cream/10 bg-forest/30">
        <div className="shell py-20 md:py-24 text-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-4xl text-cream leading-tight">
              Questions about our HSE standards?
            </h2>
            <p className="text-cream/70 font-light mt-5 max-w-xl mx-auto leading-relaxed">
              Clients and consultants are welcome to review our policies, method
              statements and training records.
            </p>
            <a
              href={`mailto:${site.email}?subject=HSE enquiry`}
              className="inline-flex mt-9 px-9 py-4 bg-gold text-ink rounded-full label font-bold hover:bg-cream transition-colors duration-300"
            >
              Contact our HSE team
            </a>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
