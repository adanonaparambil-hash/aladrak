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
 * lib/knowledge.ts). Every answer is a real sentence from the site with a link
 * to where it lives, and the assistant cannot invent a project, a certificate
 * or a phone number.
 *
 * The honest failure mode matters as much as the answers: an unmatched query
 * returns "I could not find that" and the phone number, rather than the
 * least-bad guess.
 */
type Turn =
  | { who: "you"; text: string }
  | { who: "bot"; text: string; hits: Hit[] };

/**
 * A beat before the answer appears.
 *
 * The search itself is synchronous and instant — the index is 103 entries in
 * memory. Rendering the reply in the same frame as the question made the panel
 * feel like a form validating rather than something answering, and gave the
 * eye nothing to follow from one bubble to the next. This is the shortest
 * pause that reads as a reply rather than a redraw.
 */
const THINKING_MS = 420;

export default function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const panelId = useId();
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(0);

  /**
   * Scroll to the newest message.
   *
   * Instant, not animated. Smooth scrolling is driven by requestAnimationFrame,
   * so wherever rAF is throttled — a backgrounded tab most commonly — the
   * animation never runs and the reply lands on screen but out of view, with
   * nothing to say so. Measured in a stalled context: a smooth request moved
   * the list 0px in a full second, and a smooth request followed by a timed
   * fallback still only reached 775px of 1563. A jump always arrives, and over
   * a 400px window there is very little animation to miss.
   *
   * The inline override matters: .chat-scroll sets scroll-behavior: smooth in
   * CSS, and that governs a plain scrollTop assignment too, not just
   * scrollTo({behavior}) — so without turning it off the "instant" path is the
   * animated one again.
   */
  const toBottom = () => {
    const el = log.current;
    if (!el) return;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollTop = el.scrollHeight;
    el.style.scrollBehavior = prev;
  };

  /* follow the conversation, but only while the reader is already at the
     bottom — yanking them down mid-scroll is worse than not following */
  useEffect(() => {
    if (atBottom) toBottom();
  }, [turns, thinking, atBottom]);

  useEffect(() => {
    if (open) { input.current?.focus(); toBottom(); }
  }, [open]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); opener.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onScroll = () => {
    const el = log.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
  };

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || thinking) return;
    const hits = search(text, 3);
    setTurns((t) => [...t, { who: "you", text }]);
    setQ("");
    setAtBottom(true);
    setThinking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setThinking(false);
      setTurns((t) => [
        ...t,
        {
          who: "bot",
          hits,
          text: hits.length
            ? hits[0].entry.body
            : `I could not find that on this site. For anything I do not cover, call ${site.phone} or email ${site.email} — or use the enquiry form below.`,
        },
      ]);
      input.current?.focus();
    }, THINKING_MS);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setTurns([]);
    setThinking(false);
    setQ("");
    input.current?.focus();
  };

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close the Al Adrak assistant" : "Ask a question about Al Adrak"}
        className="group fixed bottom-24 right-6 z-[95] flex items-center gap-2.5 rounded-full bg-gold text-ink pl-4 pr-5 py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] hover:bg-cream transition-all duration-300 hover:-translate-y-0.5"
      >
        <span className="relative grid place-items-center w-5 h-5">
          {/* a slow ring, so the launcher reads as live rather than as furniture */}
          {!open && (
            <span aria-hidden className="absolute -inset-2 rounded-full border border-ink/25 animate-ping [animation-duration:2.8s]" />
          )}
          {open ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <path d="M3 4.5h14v9H8.5L4.5 17v-3.5H3v-9Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="7.5" cy="9" r="1" fill="currentColor" className="chat-dot" />
              <circle cx="10" cy="9" r="1" fill="currentColor" className="chat-dot [animation-delay:0.18s]" />
              <circle cx="12.5" cy="9" r="1" fill="currentColor" className="chat-dot [animation-delay:0.36s]" />
            </svg>
          )}
        </span>
        <span className="label label-xs font-bold">{open ? "Close" : "Ask Adrak"}</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Ask Adrak — search this site"
          className="chat-in fixed bottom-44 right-6 z-[95] w-[min(25rem,calc(100vw-3rem))] max-h-[min(34rem,calc(100vh-14rem))] flex flex-col rounded-3xl bg-forest border border-white/15 shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden isolate"
        >
          <div className="px-5 py-4 border-b border-white/12 flex items-start justify-between gap-3 flex-none">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-gold/15 border border-gold/40 flex-none">
                <span className="w-2 h-2 rounded-full bg-gold chat-dot" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg text-cream leading-none">Ask Adrak</p>
                {/* Say what it is. A visitor who thinks this is ChatGPT will ask
                    it to write them a poem and conclude the site is broken. */}
                <p className="label label-xs text-cream/45 mt-1.5 leading-relaxed">Searches this website</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-none">
              {turns.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Start again"
                  title="Start again"
                  className="w-8 h-8 rounded-full border border-white/20 text-cream/60 hover:border-gold hover:text-gold transition-colors grid place-items-center"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden>
                    <path d="M12 7a5 5 0 1 1-1.6-3.7M12 1.5V5H8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); opener.current?.focus(); }}
                aria-label="Close"
                className="w-8 h-8 rounded-full border border-white/20 text-cream/70 hover:border-gold hover:text-gold transition-colors grid place-items-center"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden>
                  <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={log}
            onScroll={onScroll}
            className="chat-scroll flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4"
          >
              {turns.length === 0 && (
                <div className="chat-in">
                  <p className="text-cream/70 font-light text-[15px] leading-relaxed">
                    Ask about our projects, capabilities, certifications, safety record or
                    how to reach us.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => ask(s)}
                        style={{ animationDelay: `${i * 45}ms` }}
                        className="chat-in text-left text-[13px] font-light px-3.5 py-2 rounded-full border border-white/18 text-cream/75 hover:border-gold hover:text-gold hover:-translate-y-0.5 transition-all duration-300"
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
                    className="chat-in ml-auto max-w-[85%] w-fit rounded-2xl rounded-br-sm bg-gold/90 text-ink px-4 py-2.5 text-[14px] font-medium"
                  >
                    {t.text}
                  </p>
                ) : (
                  <div key={i} className="chat-in flex gap-2.5 max-w-[95%]">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-gold/15 border border-gold/35 flex-none mt-0.5" aria-hidden>
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </span>
                    <div className="min-w-0">
                      <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/12 px-4 py-3">
                        <p className="text-cream/85 font-light text-[14px] leading-relaxed">{t.text}</p>
                        {t.hits[0] && (
                          <a
                            href={t.hits[0].entry.href}
                            onClick={() => setOpen(false)}
                            className="group/link label label-xs text-gold hover:text-cream transition-colors inline-flex items-center gap-1.5 mt-3"
                          >
                            {t.hits[0].entry.title}
                            <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">→</span>
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
                  </div>
                )
              )}

              {thinking && (
                <div className="chat-in flex gap-2.5" aria-live="polite" aria-label="Searching">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-gold/15 border border-gold/35 flex-none mt-0.5" aria-hidden>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </span>
                  <div className="rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/12 px-4 py-3.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/70 chat-dot" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/70 chat-dot [animation-delay:0.18s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/70 chat-dot [animation-delay:0.36s]" />
                  </div>
                </div>
              )}
          </div>

          {/* Scrolled up mid-conversation, the newest answer is off-screen and
              nothing says so. Appears only then, floating over the list —
              positioned against the panel, clear of the input row below. */}
          {!atBottom && (
            <button
              type="button"
              onClick={() => { setAtBottom(true); toBottom(); }}
              aria-label="Jump to the latest answer"
              className="chat-in absolute bottom-[4.6rem] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-ink/90 border border-gold/40 text-gold px-3.5 py-1.5 backdrop-blur-sm hover:bg-ink transition-colors"
            >
              <span className="label label-xs">Latest</span>
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                <path d="M6 1v9M2.5 6.5 6 10l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); ask(q); }}
            className="p-3 border-t border-white/12 flex gap-2 flex-none"
          >
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask a question about Al Adrak"
              className="flex-1 min-w-0 rounded-full bg-ink/50 border border-white/15 text-cream placeholder-cream/35 px-4 py-2.5 text-[14px] font-light outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              disabled={!q.trim() || thinking}
              aria-label="Send"
              className="group/send flex-none w-11 h-11 rounded-full bg-gold text-ink grid place-items-center hover:bg-cream transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="transition-transform duration-300 group-enabled/send:group-hover/send:translate-x-0.5">
                <path d="M1 8h12M8 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
