"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
  maxImages?: number;
}

interface CloudinarySignature {
  configured: boolean;
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

/** Convert a File to a base64 data URL (used as the graceful fallback). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single file to Cloudinary using a signed request.
 * Returns the secure_url of the uploaded asset.
 */
async function uploadToCloudinary(
  file: File,
  sig: CloudinarySignature
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }
  return data.secure_url as string;
}

export function ImageUpload({ onChange, value = [], maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      setIsUploading(true);

      try {
        // Fetch a Cloudinary signature once for this batch. If Cloudinary is
        // not configured (non-2xx / configured:false), we fall back to storing
        // base64 data URLs so the flow still works in local/dev environments.
        let sig: CloudinarySignature | null = null;
        try {
          const sigRes = await fetch("/api/cloudinary/signature");
          if (sigRes.ok) {
            const sigData = (await sigRes.json()) as Partial<CloudinarySignature>;
            if (sigData.configured && sigData.signature && sigData.cloudName) {
              sig = sigData as CloudinarySignature;
            }
          }
        } catch (sigError) {
          // TODO: Cloudinary not reachable/configured — falling back to data URLs.
          console.warn("Cloudinary signature unavailable, using data URLs:", sigError);
        }

        const newImages: string[] = [];

        // Process each file
        for (const file of files) {
          // Check file type
          if (!file.type.startsWith('image/')) {
            console.error('Invalid file type:', file.type);
            continue;
          }

          // Check file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            console.error('File too large:', file.size);
            continue;
          }

          let url: string;
          if (sig) {
            try {
              url = await uploadToCloudinary(file, sig);
            } catch (uploadError) {
              // TODO: Cloudinary upload failed — falling back to a data URL so
              // the user does not lose their selection.
              console.error("Cloudinary upload failed, using data URL:", uploadError);
              url = await fileToDataUrl(file);
            }
          } else {
            // TODO: Replace data-URL fallback once Cloudinary env vars are set
            // (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY/SECRET).
            url = await fileToDataUrl(file);
          }

          newImages.push(url);

          // Stop if we've reached the max images
          if (value.length + newImages.length >= maxImages) break;
        }

        // Update the images
        if (newImages.length > 0) {
          onChange([...value, ...newImages]);
        }
      } catch (error) {
        console.error('Error processing images:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, value, maxImages]
  );
  
  // Handle remove image
  const handleRemove = useCallback(
    (url: string) => {
      onChange(value.filter((current) => current !== url));
    },
    [onChange, value]
  );
  
  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/jpg': []
    },
    maxFiles: maxImages - value.length,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: handleFileSelect,
    disabled: isUploading || value.length >= maxImages
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-32 w-32 overflow-hidden rounded-md"
          >
            <Image
              fill
              className="object-cover"
              alt="Workspace image"
              src={url}
            />
            <button
              onClick={() => handleRemove(url)}
              className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white shadow-sm transition hover:bg-rose-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {value.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : isUploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Uploading images...</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">Drag & drop images here, or click to select files</p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, WEBP. Max size: 5MB.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
