/** The current calendar year, as a named helper (rather than inlining `new Date()` in a component body) — same reasoning as `daysAgo` in `lib/analytics/dashboard.ts`: keeps the impure call in a plain utility function, not directly in a component/hook body. */
export function currentYear(): number {
  return new Date().getFullYear();
}
