"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SUGGESTIONS, search, type Hit } from "@/lib/knowledge";
import { site } from "@/lib/content";

/**
 * "Ask Adrak" — a small assistant that answers from the site's own content.
 *
 * It is a retrieval assistant, not a language model, and the interface says so
 * rather than implying otherwise. The site is a static export with nowhere to
 * send a question, so there is no generative model behind this; what there is
 * instead is an index built from the same exports the pages render (see
 * lib/knowledge.ts). Every answer is therefore a real sentence from the site
 * with a link to where it lives, and the assistant physically cannot invent a
 * project, a certificate or a phone number.
 *
 * The honest failure mode matters as much as the answers: an unmatched query
 * returns "I could not find that" and the phone number, rather than the
 * least-bad guess.
 */
type Turn =
  | { who: "you"; text: string }
  | { who: "bot"; text: string; hits: Hit[] };

export default function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const panelId = useId();
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  /* keep the newest turn in view */
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [turns, open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  /* Escape closes, and focus goes back to the button that opened it —
     otherwise a keyboard user is dropped at the top of the document. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        opener.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text) return;
    const hits = search(text, 3);
    setTurns((t) => [
      ...t,
      { who: "you", text },
      {
        who: "bot",
        hits,
        text: hits.length
          ? hits[0].entry.body
          : `I could not find that on this site. For anything I do not cover, call ${site.phone} or email ${site.email} — or use the enquiry form below.`,
      },
    ]);
    setQ("");
  };

  return (
    <>
      {/* Sits above the scroll dial at bottom-6, not beside it: the dial is
          56px tall, so 6rem clears it with room to breathe. */}
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close the Al Adrak assistant" : "Ask a question about Al Adrak"}
        className="fixed bottom-24 right-6 z-[95] flex items-center gap-2.5 rounded-full bg-gold text-ink pl-4 pr-5 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] hover:bg-cream transition-colors duration-300"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
          <path
            d="M3 4.5h14v9H8.5L4.5 17v-3.5H3v-9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="9" r="1" fill="currentColor" />
          <circle cx="10" cy="9" r="1" fill="currentColor" />
          <circle cx="12.5" cy="9" r="1" fill="currentColor" />
        </svg>
        <span className="label label-xs font-bold">{open ? "Close" : "Ask Adrak"}</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Ask Adrak — search this site"
          className="fixed bottom-44 right-6 z-[95] w-[min(25rem,calc(100vw-3rem))] max-h-[min(34rem,calc(100vh-14rem))] flex flex-col rounded-3xl bg-forest border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/12 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg text-cream leading-none">Ask Adrak</p>
              {/* Say what it is. A visitor who thinks this is ChatGPT will ask
                  it to write them a poem and conclude the site is broken. */}
              <p className="label label-xs text-cream/45 mt-1.5 leading-relaxed">
                Searches this website
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); opener.current?.focus(); }}
              aria-label="Close"
              className="flex-none w-8 h-8 rounded-full border border-white/20 text-cream/70 hover:border-gold hover:text-gold transition-colors grid place-items-center"
            >
              <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden>
                <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={log} className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
            {turns.length === 0 && (
              <div>
                <p className="text-cream/70 font-light text-[15px] leading-relaxed">
                  Ask about our projects, capabilities, certifications, safety record or
                  how to reach us.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="text-left text-[13px] font-light px-3.5 py-2 rounded-full border border-white/18 text-cream/75 hover:border-gold hover:text-gold transition-colors duration-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((t, i) =>
              t.who === "you" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] w-fit rounded-2xl rounded-br-sm bg-gold/90 text-ink px-4 py-2.5 text-[14px] font-medium"
                >
                  {t.text}
                </p>
              ) : (
                <div key={i} className="max-w-[92%]">
                  <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/12 px-4 py-3">
                    <p className="text-cream/85 font-light text-[14px] leading-relaxed">{t.text}</p>
                    {t.hits[0] && (
                      <a
                        href={t.hits[0].entry.href}
                        onClick={() => setOpen(false)}
                        className="label label-xs text-gold hover:text-cream transition-colors inline-block mt-3"
                      >
                        {t.hits[0].entry.title} →
                      </a>
                    )}
                  </div>
                  {/* the runners-up, so a near-miss is one tap from the right
                      answer instead of a dead end */}
                  {t.hits.length > 1 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {t.hits.slice(1).map((h) => (
                        <a
                          key={h.entry.id}
                          href={h.entry.href}
                          onClick={() => setOpen(false)}
                          className="text-[12px] font-light px-3 py-1.5 rounded-full border border-white/15 text-cream/60 hover:border-gold hover:text-gold transition-colors"
                        >
                          {h.entry.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(q); }}
            className="p-3 border-t border-white/12 flex gap-2"
          >
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask a question about Al Adrak"
              className="flex-1 rounded-full bg-ink/50 border border-white/15 text-cream placeholder-cream/35 px-4 py-2.5 text-[14px] font-light outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex-none w-11 h-11 rounded-full bg-gold text-ink grid place-items-center hover:bg-cream transition-colors duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M1 8h12M8 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
