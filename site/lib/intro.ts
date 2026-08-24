/**
 * The landing page's own arrival.
 *
 * There is no intro loader any more — the page IS the entrance. The hero eases
 * out of a slight push as its film starts, so arriving feels like a camera
 * settling rather than a layout snapping into place.
 */

/** The hero starts a touch pushed in and decelerates out of it. */
export const ARRIVAL_SCALE = 1.045;
/** Measured centre of the hero film's building axis / portal top. */
export const ARRIVAL_ORIGIN = "53.3% 42%";

/**
 * Fired on window by the intro loader at the moment its exit begins, while the
 * overlay is still fully opaque. The hero listens for this and rewinds its film
 * to the first frame, so what the visitor sees is the landing video STARTING
 * when the loader completes — never a film already halfway through.
 */
export const INTRO_DONE_EVENT = "adrak:intro-done";

/** Motion is reduced: show everything, just do not move it. */
export function motionOK(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
