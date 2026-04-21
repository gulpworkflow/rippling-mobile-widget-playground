/**
 * Pebble responsive design tokens (from the Pebble responsive guidelines).
 *
 * Pebble ships container-query based responsive design with 7 canonical
 * breakpoints; we use the viewport-query subset relevant to the current
 * Rippling mobile shell. Numbers here match the design-system spec exactly,
 * even where Pebble hasn't exported a constant of its own (Small / Large /
 * XL / 2XL).
 *
 * | Token   | px   | Notes                                                   |
 * |---------|------|---------------------------------------------------------|
 * | 2XS     | 375  | small card widths, narrow embedded UIs                  |
 * | XS      | 480  |                                                         |
 * | Small   | 576  | compact nav (monogram + icon triggers), tightest copy   |
 * | Medium  | 768  | sidebar → drawer, mobile rhythm, stacked columns        |
 * | Large   | 992  |                                                         |
 * | XL      | 1200 | most common shell size without AI chat                  |
 * | 2XL     | 1400 |                                                         |
 */

export const BREAKPOINT_2XS = '375px';
export const BREAKPOINT_XS = '480px';
export const BREAKPOINT_SMALL = '576px';
export const BREAKPOINT_MEDIUM = '768px';
export const BREAKPOINT_LARGE = '992px';
export const BREAKPOINT_XL = '1200px';
export const BREAKPOINT_2XL = '1400px';

/** Viewport is narrower than the Medium breakpoint (768px). */
export const BELOW_MEDIUM = `@media screen and (max-width: ${BREAKPOINT_MEDIUM})`;

/** Viewport is narrower than the Small breakpoint (576px). */
export const BELOW_SMALL = `@media screen and (max-width: ${BREAKPOINT_SMALL})`;
