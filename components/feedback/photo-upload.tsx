"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MAX_PHOTO_BYTES, compressImage, formatFileSize } from "@/lib/image";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface FileMeta {
  name: string;
  size: number;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<FileMeta | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file — JPG, PNG or HEIC.");
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError("That photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
      setMeta({ name: file.name, size: file.size });
      toast.success("Photo attached");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That image could not be processed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    onChange(null);
    setMeta(null);
    setError(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={busy}
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {value ? (
        <div className="overflow-hidden rounded-md border border-border bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview of the photo attached to this feedback"
            className="max-h-52 w-full object-cover"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {meta ? `${meta.name} · ${formatFileSize(meta.size)}` : "Attached photo"}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                <X aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-6 py-8 text-center transition-colors",
            dragging
              ? "border-primary bg-accent"
              : "border-border bg-background hover:border-primary/50 hover:bg-accent/40",
            busy && "pointer-events-none opacity-70",
          )}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-muted-foreground">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <span className="text-sm font-medium">
            {busy ? "Preparing photo…" : "Drop a photo here, or browse"}
          </span>
          <span className="text-xs text-muted-foreground">
            Optional · JPG, PNG or HEIC · up to 5 MB
          </span>
        </label>
      )}

      {error ? (
        <p className="mt-2 text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
