import type { ReactElement, ReactNode, SVGProps } from "react";

/**
 * In-house category illustrations, used as the default product image
 * (when `Product.imageUrl` is null) and as icons on category tiles/pills.
 * Deliberately not photoreal — real product photography risks trademark
 * issues on branded packaging pulled from the web, and hotlinked external
 * images are exactly what the brief warns against (link rot, unreliable
 * availability). These are simple, consistent, on-brand flat illustrations
 * that read as "wholesale catalogue," not "broken image." Swap in real
 * photos any time by setting `Product.imageUrl` — no code change needed.
 */

type IconProps = SVGProps<SVGSVGElement>;

const SACK_PATH = "M20 14h24l4 8-3 34a5 5 0 0 1-5 4.5H24a5 5 0 0 1-5-4.5L16 22Z";

function SackBase({ children, ...props }: IconProps & { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path d={SACK_PATH} className="fill-surface-muted stroke-brand-primary-dark" strokeWidth="2" strokeLinejoin="round" />
      <path d="M23 14c0-4 9-4 9-4s9 0 9 4" className="stroke-brand-primary-dark" strokeWidth="2" strokeLinecap="round" />
      {children}
    </svg>
  );
}

function RiceIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 3 }).map((_, col) => (
          <ellipse
            key={`${row}-${col}`}
            cx={24 + col * 8}
            cy={30 + row * 6}
            rx="2.2"
            ry="1.1"
            className="fill-brand-accent"
            transform={`rotate(${(row + col) % 2 === 0 ? 20 : -20} ${24 + col * 8} ${30 + row * 6})`}
          />
        )),
      )}
    </SackBase>
  );
}

function BeansIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      {[
        [24, 28],
        [32, 26],
        [40, 29],
        [26, 36],
        [34, 38],
        [40, 40],
        [28, 46],
        [36, 47],
      ].map(([cx, cy], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="3" ry="4" className="fill-brand-primary" transform={`rotate(${i * 35} ${cx} ${cy})`} />
      ))}
    </SackBase>
  );
}

function GarriIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      {Array.from({ length: 30 }).map((_, i) => {
        const cx = 22 + ((i * 7) % 20);
        const cy = 26 + Math.floor(i / 5) * 6;
        return <circle key={i} cx={cx} cy={cy} r="1.1" className="fill-brand-accent" />;
      })}
    </SackBase>
  );
}

function FlourIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <path
        d="M20 26c3-2 5 2 8 0s5-2 8 0 5-2 8 0M20 34c3-2 5 2 8 0s5-2 8 0 5-2 8 0M22 42c3-2 5 2 8 0s5-2 8 0"
        className="stroke-brand-accent"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </SackBase>
  );
}

function SemovitaIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={22 + i * 3} y1="24" x2={22 + i * 3} y2="50" className="stroke-brand-accent" strokeWidth="1" opacity="0.7" />
      ))}
    </SackBase>
  );
}

function CookingOilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <path
        d="M22 24h20v28a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4Z"
        className="fill-surface-muted stroke-brand-primary-dark"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="26" y="14" width="12" height="10" rx="1.5" className="fill-surface-muted stroke-brand-primary-dark" strokeWidth="2" />
      <rect x="28" y="9" width="8" height="6" rx="1" className="fill-brand-primary-dark" />
      <rect x="24" y="34" width="16" height="12" rx="1" className="fill-brand-accent" opacity="0.85" />
    </svg>
  );
}

function NoodlesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <rect x="14" y="18" width="36" height="30" rx="2" className="fill-surface-muted stroke-brand-primary-dark" strokeWidth="2" />
      <path d="M14 18 32 30l18-12" className="stroke-brand-primary-dark" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M20 40c2-3 4 3 6 0s4-3 6 0 4-3 6 0 4-3 6 0"
        className="stroke-brand-accent"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SpicesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <rect x="18" y="20" width="28" height="28" rx="2" className="fill-surface-muted stroke-brand-primary-dark" strokeWidth="2" />
      <path d="M18 20h28l-3-6H21Z" className="fill-brand-primary-dark" />
      {[
        [24, 30, "fill-brand-accent"],
        [32, 33, "fill-brand-primary"],
        [40, 29, "fill-brand-accent"],
        [27, 40, "fill-brand-primary"],
        [37, 41, "fill-brand-accent"],
      ].map(([cx, cy, cls], i) => (
        <circle key={i} cx={cx as number} cy={cy as number} r="2.4" className={cls as string} />
      ))}
    </svg>
  );
}

function GenericProductIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <rect x="16" y="18" width="32" height="30" rx="2" className="fill-surface-muted stroke-brand-primary-dark" strokeWidth="2" />
      <path d="M16 26h32" className="stroke-brand-primary-dark" strokeWidth="2" />
    </svg>
  );
}

const ICONS_BY_SLUG: Record<string, (props: IconProps) => ReactElement> = {
  rice: RiceIcon,
  beans: BeansIcon,
  garri: GarriIcon,
  flour: FlourIcon,
  semovita: SemovitaIcon,
  "cooking-oil": CookingOilIcon,
  "noodles-pasta": NoodlesIcon,
  spices: SpicesIcon,
};

export function CategoryIllustration({ categorySlug, ...props }: { categorySlug: string } & IconProps) {
  const Icon = ICONS_BY_SLUG[categorySlug] ?? GenericProductIcon;
  return <Icon {...props} />;
}

export function hasCategoryIllustration(categorySlug: string): boolean {
  return categorySlug in ICONS_BY_SLUG;
}
