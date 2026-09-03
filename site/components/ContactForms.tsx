"use client";

import { useId, useState } from "react";
import { enquiryTypes, site, vendorProducts } from "@/lib/content";

/**
 * The two contact forms: a client enquiry and a vendor registration.
 *
 * ── Where the submission goes ────────────────────────────────────────────────
 * This site is a static export on GitHub Pages. There is no server of ours to
 * POST to, so a plain `<form action="/api/...">` would 405 and a form that
 * silently swallows what someone typed is worse than no form at all.
 *
 * So the submit path is explicit and switchable:
 *
 *   ENDPOINT = ""    → composes a mailto: to the address below, with every
 *                      field laid out in the body. Works today, with no
 *                      account and no key, on any host. The cost is that it
 *                      hands off to the visitor's mail client, which some
 *                      webmail users do not have configured.
 *
 *   ENDPOINT = url   → POSTs JSON to that URL instead (Formspree, Web3Forms,
 *                      a Google Apps Script, or a real backend). Set the one
 *                      constant and the forms start submitting directly, with
 *                      no other change: the success and failure states below
 *                      already handle it.
 *
 * Until an endpoint exists, mailto is the honest option — the visitor can see
 * exactly what is being sent and to whom.
 */
const ENDPOINT = "";

/** mailto: bodies get truncated by some clients past roughly this length */
const MAILTO_SAFE_BODY = 1800;

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  /** spans both columns on wide screens */
  wide?: boolean;
  autoComplete?: string;
};

const CLIENT_FIELDS: Field[] = [
  { name: "name", label: "Your name", required: true, autoComplete: "name" },
  { name: "company", label: "Company or organisation", autoComplete: "organization" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel" },
  { name: "enquiry", label: "What is this about", type: "select", required: true, options: enquiryTypes },
  { name: "location", label: "Project location", wide: false },
  { name: "message", label: "Tell us about the project", type: "textarea", required: true, wide: true },
];

const VENDOR_FIELDS: Field[] = [
  { name: "coName", label: "Company name", required: true, autoComplete: "organization" },
  { name: "regNo", label: "Registration number", required: true },
  { name: "expiry", label: "Registration expiry date", type: "date", required: true },
  { name: "products", label: "What you supply", type: "select", required: true, options: vendorProducts },
  { name: "address", label: "Company address", type: "textarea", required: true, wide: true },
  { name: "contact", label: "Contact person", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel" },
  { name: "message", label: "Anything else we should know", type: "textarea", wide: true },
];

const TABS = [
  { key: "client", title: "Client enquiry", blurb: "Tell us about a project, a tender, or a partnership.", fields: CLIENT_FIELDS, subject: "Client enquiry" },
  { key: "vendor", title: "Vendor registration", blurb: "Register as a supplier or subcontractor with our procurement team.", fields: VENDOR_FIELDS, subject: "Vendor registration" },
] as const;

/**
 * Deliberately permissive. A form on a contractor's site is read by a person,
 * not a parser, and every extra rule here is a way to turn away a real
 * enquiry — international numbers arrive with spaces, brackets, dashes and
 * leading zeros, and no regex gets that right for every country. So: require
 * what is genuinely needed, insist an email looks like an email, insist a
 * phone has enough digits to be dialled, and let a human read the rest.
 */
function validate(fields: Field[], values: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = (values[f.name] ?? "").trim();
    if (f.required && !v) {
      errors[f.name] = "Please fill this in";
      continue;
    }
    if (!v) continue;
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      errors[f.name] = "That does not look like an email address";
    }
    if (f.type === "tel" && (v.replace(/\D/g, "").length < 7)) {
      errors[f.name] = "Please include the full number";
    }
  }
  return errors;
}

/**
 * `aside` renders in the five columns beside the form.
 *
 * It is a slot rather than a sibling in the parent because the tabs and the
 * per-tab blurb live in here, above the form — so a parent that placed the
 * aside next to this whole component had to guess their combined height to
 * line the two panels up, and guessed 4.5rem against an actual ~9rem. Taking
 * the aside in means both panels are children of the same grid row and their
 * top edges agree by construction.
 */
