import {
  awards,
  careers,
  certifications,
  clientele,
  expertise,
  facilities,
  groupCompanies,
  hse,
  leadership,
  mission,
  moreProjects,
  offices,
  projectNames,
  projects,
  sectors,
  site,
  stats,
  vision,
} from "./content";
import { currentPortfolio } from "./register";
import { asset } from "./asset";
import { years } from "./anniversary";
import news from "./news-data.json";

/**
 * The site's own content, flattened into something searchable.
 *
 * This is deliberately NOT a chatbot in the language-model sense. The site is a
 * static export with no server and no API key, so there is nothing to send a
 * question to. What it can do honestly is answer FROM THE PAGE: every entry
 * below is derived from the same exports the site renders, so an answer is
 * always a real fact with a real link, and it cannot invent a project, a
 * certificate or a phone number that does not exist.
 *
 * Everything is derived, never retyped — add a project to content.ts and the
 * assistant knows it on the next build.
 */
export type Entry = {
  id: string;
  title: string;
  /** what the assistant reads out */
  body: string;
  /** where "read more" goes */
  href: string;
  /** extra search terms that do not appear in the title or body */
  tags?: string[];
  /** nudges a category up or down when scores tie */
  weight?: number;
};

const S = (id: string) => asset(`/#${id}`);

const entries: Entry[] = [];
const add = (e: Entry) => entries.push(e);

/* ---- the answers people actually arrive with ------------------------------ */
add({
  id: "contact",
  title: "How to reach Al Adrak",
  body: `Call ${site.phone} or email ${site.email}. The head office is at Halban, Barka, Al Batinah. You can also send a client enquiry or register as a vendor using the forms in the contact section.`,
  href: S("work-with-us"),
  tags: ["contact", "contact us", "phone", "telephone", "call", "email", "address", "reach", "get in touch", "enquiry", "enquire", "talk", "speak", "number", "whatsapp"],
  weight: 2,
});
add({
  id: "vendor",
  title: "Registering as a vendor or supplier",
  body: "Use the vendor registration form in the contact section. It asks for your company name, registration number and expiry, address, what you supply, and a contact person. Procurement reviews registrations against our pre-qualification criteria.",
  href: S("work-with-us"),
  tags: ["supplier", "vendor", "subcontractor", "procurement", "register", "registration", "prequalification", "pre-qualification", "tender", "quote", "rfq", "supply"],
  weight: 2,
});
add({
  id: "company",
  title: `Al Adrak — ${years()} years of building Oman`,
  body: `${site.legalName}. ${site.heroSub} ${stats.map((s) => `${s.prefix ?? ""}${s.value}${s.suffix ?? ""} ${s.label}`).join(", ")}.`,
  href: S("about"),
  tags: ["who", "about", "company", "history", "founded", "established", "1986", "size", "employees", "workforce", "turnover", "order book", "years old"],
  weight: 2,
});
add({ id: "vision", title: "Our vision", body: vision, href: S("about"), tags: ["vision", "goal", "ambition"] });
add({ id: "mission", title: "Our mission", body: mission, href: S("about"), tags: ["mission", "values", "purpose"] });

/* ---- offices --------------------------------------------------------------- */
for (const o of offices) {
  add({
    id: `office-${o.name}`,
    title: o.name,
    body: `${o.address.join(", ")}.${o.phone ? ` Phone ${o.phone}.` : ""}${o.fax ? ` Fax ${o.fax}.` : ""} Email ${o.email}.`,
    href: S("contact"),
    tags: ["office", "address", "location", "where", "branch", "phone", "email"],
  });
}

/* ---- what we do ------------------------------------------------------------ */
for (const e of expertise) {
  add({
    id: `expertise-${e.key}`,
    title: e.title,
    body: `${e.lead}. ${e.points.join(". ")}.`,
    href: S("expertise"),
    tags: ["capability", "capabilities", "division", "engineering", "can you", "do you"],
  });
}
for (const s of sectors) {
  add({ id: `sector-${s.name}`, title: `${s.name} — sector`, body: s.desc, href: S("expertise"), tags: ["sector", "market", "type of work"] });
}
for (const f of facilities) {
  add({
    id: `facility-${f.name}`,
    title: `${f.name} — in-house facility`,
    body: f.desc,
    href: S("facilities"),
    tags: ["facility", "factory", "workshop", "plant", "in-house", "manufacture", "production"],
  });
}

