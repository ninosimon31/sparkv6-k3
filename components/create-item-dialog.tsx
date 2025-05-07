"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ItemType, Item, FolderStructure } from "@/lib/types"
import { TagInput } from "@/components/tag-input"
import { FileUploader } from "@/components/file-uploader"
import { LinkPreviewFetcher } from "@/components/link-preview-fetcher"

interface CreateItemDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  itemType: ItemType
  onCreateItem: (item: Item) => void
  folderStructure: FolderStructure[]
  tags: string[]
}

export function CreateItemDialog({
  isOpen,
  setIsOpen,
  itemType,
  onCreateItem,
  folderStructure,
  tags,
}: CreateItemDialogProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [url, setUrl] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<{
    title?: string
    description?: string
    image?: string
  }>({})

  // Reset form when dialog opens with a new item type
  useEffect(() => {
    if (isOpen) {
      setTitle("")
      setContent("")
      setUrl("")
      setSelectedFolder(null)
      setSelectedTags([])
      setFile(null)
      setPreviewData({})
    }
  }, [isOpen, itemType])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setUrl("")
    setSelectedFolder(null)
    setSelectedTags([])
    setFile(null)
    setPreviewData({})
  }

  const handleClose = () => {
    resetForm()
    setIsOpen(false)
  }

  const handleSubmit = () => {
    try {
      // Generate a unique ID
      const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create the new item
      const newItem: Item = {
        id,
        type: itemType,
        title: title || (itemType === "link" ? previewData.title : file?.name) || "Untitled",
        content: content,
        createdAt: new Date().toISOString(),
        tags: selectedTags,
        folder: selectedFolder,
      }

      // Add type-specific properties
      if (itemType === "link") {
        newItem.url = url
        newItem.previewImage = previewData.image
        newItem.previewDescription = previewData.description
      } else if (itemType === "image" || itemType === "file") {
        // In a real app, we would upload the file and get a URL
        // For this demo, we'll create an object URL
        if (file) {
          newItem.url = URL.createObjectURL(file)
          newItem.fileName = file.name
          newItem.fileSize = file.size
          newItem.fileType = file.type
        }
      }

      // Close the dialog
      handleClose()

      // Add the item
      onCreateItem(newItem)
    } catch (error) {
      console.error("Error creating item:", error)
      // Force a refresh if there was an error
      window.location.reload()
    }
  }

  const getDialogTitle = () => {
    switch (itemType) {
      case "note":
        return "Create Note"
      case "link":
        return "Add Link"
      case "image":
        return "Upload Image"
      case "file":
        return "Upload File"
      default:
        return "Create Item"
    }
  }

  // Get all folder paths for the dropdown
  const getAllFolderPaths = () => {
    const paths: string[] = []

    const traverseFolders = (folders: FolderStructure[], parentPath = "") => {
      folders.forEach((folder) => {
        const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name
        paths.push(currentPath)
        if (folder.children.length > 0) {
          traverseFolders(folder.children, currentPath)
        }
      })
    }

    traverseFolders(folderStructure)
    return paths
  }

  const folderPaths = getAllFolderPaths()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={handleClose}></div>
      <div className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{getDialogTitle()}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          {itemType === "link" ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {url && <LinkPreviewFetcher url={url} onPreviewData={setPreviewData} />}

              <div className="grid gap-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={previewData.title || "Title"}
                />
              </div>
            </>
          ) : itemType === "image" || itemType === "file" ? (
            <>
              <FileUploader type={itemType} onFileSelected={setFile} />

              <div className="grid gap-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={file?.name || "Title"}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
          )}

          {(itemType === "note" || itemType === "link") && (
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={5}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="folder">Folder (Optional)</Label>
            <Select
              value={selectedFolder || "none"}
              onValueChange={(value) => setSelectedFolder(value === "none" ? null : value)}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {folderPaths.map((path) => (
                  <SelectItem key={path} value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagInput tags={selectedTags} setTags={setSelectedTags} availableTags={tags} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="button">
            Create
          </Button>
        </div>
      </div>
    </div>
  )
}
