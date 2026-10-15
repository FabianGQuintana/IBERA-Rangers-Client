type Props = { message: string | null };

/** Error message impossible to miss: red border, icon and big text, read aloud by screen readers. */
export function ErrorBox({ message }: Props) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-3 rounded-2xl border-[3px] border-danger bg-red-50 p-4 text-xl font-bold text-danger">
      <span aria-hidden="true">⚠️</span>
      <span>{message}</span>
    </p>
  );
}
