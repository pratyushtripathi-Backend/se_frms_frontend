// Scrolls the horizontally-scrollable page-number strip so `element` (the
// current page's button) is centred in it — and ONLY that strip.
//
// element.scrollIntoView() can't be used for this: it also scrolls every
// scrollable ancestor, including the dashboard's main content area, so the
// whole page jumped down to wherever the pagination sits (e.g. opening the
// Dashboard landed in the middle, at Recent Transactions).
export function scrollIntoHorizontalStrip(element, behavior = "smooth") {
  if (!element) return;

  let strip = element.parentElement;

  while (strip) {
    const { overflowX } = window.getComputedStyle(strip);

    if (overflowX === "auto" || overflowX === "scroll") break;
    strip = strip.parentElement;
  }

  if (!strip) return;

  const stripRect = strip.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const left =
    strip.scrollLeft +
    (elementRect.left - stripRect.left) -
    (strip.clientWidth - elementRect.width) / 2;

  strip.scrollTo({ left: Math.max(0, left), behavior });
}
