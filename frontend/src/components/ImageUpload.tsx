"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  label: string;
  maxSizeMB?: number;
  aspectRatio?: "square" | "rectangle";
}

export default function ImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  label,
  maxSizeMB = 5,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("صرف تصويرون اپ لوڊ ڪري سگهجن ٿيون");
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`فائل جي سائيز ${maxSizeMB}MB کان وڌيڪ نه هجڻ گهرجي`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      await onUpload(file);
    } catch (err: any) {
      setError(err.message || "اپ لوڊ ڪرڻ ۾ مسئلو آيو");
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setUploading(true);
    setError(null);

    try {
      await onDelete();
      setPreview(null);
    } catch (err: any) {
      setError(err.message || "ڊليٽ ڪرڻ ۾ مسئلو آيو");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-700">
        {label}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <div
            className={`relative overflow-hidden rounded-lg border-2 border-gray-300 ${
              aspectRatio === "square" ? "w-40 h-40" : "w-60 h-40"
            }`}
          >
            <Image
              src={preview}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={uploading}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div>
        <label
          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {uploading ? "اپ لوڊ ٿي رهيو آهي..." : preview ? "تصوير تبديل ڪريو" : "تصوير چونڊيو"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-sm text-gray-500">
          PNG، JPG يا WebP (وڌ ۾ وڌ {maxSizeMB}MB)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
