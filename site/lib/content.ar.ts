/**
 * Arabic copy, as an OVERLAY on lib/content.ts rather than a second full copy.
 *
 * Only the keys that are translated appear here; everything else falls through
 * to the English. That is deliberate for two reasons. A half-finished
 * translation then shows English in the gaps rather than blanks, so the site is
 * never broken mid-way through the work. And when the English copy changes, the
 * Arabic cannot silently drift out of step — the untranslated key simply shows
 * the new English until someone revisits it.
 *
 * ---------------------------------------------------------------------------
 * DRAFT — NOT YET REVIEWED BY A NATIVE SPEAKER.
 *
 * This is a first pass written by Claude. It must be read by a native Arabic
 * speaker before the language switch is shown to the public, for three reasons
 * in particular:
 *
 *   PROPER NOUNS. The company's registered Arabic name is not guessed at here
 *   — `name` and `legalName` are deliberately left in English. Omani place and
 *   client names (Al Khuwair, Mazoon, Duqm, the ministries) should be checked
 *   against how the company itself writes them.
 *
 *   TECHNICAL TERMS. EPC, post-tension, lost-time injury, near miss and the ISO
 *   standards have settled Arabic forms in the Gulf construction trade; the
 *   renderings below are reasonable but a working engineer should confirm them.
 *
 *   THE SAFETY FIGURES. These are a public claim about people not being hurt.
 *   A mistranslated label on the HSE record is not a typo.
 *
 * Numerals are Western (1986, 17 million) rather than Eastern Arabic (١٩٨٦),
 * which is the usual register for corporate material in Oman and matches the
 * figures the page counts up. Worth confirming as a house preference.
 * ---------------------------------------------------------------------------
 */

export const ar = {
  site: {
    // name and legalName intentionally untranslated — see the note above
    tagline: "إرثٌ من المعالم",
    heroSub:
      "أعرق شركات الهندسة والمقاولات في سلطنة عُمان — نبني معالم الوطن منذ عام 1986.",
  },

  stats: [
    { label: "عاماً من التميّز" },
    { label: "مشروعاً بارزاً" },
    { label: "موظفاً وعاملاً" },
    { label: "حجم الأعمال المتعاقد عليها" },
  ],

  vision:
    "مكانة ريادية في السوق المحلي والإقليمي، عبر تنفيذ أعمال هندسية وإنشائية بمستوى عالمي، وجعل أرفع معايير الجودة ركيزةً للنمو.",

  mission:
    "بناء علاقات طويلة الأمد قائمة على النزاهة والأداء والقيمة ورضا العملاء.",

  hse: {
    kicker: "الصحة والسلامة والبيئة",
    title: "كل فرد يعود إلى بيته كما جاء",
    lead: "السلامة قيمة أساسية لا تقبل المساومة في الأدرك، وهي جزء من كل مرحلة من مراحل المشروع، من التجهيز وحتى التسليم. نحمي قوّتنا العاملة ومقاولي الباطن وشركاء المشروع والمجتمعات المحيطة، انطلاقاً من مبدأ واحد: كل حادث في الموقع يمكن منعه.",

    kpi: {
      heading: "سبعة عشر مليون ساعة، دون أن نفقد أحداً",
      lead: "أكثر من 17 مليون ساعة عمل آمنة، عبر ثلاثة مشاريع منجزة وخمسة مشاريع قائمة.",
      asAt: "إجمالي تراكمي حتى 31 ديسمبر 2024",
      kickerLabel: "السجل",
      toDate: "حتى تاريخه",
      headline: [{ label: "ساعات العمل الآمنة" }, { label: "الكيلومترات الآمنة" }],
      zero: [{ label: "إصابات مُضيِّعة للوقت" }, { label: "حالات وفاة" }],
      incidents: [
        { label: "حوادث وشيكة" },
        { label: "حالات إسعافات أولية" },
        { label: "حالات علاج طبي" },
        { label: "حوادث مرورية", note: "طفيفة" },
        { label: "أضرار بالممتلكات", note: "طفيفة" },
        { label: "حوادث بيئية" },
      ],
    },
  },
} as const;
