import type { ComponentPropsWithRef } from "react";

type Props = ComponentPropsWithRef<"input"> & { label: string; hint?: string };

/** Big input with a always-visible label (never placeholder-only: older users forget what the field was). */
export function TextField({ label, hint, id, className = "", ...rest }: Props) {
  const inputId = id ?? `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-2">
      <span className="text-xl font-bold">{label}</span>
      <input
        id={inputId}
        className={`min-h-16 w-full rounded-2xl border-[3px] border-fg bg-surface px-4 text-xl ${className}`}
        {...rest}
      />
      {hint ? <span className="text-lg text-mute">{hint}</span> : null}
    </label>
  );
}
