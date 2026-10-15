type Props = { label: string };

/** Big, slow spinner with a text that says what is happening (never a spinner alone). */
export function Spinner({ label }: Props) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 py-6">
      <span
        aria-hidden="true"
        className="block size-20 animate-spin rounded-full border-[10px] border-line border-t-sync [animation-duration:1.2s]"
      />
      <span className="text-center text-xl font-bold">{label}</span>
    </div>
  );
}
