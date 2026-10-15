import type { ReactNode } from "react";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

type Props = {
  title: ReactNode;
  /** Shows a big "Volver" button on the left of the header */
  onBack?: () => void;
  /** Content pinned to the bottom (e.g. the "Guardar" button), always reachable with the thumb */
  footer?: ReactNode;
  children: ReactNode;
};

/** Layout of every view: simple header, scrollable content and an optional fixed footer. */
export function Screen({ title, onBack, footer, children }: Props) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b-2 border-line bg-surface px-4 py-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-14 min-w-14 items-center justify-center gap-1 rounded-xl border-[3px] border-fg px-3 text-lg font-bold active:bg-page"
          >
            <span aria-hidden="true">←</span> Volver
          </button>
        ) : null}
        <h1 className="font-display text-[1.6rem] font-extrabold leading-tight">{title}</h1>
      </header>

      <OfflineBanner />

      <main className="flex flex-1 flex-col gap-5 px-4 py-5">{children}</main>

      {footer ? <div className="safe-bottom sticky bottom-0 border-t-2 border-line bg-surface px-4 pt-3">{footer}</div> : null}
    </div>
  );
}
