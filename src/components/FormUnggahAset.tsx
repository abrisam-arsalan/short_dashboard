/**
 * FormUnggahAset — form upload video ke Kotak Masuk Aset.
 */
"use client";

import { useState, useRef } from "react";
import { UI } from "@/lib/teks";

interface Props {
  kanalSlug: string;
  onSelesai?: () => void;
}

export function FormUnggahAset({ kanalSlug, onSelesai }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: "sukses" | "error"; teks: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setPesan(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kanalSlug", kanalSlug);

    try {
      const res = await fetch("/api/aset/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.sukses) {
        setPesan({ tipe: "sukses", teks: data.pesan });
        onSelesai?.();
      } else {
        setPesan({ tipe: "error", teks: data.pesan || UI.umum.error });
      }
    } catch {
      setPesan({ tipe: "error", teks: UI.umum.error });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? "border-blue-500 bg-blue-950/30" : "border-gray-700 bg-gray-900 hover:border-gray-500"}
        `}
      >
        <div className="text-4xl mb-3">📁</div>
        <p className="text-gray-300 font-medium">{UI.aset.dropFile}</p>
        <p className="text-sm text-gray-500 mt-2">{UI.aset.formatInfo}</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="text-center text-blue-400">{UI.umum.loading}...</div>
      )}

      {pesan && (
        <div
          className={`
            rounded-lg p-4 text-sm
            ${pesan.tipe === "sukses" ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}
          `}
        >
          {pesan.teks}
        </div>
      )}
    </div>
  );
}
