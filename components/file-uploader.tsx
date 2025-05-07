"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ItemType } from "@/lib/types"

interface FileUploaderProps {
  type: ItemType
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export function FileUploader({ type, onFileSelected, disabled = false }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    onFileSelected(file)

    // Create preview for images
    if (type === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const acceptedTypes = type === "image" ? "image/*" : ".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.pptx"

  return (
    <div className="grid gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedTypes}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"
          } transition-colors`}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-2">
            {type === "image" ? (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            ) : (
              <File className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="flex flex-col gap-1">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                {type === "image" ? "SVG, PNG, JPG or GIF (max. 5MB)" : "PDF, DOC, TXT, CSV or other files (max. 10MB)"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          {preview ? (
            <div className="relative aspect-video overflow-hidden rounded-md">
              <img src={preview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClick} disabled={disabled}>
              <Upload className="h-4 w-4 mr-2" />
              Change file
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
