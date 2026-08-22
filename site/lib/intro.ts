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

/** Motion is reduced: show everything, just do not move it. */
export function motionOK(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
