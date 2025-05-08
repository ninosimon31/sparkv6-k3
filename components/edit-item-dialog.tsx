"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Item } from "@/lib/types"
import { TagInput } from "@/components/tag-input"
import { useItems } from "@/hooks/use-items"

interface EditItemDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  item: Item
  onUpdateItem: (item: Item) => void
}

export function EditItemDialog({ isOpen, setIsOpen, item, onUpdateItem }: EditItemDialogProps) {
  const [title, setTitle] = useState(item.title || "")
  const [content, setContent] = useState(item.content || "")
  const [url, setUrl] = useState(item.url || "")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(item.folder)
  const [selectedTags, setSelectedTags] = useState<string[]>(item.tags || [])

  const { folders, tags } = useItems()

  useEffect(() => {
    if (isOpen) {
      setTitle(item.title || "")
      setContent(item.content || "")
      setUrl(item.url || "")
      setSelectedFolder(item.folder)
      setSelectedTags(item.tags || [])
    }
  }, [isOpen, item])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = () => {
    const updatedItem: Item = {
      ...item,
      title,
      content,
      url,
      folder: selectedFolder,
      tags: selectedTags,
      updatedAt: new Date().toISOString(),
    }

    onUpdateItem(updatedItem)
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit {item.type}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          </div>

          {item.type === "link" && (
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          )}

          {(item.type === "note" || item.type === "link") && (
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
            <Label htmlFor="folder">Folder</Label>
            <Select value={selectedFolder || ""} onValueChange={setSelectedFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(folders || []).map((folder) => (
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
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
