"use client";

import { useEffect, useRef, useState } from "react";
import { BigButton } from "@/components/ui/BigButton";
import { ErrorBox } from "@/components/ui/ErrorBox";
import { Screen } from "@/components/ui/Screen";
import { SuccessOverlay } from "@/components/ui/SuccessOverlay";
import { Spinner } from "@/components/ui/Spinner";
import { useSilentLocation, type LocationStatus } from "@/hooks/useSilentLocation";
import { CATEGORIES } from "@/lib/data/categories";
import { newId } from "@/lib/id";
import { compressPhoto } from "@/lib/image/compress";
import { saveReport } from "@/lib/storage/reports-db";

type Props = { onDone: () => void };

/** How long "Guardar" waits for the GPS if it has no position yet. */
const GPS_WAIT_MS = 15_000;

/**
 * Vista 2 — Nuevo reporte, pensado para usar en el terreno y sin señal:
 * foto con la cámara del teléfono, una categoría con un toque, notas opcionales y guardar.
 * La ubicación se toma sola en segundo plano apenas se abre la pantalla.
 */
export function NewReportView({ onDone }: Props) {
  const { fix, status, waitForFix } = useSilentLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLFieldSetElement>(null);

  const [photo, setPhotoState] = useState<{ blob: Blob; url: string } | null>(null);
  const photoRef = useRef(photo);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState<"idle" | "waiting-gps" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Preview of the photo: the temporary URL is released when the photo changes or the screen closes
  const setPhoto = (blob: Blob) => {
    if (photoRef.current) URL.revokeObjectURL(photoRef.current.url);
    const next = { blob, url: URL.createObjectURL(blob) };
    photoRef.current = next;
    setPhotoState(next);
  };

  useEffect(
    () => () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current.url);
    },
    [],
  );

  const onPhotoSelected = async (file: File | undefined) => {
    if (!file) return;
    setProcessingPhoto(true);
    setError(null);
    try {
      setPhoto(await compressPhoto(file));
    } catch {
      setPhoto(file); // could not shrink it: keep the original
    } finally {
      setProcessingPhoto(false);
      if (fileRef.current) fileRef.current.value = ""; // allows taking the same photo again
    }
  };

  const save = async () => {
    if (!categoryId) {
      setError("Elegí qué encontraste tocando uno de los 4 botones.");
      categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError(null);

    // If the GPS has not answered yet, give it a few more seconds (it works without mobile signal)
    let position = fix;
    if (!position && status !== "denied" && status !== "unavailable") {
      setSaving("waiting-gps");
      position = await waitForFix(GPS_WAIT_MS);
    }

    setSaving("saving");
    try {
      await saveReport({
        clientId: newId(),
        categoryId,
        latitude: position?.latitude ?? null,
        longitude: position?.longitude ?? null,
        accuracy: position ? Math.round(position.accuracy) : null,
        notes: notes.trim(),
        captureDate: new Date().toISOString(),
        photo: photo?.blob ?? null,
      });
      setSaved(true);
    } catch {
      setError("No se pudo guardar en el teléfono. Revisá que tenga espacio libre y probá de nuevo.");
    } finally {
      setSaving("idle");
    }
  };

  if (saved) {
    return (
      <SuccessOverlay
        title="¡Reporte guardado!"
        message={
          fix || status === "ok"
            ? "Quedó en el teléfono. Envialo con «Sincronizar» cuando tengas señal."
            : "Quedó en el teléfono, pero sin ubicación GPS. Envialo con «Sincronizar» cuando tengas señal."
        }
        buttonLabel="Volver al inicio"
        onClose={onDone}
      />
    );
  }

  return (
    <Screen
      title="Nuevo reporte"
      onBack={onDone}
      footer={
        saving !== "idle" ? (
          <Spinner label={saving === "waiting-gps" ? "Buscando la ubicación GPS…" : "Guardando…"} />
        ) : (
          <BigButton icon="💾" onClick={save}>
            Guardar reporte
          </BigButton>
        )
      }
    >
      {/* 1. Foto */}
      <section aria-labelledby="photo-title" className="flex flex-col gap-3">
        <h2 id="photo-title" className="sr-only">
          Foto
        </h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPhotoSelected(e.target.files?.[0])}
        />

        {processingPhoto ? (
          <Spinner label="Preparando la foto…" />
        ) : photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image does not apply */}
            <img src={photo.url} alt="Foto tomada para el reporte" className="max-h-[40svh] w-full rounded-2xl border-[3px] border-ok object-cover" />
            <p className="text-center text-xl font-bold text-ok">
              <span aria-hidden="true">✓ </span>Foto lista
            </p>
            <BigButton variant="neutral" icon="🔁" onClick={() => fileRef.current?.click()}>
              Sacar otra foto
            </BigButton>
          </>
        ) : (
          <BigButton icon="📷" className="min-h-40" onClick={() => fileRef.current?.click()}>
            Tomar foto
          </BigButton>
        )}
      </section>

      {/* 2. Categoría */}
      <fieldset ref={categoriesRef} className="flex flex-col gap-3">
        <legend className="mb-3 font-display text-[1.7rem] font-extrabold">¿Qué encontraste?</legend>
        <div role="radiogroup" aria-label="¿Qué encontraste?" className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const selected = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${c.label}: ${c.description}`}
                onClick={() => {
                  setCategoryId(c.id);
                  setError(null);
                }}
                className={`relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-[4px] p-3 text-center text-xl font-extrabold transition-colors ${
                  selected ? "border-primary bg-primary text-white" : "border-fg bg-surface text-fg active:bg-page"
                }`}
              >
                {selected ? (
                  <span aria-hidden="true" className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white text-xl text-primary">
                    ✓
                  </span>
                ) : null}
                <span aria-hidden="true" className="text-[3rem] leading-none">
                  {c.icon}
                </span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <ErrorBox message={error} />

      {/* 3. Notas (opcional) */}
      <label htmlFor="notes" className="flex flex-col gap-2">
        <span className="text-xl font-bold">Notas (opcional)</span>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-2xl border-[3px] border-fg bg-surface p-4 text-xl"
        />
      </label>

      <LocationLine status={status} accuracy={fix?.accuracy ?? null} />
    </Screen>
  );
}

/** Discreet line about the GPS: the ranger does not have to do anything, but can see that it worked. */
function LocationLine({ status, accuracy }: { status: LocationStatus; accuracy: number | null }) {
  const text =
    status === "ok"
      ? `📍 Ubicación tomada${accuracy ? ` (±${Math.round(accuracy)} m)` : ""}`
      : status === "searching"
        ? "📍 Buscando ubicación…"
        : status === "denied"
          ? "📍 El teléfono no dio permiso para la ubicación. Activalo en los ajustes del navegador."
          : "📍 No se pudo tomar la ubicación. El reporte se guarda igual.";

  return (
    <p role="status" aria-live="polite" className={`text-lg font-bold ${status === "ok" ? "text-ok" : status === "searching" ? "text-mute" : "text-warn"}`}>
      {text}
    </p>
  );
}
