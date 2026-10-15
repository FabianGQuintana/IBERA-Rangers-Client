import type { ComponentPropsWithRef, ReactNode } from "react";

type Variant = "primary" | "sync" | "danger" | "neutral";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white active:bg-primary-press",
  sync: "bg-sync text-white active:bg-sync-press",
  danger: "bg-danger text-white active:bg-danger-press",
  neutral: "bg-surface text-fg border-[3px] border-fg active:bg-page",
};

type Props = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  /** Emoji or icon shown big above (or before) the label */
  icon?: ReactNode;
  /** "hero": fills most of the screen (dashboard); "large": full width, 80 px tall */
  size?: "hero" | "large";
  children: ReactNode;
};

/**
 * The only button of the app: always full width, never smaller than 80 px tall (rule: ≥ 48 px),
 * high contrast and with a clear "pressed" state so the ranger feels the tap.
 */
export function BigButton({ variant = "primary", icon, size = "large", className = "", children, ...rest }: Props) {
  const sizing =
    size === "hero"
      ? "min-h-[34svh] flex-col gap-3 text-[1.9rem] rounded-3xl px-4 py-6"
      : "min-h-20 gap-3 text-[1.35rem] rounded-2xl px-5 py-4";

  return (
    <button
      type="button"
      className={`flex w-full touch-manipulation select-none items-center justify-center text-center font-display font-extrabold uppercase leading-tight tracking-wide shadow-[0_4px_0_rgba(0,0,0,0.25)] transition-transform active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${sizing} ${className}`}
      {...rest}
    >
      {icon ? (
        <span aria-hidden="true" className={size === "hero" ? "text-[3.5rem] leading-none" : "text-[2rem] leading-none"}>
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
