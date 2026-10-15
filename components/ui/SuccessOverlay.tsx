"use client";

import { useEffect, useRef } from "react";
import { BigButton } from "@/components/ui/BigButton";

type Props = {
  title: string;
  message?: string;
  buttonLabel?: string;
  onClose: () => void;
};

/**
 * Full screen "it worked" confirmation: a giant green check that nobody can miss under the sun.
 * It also vibrates briefly (on phones that allow it) so the ranger feels it in the hand.
 */
export function SuccessOverlay({ title, message, buttonLabel = "Listo", onClose }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
    try {
      navigator.vibrate?.(120);
    } catch {}
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="success-title"
      className="safe-bottom fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-surface px-6"
    >
      <span aria-hidden="true" className="flex size-48 items-center justify-center rounded-full bg-ok text-[7rem] leading-none text-white">
        ✓
      </span>
      <h2 id="success-title" className="text-center font-display text-[2.2rem] font-extrabold leading-tight">
        {title}
      </h2>
      {message ? <p className="max-w-md text-center text-xl text-mute">{message}</p> : null}
      <div className="w-full max-w-md">
        <BigButton ref={buttonRef} onClick={onClose}>
          {buttonLabel}
        </BigButton>
      </div>
    </div>
  );
}