/* ---- projects: delivered, and the live register ---------------------------- */
/** only the signature gallery carries specs; moreProjects entries do not */
const specsOf = (p: object) => {
  const s = (p as { specs?: string[] }).specs;
  return s?.length ? " " + s.join(". ") + "." : "";
};

for (const p of [...projects, ...moreProjects]) {
  add({
    id: `project-${p.name}`,
    title: p.name,
    body: `${p.sector}, ${p.place}. ${p.desc}${specsOf(p)}`,
    href: S("projects"),
    tags: ["project", "built", "delivered", "landmark", "reference"],
  });
}
for (const r of currentPortfolio) {
  add({
    id: `register-${r.code}`,
    title: `${r.name} (${r.code})`,
    body: `${r.sector}${r.place ? `, ${r.place}` : ""} — currently in delivery. ${r.desc}`,
    href: S("projects"),
    tags: ["project", "current", "ongoing", "in progress", "live", "under construction", r.code],
  });
}
add({
  id: "project-names",
  title: "Other delivered landmarks",
  body: projectNames.join(", ") + ".",
  href: S("projects"),
  tags: ["project", "list", "other", "more"],
});

/* ---- people ---------------------------------------------------------------- */
add({
  id: "leadership",
  title: "Leadership",
  body: `${leadership.founder.name}, ${leadership.founder.role}. ${leadership.founder.bio} Directors and heads: ${[...leadership.directors, ...leadership.roster].map((m: { name: string; role: string }) => `${m.name} (${m.role})`).join(", ")}.`,
  href: S("team"),
  tags: ["runs", "run", "owner", "owns", "boss", "leadership", "management", "chairman", "ceo", "ced", "director", "founder", "team", "head", "who runs"],
});

/* ---- credentials ----------------------------------------------------------- */
add({
  id: "certifications",
  title: "Certifications",
  body: `${certifications.join(", ")}. ${hse.certsNote}`,
  href: asset("/hse"),
  tags: ["iso", "certified", "certificate", "accreditation", "9001", "14001", "45001", "grade", "quality"],
  weight: 1.5,
});
add({
  id: "awards",
  title: "Awards and recognition",
  body: awards.map((a) => `${a.name} (${a.detail})`).join("; ") + ".",
  href: S("awards"),
  tags: ["award", "recognition", "prize", "forbes", "won"],
});
add({
  id: "clients",
  title: "Clients",
  body: clientele.map((g) => `${g.group}: ${g.names.slice(0, 14).join(", ")}`).join(". ") + ".",
  href: S("about"),
  tags: ["client", "customer", "who do you work for", "worked with", "references"],
});

/* ---- HSE ------------------------------------------------------------------- */
add({
  id: "hse",
  title: "Health, safety and environment",
  body: `${hse.lead} ${hse.culture.intro}`,
  href: asset("/hse"),
  tags: ["safety", "hse", "health", "environment", "accident", "incident", "ppe"],
  weight: 1.5,
});
add({
  id: "hse-rules",
  title: "The 9 Life-Saving Rules",
  body: hse.lifeSavingRules.rules.map((r, i) => `${i + 1}. ${r}`).join(" "),
  href: asset("/hse"),
  tags: ["rules", "life saving", "safety rules", "non-negotiable"],
});
add({
  id: "hse-training",
  title: "Safety training",
  body: `${hse.centre.body} ${hse.trainingExtras.map((t) => `${t.title}: ${t.desc}`).join(" ")}`,
  href: asset("/hse"),
  tags: ["training", "induction", "toolbox", "competency", "course"],
});
add({
  id: "hse-docs",
  title: "HSE policies and certificates",
  body: `Downloadable: ${hse.policies.map((p) => p.name).join(", ")}.`,
  href: asset("/hse"),
  tags: ["policy", "document", "download", "pdf", "certificate", "drug", "alcohol", "road safety", "smoking"],
});

/* ---- careers --------------------------------------------------------------- */
add({
  id: "careers",
  title: "Careers at Al Adrak",
  body: careers.map((c) => `${c.role} (${c.exp}) — ${c.desc}`).join(" "),
  href: asset("/careers"),
  tags: ["job", "jobs", "career", "vacancy", "hiring", "recruit", "apply", "cv", "resume", "work for you", "employment"],
  weight: 1.5,
});

