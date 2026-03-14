"use client";

import { useState, useRef } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isScanning: boolean;
}

export default function CameraCapture({
  onCapture,
  isScanning,
}: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    onCapture(file);
  }

  function openCamera() {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {preview ? (
        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <img
            src={preview}
            alt="Product preview"
            className="h-64 w-full object-cover"
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
                <p className="text-sm font-medium text-white">
                  Identifying product...
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Take a photo or upload an image
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-3">
        <button
          onClick={openCamera}
          disabled={isScanning}
          className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          Take Photo
        </button>
        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute("capture");
              fileInputRef.current.click();
              fileInputRef.current.setAttribute("capture", "environment");
            }
          }}
          disabled={isScanning}
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Upload Image
        </button>
      </div>
    </div>
  );
}