export default function ContactForms({ aside }: { aside?: React.ReactNode }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("client");
  const active = TABS.find((t) => t.key === tab)!;
  const idBase = useId();

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  /** every control's DOM id is derived, so focus can find one without a ref */
  const fieldId = (name: string) => `${idBase}-${tab}-${name}`;

  const set = (name: string, v: string) => {
    setValues((p) => ({ ...p, [name]: v }));
    // clear the error as soon as they start fixing it, not on the next submit
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const switchTab = (key: (typeof TABS)[number]["key"]) => {
    setTab(key);
    setValues({});
    setErrors({});
    setState("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(active.fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      /**
       * Move focus to the first problem — otherwise a keyboard or
       * screen-reader user is told "5 fields need attention" with no way to
       * find them.
       *
       * By id, after a tick, and NOT by ref: a ref callback runs during the
       * render that creates the element, which is before this submit has put
       * any error in state, so on the first submit every ref saw `bad` as
       * false and none was ever recorded. Measured: focus stayed on <body>
       * through two submits. Deriving the id sidesteps the ordering entirely.
       */
      const firstBadName = active.fields.find((f) => errs[f.name])?.name;
      if (firstBadName) {
        window.setTimeout(() => document.getElementById(fieldId(firstBadName))?.focus(), 0);
      }
      return;
    }

    const lines = active.fields
      .map((f) => {
        const v = (values[f.name] ?? "").trim();
        return v ? `${f.label}: ${v}` : null;
      })
      .filter(Boolean) as string[];
    const body = lines.join("\n");

    setState("sending");
    if (ENDPOINT) {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form: active.subject, ...values }),
        });
        setState(res.ok ? "sent" : "failed");
        if (res.ok) setValues({});
      } catch {
        setState("failed");
      }
      return;
    }

    const subject = `${active.subject} — ${values.coName || values.company || values.name || "website"}`;
    const trimmed = body.length > MAILTO_SAFE_BODY ? `${body.slice(0, MAILTO_SAFE_BODY)}\n\n[…continued — please see attached or ask us to call]` : body;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed)}`;
    setState("sent");
  };

  /**
   * A filled field, not a bare underline. On this near-black section a single
   * bottom rule was almost invisible until focused — the form read as floating
   * labels over nothing. A faint fill gives every input an edge at rest, and
   * the gold ring on focus stays the strongest signal on the panel.
   */
  const inputBase =
    "w-full rounded-xl bg-ink/45 text-cream px-4 py-3 outline-none border transition-colors duration-300 hover:border-white/30 focus:border-gold focus:bg-ink/60";

  return (
    <div>
      {/* ── tabs ── */}
      <div role="tablist" aria-label="Contact forms" className="flex flex-wrap gap-3 mb-10">
        {TABS.map((t) => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${idBase}-${t.key}`}
              id={`${idBase}-tab-${t.key}`}
              onClick={() => switchTab(t.key)}
              className={`px-7 py-3.5 rounded-full label transition-colors duration-300 ${
                on
                  ? "bg-gold text-ink"
                  : "border border-white/20 text-cream/70 hover:border-gold hover:text-gold"
              }`}
            >
              {t.title}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${idBase}-${active.key}`}
        aria-labelledby={`${idBase}-tab-${active.key}`}
      >
        <p className="text-cream/70 font-light leading-relaxed mb-7 max-w-2xl">
          {active.blurb}
        </p>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <form
          onSubmit={submit}
          noValidate
          className="lg:col-span-7 grid sm:grid-cols-2 gap-x-7 gap-y-6 rounded-3xl bg-white/[0.04] border border-white/12 backdrop-blur-sm p-6 md:p-9"
        >
          {active.fields.map((f) => {
            const id = fieldId(f.name);
            const bad = errors[f.name];
            const border = bad ? "border-red-400/70" : "border-white/15";
            const common = {
              id,
              name: f.name,
              value: values[f.name] ?? "",
              "aria-invalid": bad ? true : undefined,
              "aria-describedby": bad ? `${id}-err` : undefined,
              autoComplete: f.autoComplete,
            };

            return (
              <div key={f.name} className={f.wide ? "sm:col-span-2" : undefined}>
                {/* A real <label>, always visible — not a placeholder. A
                    placeholder disappears the moment someone types, so on a
                    nine-field form they lose track of which box they are in,
                    and it is invisible to assistive technology. */}
                <label htmlFor={id} className="label label-xs text-cream/60 block mb-1">
                  {f.label}
                  {f.required && <span className="text-gold ml-1.5" aria-hidden>*</span>}
                  {f.required && <span className="sr-only"> (required)</span>}
                </label>

                {f.type === "textarea" ? (
                  <textarea
                    {...common}
                    rows={f.name === "address" ? 3 : 4}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${inputBase} ${border} resize-y font-light`}
                  />
                ) : f.type === "select" ? (
                  <select
                    {...common}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${inputBase} ${border} font-light [&>option]:bg-forest [&>option]:text-cream`}
                  >
                    <option value="">Please choose…</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    type={f.type ?? "text"}
                    onChange={(e) => set(f.name, e.target.value)}
                    className={`${inputBase} ${border} font-light [color-scheme:dark]`}
                  />
                )}

                {bad && (
                  <p id={`${id}-err`} className="text-red-300 text-[13px] font-light mt-1.5">
                    {bad}
                  </p>
                )}
              </div>
            );
          })}

          <div className="sm:col-span-2 flex flex-wrap items-center gap-6 mt-2">
            <button
              type="submit"
              disabled={state === "sending"}
              className="px-9 py-4 bg-gold text-ink rounded-full label font-bold hover:bg-cream transition-colors duration-300 disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : `Submit ${active.title.toLowerCase()}`}
            </button>

            {/* announced, not just shown — a sighted user sees the colour
                change, everyone else needs the live region */}
            <p role="status" aria-live="polite" className="text-[15px] font-light">
              {state === "sent" && !ENDPOINT && (
                <span className="text-cream/75">
                  Your email should now be open with the details filled in — press send and we
                  will come back to you. Nothing reaching you? Write to{" "}
                  <a href={`mailto:${site.email}`} className="text-gold hover:text-cream transition-colors">
                    {site.email}
                  </a>
                  .
                </span>
              )}
              {state === "sent" && ENDPOINT && (
                <span className="text-gold">Thank you — we have your details and will be in touch.</span>
              )}
              {state === "failed" && (
                <span className="text-red-300">
                  That did not go through. Please email{" "}
                  <a href={`mailto:${site.email}`} className="underline hover:text-cream">
                    {site.email}
                  </a>{" "}
                  instead.
                </span>
              )}
              {Object.keys(errors).length > 0 && state === "idle" && (
                <span className="text-red-300">
                  {Object.keys(errors).length === 1
                    ? "One field needs attention."
                    : `${Object.keys(errors).length} fields need attention.`}
                </span>
              )}
            </p>
          </div>
        </form>

        {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
