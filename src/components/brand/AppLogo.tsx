import { cn } from "@/lib/utils";
import { APP_LOGO_PATH, APP_NAME } from "@/lib/constants";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  priority?: boolean;
};

const HEIGHTS = {
  sm: 40,
  md: 52,
  lg: 84,
  xl: 148,
} as const;

/** Always the exact uploaded artwork (transparent PNG). */
const LOGO_SRC = `${APP_LOGO_PATH}?v=20260311`;

export function AppLogo({
  className,
  size = "md",
  showWordmark = false,
  priority = false,
}: Props) {
  const height = HEIGHTS[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* plain img avoids Next/Image cache serving an older logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt={`${APP_NAME} logo`}
        width={height}
        height={height}
        className="object-contain"
        style={{ height, width: height }}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-display)] text-lg leading-tight text-[var(--color-ink)] md:text-xl">
          {APP_NAME}
        </span>
      ) : null}
    </span>
  );
}
