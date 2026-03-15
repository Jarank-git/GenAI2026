"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ShelfScannerProps {
  onCapture: (file: File) => void;
  isLoading: boolean;
}

export default function ShelfScanner({
  onCapture,
  isLoading,
}: ShelfScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleScan() {
    if (selectedFile) {
      onCapture(selectedFile);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <Image
            src={preview}
            alt="Shelf preview"
            className="h-56 w-full object-cover"
            width={448}
            height={224}
            unoptimized
          />
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex h-48 w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-green-400 hover:bg-green-50"
        >
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              Point camera at a shelf section
            </p>
            <p className="text-xs text-gray-400">or tap to upload an image</p>
          </div>
        </button>
      )}

      {preview && !isLoading && (
        <div className="flex w-full max-w-md gap-2">
          <button
            onClick={() => {
              setPreview(null);
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retake
          </button>
          <button
            onClick={handleScan}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            Scan Shelf
          </button>
        </div>
      )}
    </div>
  );
}