/* ---- the group ------------------------------------------------------------- */
add({
  id: "group",
  title: "The Adrak Group",
  body: groupCompanies.map((g) => g.name).join(", ") + ".",
  href: S("contact"),
  tags: ["group", "subsidiary", "sister company", "companies", "divisions", "hotels", "developers"],
});

/* ---- news ------------------------------------------------------------------ */
type News = { slug: string; date: string; title: string; body: string[] };
const newsItems = (Array.isArray(news) ? news : Object.values(news)[0]) as News[];
for (const n of newsItems.slice(0, 14)) {
  add({
    id: `news-${n.slug}`,
    title: n.title,
    body: `${n.date}. ${(n.body ?? []).join(" ").slice(0, 400)}`,
    href: asset("/news"),
    tags: ["news", "announcement", "latest", "press", "update"],
  });
}

export const KNOWLEDGE: Entry[] = entries;

/* ---- search ---------------------------------------------------------------- */

/** words too common to carry meaning in a query this short */
const STOP = new Set(
  "a an the is are was were do does did of in on at to for from with and or but you your yours we our us i me my can could would should what which who whom whose where when why how tell show give please".split(" ")
);

/**
 * Light stemming — enough to make "projects" match "project" and "certified"
 * match "certificate" without pulling in a stemmer library for eight rules.
 */
const stem = (w: string) =>
  w
    .replace(/(ies)$/, "y")
    .replace(/(ications?|ication)$/, "ify")
    .replace(/(ied)$/, "y")
    .replace(/(ing|ed|es|s)$/, "");

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s.+&-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const terms = (s: string) =>
  norm(s)
    .filter((w) => !STOP.has(w) && w.length > 1)
    .map(stem)
    // stemming can shorten a word below the threshold it just passed
    .filter((w) => w.length > 1);

/** pre-tokenised once at module load, not per keystroke */
const INDEX = KNOWLEDGE.map((e) => {
  const t = new Map<string, number>();
  const bump = (w: string, n: number) => t.set(w, (t.get(w) ?? 0) + n);
  for (const w of terms(e.title)) bump(w, 4);
  for (const w of terms(e.tags?.join(" ") ?? "")) bump(w, 3);
  for (const w of terms(e.body)) bump(w, 1);
  return { entry: e, t, hay: `${e.title} ${e.tags?.join(" ") ?? ""} ${e.body}`.toLowerCase() };
});

export type Hit = { entry: Entry; score: number };

/**
 * Score by term overlap, with a phrase bonus.
 *
 * No fuzzy matching on purpose: on a corpus this small, edit-distance matching
 * mostly produces confident wrong answers ("crusher" for "career"), and a
 * wrong answer with a citation is worse than "I don't know".
 */
export function search(query: string, limit = 3): Hit[] {
  const q = terms(query);
  if (!q.length) return [];
  const phrase = query.trim().toLowerCase();

  const hits: Hit[] = [];
  for (const { entry, t, hay } of INDEX) {
    let score = 0;
    let matched = 0;
    for (const w of q) {
      const direct = t.get(w) ?? 0;
      if (direct) { score += direct; matched++; continue; }
      // A prefix match is worth less than an exact one, and needs at least
      // four characters of agreement — below that "car" matches "carpentry"
      // and "ask" matches "asdfghjkl", both confidently and both wrong.
      if (w.length >= 4) {
        for (const [k, v] of t) {
          if (k.length >= 4 && (k.startsWith(w) || w.startsWith(k))) { score += v * 0.5; matched++; break; }
        }
      }
    }
    if (!matched) continue;
    // every query word present beats a single word appearing many times
    score *= 1 + (matched / q.length) * 1.5;
    if (phrase.length > 6 && hay.includes(phrase)) score += 12;
    score *= entry.weight ?? 1;
    hits.push({ entry, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** shown as starter chips, and as the fallback when nothing matches */
export const SUGGESTIONS = [
  "What does Al Adrak build?",
  "How do I register as a supplier?",
  "Are you ISO certified?",
  "What projects are under construction?",
  "How do I contact you?",
  "Do you have any job openings?",
];
