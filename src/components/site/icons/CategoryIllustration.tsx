import { useId } from "react";
import type { ReactElement, ReactNode, SVGProps } from "react";

/**
 * In-house category illustrations, used as the default product image
 * (when `Product.imageUrl` is null) and as icons on category tiles/pills.
 * Deliberately not photoreal — real product photography risks trademark
 * issues on branded packaging pulled from the web, and hotlinked external
 * images are exactly what the brief warns against (link rot, unreliable
 * availability). Swap in real photos any time by setting `Product.imageUrl`
 * — no code change needed; see `/api/admin/upload-image`.
 *
 * Style: a grounded shadow, a two-tone sack/bottle/jar body for a little
 * dimensionality, and a small round "label patch" carrying a
 * category-specific glyph — reads as a stocked wholesale item rather than
 * a bare wireframe icon. Sack material uses a warm tan (real burlap/sack
 * color), not the brand palette — the brand green/gold shows up in the
 * label patch and glyph instead, so it doesn't fight the container shape.
 */

type IconProps = SVGProps<SVGSVGElement>;

const TAN_LIGHT = "#F1E4CC";
const TAN_DARK = "#D9C39D";
const TAN_SHADE = "#C7AD82";
const TIE = "#A88656";

/** Stable, collision-free gradient id — `useId()` rather than a module-level counter, which would drift between server and client renders (SSR hydration mismatch) and could collide across concurrent requests sharing the same server process. */
function useGradientId(prefix: string) {
  return `${prefix}-${useId()}`;
}

/** Small round patch carrying a category glyph, sitting on the container body. */
function LabelPatch({ cx, cy, r = 9, children }: { cx: number; cy: number; r?: number; children: ReactNode }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FCFAF4" stroke="var(--color-brand-primary-dark)" strokeWidth="1.4" />
      {children}
    </g>
  );
}

/** Tied-neck sack silhouette shared by the dry-goods categories (rice, beans, garri, flour, semovita). */
function SackBase({ children, ...props }: IconProps & { children?: ReactNode }) {
  const grad = useGradientId("sack");
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <defs>
        <linearGradient id={grad} x1="16" y1="16" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={TAN_LIGHT} />
          <stop offset="100%" stopColor={TAN_DARK} />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="57" rx="15" ry="3" fill="#000" opacity="0.08" />
      {/* body */}
      <path
        d="M19 20c-1 2-3 6-3 12 0 10 2 20 3 24a5 5 0 0 0 5 4h16a5 5 0 0 0 5-4c1-4 3-14 3-24 0-6-2-10-3-12Z"
        fill={`url(#${grad})`}
        stroke={TAN_SHADE}
        strokeWidth="1.5"
      />
      {/* right-side shading for volume */}
      <path d="M38 20c1 2 3 6 3 12 0 10-2 20-3 24a5 5 0 0 1-2 2.6c2.6-.6 4.3-2.6 4.8-5C41.8 49 44 39 44 32c0-6-2-10-3-12Z" fill={TAN_SHADE} opacity="0.55" />
      {/* tied neck */}
      <path d="M22 20c0-5 4.5-8 10-8s10 3 10 8" fill="none" stroke={TIE} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M22 20c0-5 4.5-8 10-8s10 3 10 8" fill="none" stroke={TIE} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* burlap stitch lines */}
      <path d="M19 27h26M18.4 34h27.2" stroke={TAN_SHADE} strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.8" />
      {children}
    </svg>
  );
}

function RiceIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <LabelPatch cx={32} cy={44}>
        {[-3.5, 0, 3.5].map((dx, i) => (
          <ellipse key={i} cx={32 + dx} cy={44 - (i % 2 ? 1.5 : -1.5)} rx="2.6" ry="1.3" fill="var(--color-brand-accent)" transform={`rotate(${dx * 8} ${32 + dx} ${44})`} />
        ))}
      </LabelPatch>
    </SackBase>
  );
}

function BeansIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <LabelPatch cx={32} cy={44}>
        {[
          [29, 42],
          [35, 41],
          [32, 46],
        ].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="2.6" ry="3.4" fill={i === 1 ? "var(--color-brand-accent)" : "var(--color-brand-primary)"} transform={`rotate(${i * 40 - 20} ${cx} ${cy})`} />
        ))}
      </LabelPatch>
    </SackBase>
  );
}

function GarriIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <LabelPatch cx={32} cy={44}>
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={28 + (i % 3) * 4} cy={40.5 + Math.floor(i / 3) * 3.5} r="1" fill="var(--color-brand-accent)" />
        ))}
      </LabelPatch>
    </SackBase>
  );
}

function FlourIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <circle cx={32} cy={44} r="9" fill="#FCFAF4" stroke="var(--color-brand-primary-dark)" strokeWidth="1.4" />
      <circle cx={32} cy={44} r="4.4" fill="#FCFAF4" opacity="0.9" />
      <circle cx={32} cy={44} r="4.4" fill="none" stroke="var(--color-brand-accent)" strokeWidth="1.2" strokeDasharray="1.8 2" />
    </SackBase>
  );
}

function SemovitaIcon(props: IconProps) {
  return (
    <SackBase {...props}>
      <LabelPatch cx={32} cy={44}>
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1={26 + i * 3} y1="40" x2={26 + i * 3} y2="48" stroke="var(--color-brand-accent)" strokeWidth="1.3" strokeLinecap="round" opacity="0.9" />
        ))}
      </LabelPatch>
    </SackBase>
  );
}

function CookingOilIcon(props: IconProps) {
  const grad = useGradientId("oil");
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <defs>
        <linearGradient id={grad} x1="22" y1="30" x2="42" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3CB4A" />
          <stop offset="100%" stopColor="var(--color-brand-accent)" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="57" rx="13" ry="3" fill="#000" opacity="0.08" />
      <path d="M23 26h18v28a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5Z" fill="#EFF6F3" stroke="var(--color-brand-primary-dark)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M25 34h14v18a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3Z" fill={`url(#${grad})`} />
      <rect x="27" y="15" width="10" height="11" rx="1.5" fill="#EFF6F3" stroke="var(--color-brand-primary-dark)" strokeWidth="1.6" />
      <rect x="29" y="10" width="6" height="6" rx="1" fill="var(--color-brand-primary-dark)" />
      <circle cx="32" cy="43" r="6.5" fill="#FCFAF4" opacity="0.92" stroke="var(--color-brand-primary-dark)" strokeWidth="1.1" />
      <path d="M29 43c0-2.2 1.4-3.5 3-3.5" stroke="var(--color-brand-primary)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function NoodlesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <ellipse cx="32" cy="57" rx="17" ry="3" fill="#000" opacity="0.08" />
      <path d="M12 22 32 12l20 10v22l-20 10-20-10Z" fill={TAN_LIGHT} stroke={TAN_SHADE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 12v22M12 22l20 10 20-10" stroke="var(--color-brand-primary-dark)" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
      <path d="M32 34v20" stroke={TAN_SHADE} strokeWidth="1" opacity="0.6" />
      <circle cx="32" cy="44" r="9" fill="#FCFAF4" stroke="var(--color-brand-primary-dark)" strokeWidth="1.4" />
      <path
        d="M27 47c1-3-1-3-1-6s2-3 2-6M32 47c1-3-1-3-1-6s2-3 2-6M37 47c1-3-1-3-1-6s2-3 2-6"
        stroke="var(--color-brand-accent)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SpicesIcon(props: IconProps) {
  const grad = useGradientId("jar");
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <defs>
        <linearGradient id={grad} x1="20" y1="24" x2="44" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#EDE6D6" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="57" rx="13" ry="3" fill="#000" opacity="0.08" />
      <rect x="26" y="14" width="12" height="7" rx="1.5" fill="var(--color-brand-primary-dark)" />
      <rect x="24" y="19" width="16" height="4" rx="1" fill="var(--color-brand-primary)" />
      <path d="M21 23h22l2 32a4 4 0 0 1-4 4.5H23a4 4 0 0 1-4-4.5Z" fill={`url(#${grad})`} stroke={TAN_SHADE} strokeWidth="1.5" strokeLinejoin="round" />
      {[
        [26, 34, "var(--color-brand-accent)"],
        [33, 31, "var(--color-brand-primary)"],
        [39, 35, "var(--color-brand-accent)"],
        [28, 41, "var(--color-brand-primary)"],
        [37, 42, "var(--color-brand-accent)"],
        [32, 46, "var(--color-brand-primary)"],
      ].map(([cx, cy, fill], i) => (
        <circle key={i} cx={cx as number} cy={cy as number} r="2.3" fill={fill as string} />
      ))}
    </svg>
  );
}

function GenericProductIcon(props: IconProps) {
  const grad = useGradientId("box");
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <defs>
        <linearGradient id={grad} x1="16" y1="20" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={TAN_LIGHT} />
          <stop offset="100%" stopColor={TAN_DARK} />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="55" rx="15" ry="3" fill="#000" opacity="0.08" />
      <path d="M16 22h32v26a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3Z" fill={`url(#${grad})`} stroke={TAN_SHADE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 22 32 14l16 8-16 8Z" fill="var(--color-brand-primary-dark)" />
      <circle cx="32" cy="38" r="7" fill="#FCFAF4" stroke="var(--color-brand-primary-dark)" strokeWidth="1.3" />
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
