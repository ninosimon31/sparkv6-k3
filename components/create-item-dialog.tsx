"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ItemType, Item } from "@/lib/types"
import { TagInput } from "@/components/tag-input"
import { FileUploader } from "@/components/file-uploader"
import { LinkPreviewFetcher } from "@/components/link-preview-fetcher"

interface CreateItemDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  itemType: ItemType
  onCreateItem: (item: Item) => void
  folders: string[]
  tags: string[]
}

export function CreateItemDialog({ isOpen, setIsOpen, itemType, onCreateItem, folders, tags }: CreateItemDialogProps) {
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

    onCreateItem(newItem)
    handleClose()
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

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
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
