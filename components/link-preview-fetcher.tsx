"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface LinkPreviewFetcherProps {
  url: string
  onPreviewData: (data: { title?: string; description?: string; image?: string }) => void
}

export function LinkPreviewFetcher({ url, onPreviewData }: LinkPreviewFetcherProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    title?: string
    description?: string
    image?: string
  }>({})

  useEffect(() => {
    if (!url) return

    const fetchPreview = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, we would call an API to fetch the preview
        // For this demo, we'll simulate a response
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate preview data
        const previewData = {
          title: `Title for ${url}`,
          description: `Description for ${url}`,
          image: "/placeholder.svg?height=200&width=400",
        }

        setPreview(previewData)
        onPreviewData(previewData)
      } catch (err) {
        setError("Failed to fetch preview")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreview()
  }, [url, onPreviewData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-md">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Fetching preview...</span>
      </div>
    )
  }

  if (error) {
    return <div className="p-4 border rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
  }

  if (preview.title || preview.description || preview.image) {
    return (
      <div className="border rounded-md overflow-hidden">
        {preview.image && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={preview.image || "/placeholder.svg"}
              alt={preview.title || "Link preview"}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="p-4">
          {preview.title && <h3 className="font-medium">{preview.title}</h3>}
          {preview.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{preview.description}</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
