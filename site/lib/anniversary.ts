/**
 * The single source of truth for Al Adrak's age.
 *
 * The site had "40" written into it in nine places, plus two stale claims left
 * over from older copy ("thirty-six years", "three and a half decades"). Every
 * one of those is now derived from the founding year, so the count is right on
 * its own and cannot drift out of step with itself.
 *
 * These are FUNCTIONS, not constants, on purpose: a module-level constant is
 * evaluated once when the module first loads and would then be frozen for the
 * life of the server process. Called during render, they are re-evaluated every
 * time a page is generated. Paired with the daily `revalidate` on the home page,
 * the count rolls over on its own within a day of each New Year — no code change
 * and no redeploy.
 */

/** Al Adrak was founded in Muscat in 1986. */
export const FOUNDED = 1986;

/** The current calendar year. */
export function currentYear(): number {
  return new Date().getFullYear();
}

/** Years of operation, counted from the founding year. */
export function years(): number {
  return currentYear() - FOUNDED;
}

const WORDS: Record<number, string> = {
  30: "Thirty",
  31: "Thirty-one",
  32: "Thirty-two",
  33: "Thirty-three",
  34: "Thirty-four",
  35: "Thirty-five",
  36: "Thirty-six",
  37: "Thirty-seven",
  38: "Thirty-eight",
  39: "Thirty-nine",
  40: "Forty",
  41: "Forty-one",
  42: "Forty-two",
  43: "Forty-three",
  44: "Forty-four",
  45: "Forty-five",
  46: "Forty-six",
  47: "Forty-seven",
  48: "Forty-eight",
  49: "Forty-nine",
  50: "Fifty",
  51: "Fifty-one",
  52: "Fifty-two",
  53: "Fifty-three",
  54: "Fifty-four",
  55: "Fifty-five",
};

/**
 * The year count spelled out, for display copy — "Forty years of landmarks".
 * Falls back to the numeral outside the mapped range rather than throwing, so a
 * missing word can never take the page down.
 */
export function yearsWord(): string {
  const n = years();
  return WORDS[n] ?? String(n);
}
