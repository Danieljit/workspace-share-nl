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

export function ImageUpload({ onChange, value = [], maxImages = 5 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;
      
      setIsUploading(true);
      
      try {
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
          
          // Convert to data URL
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          newImages.push(dataUrl);
          
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
                <p>Processing images...</p>
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
