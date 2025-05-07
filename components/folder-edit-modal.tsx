"use client"

import { useState, useEffect } from "react"
import { X, Folder, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FolderStructure, FolderAction } from "@/lib/types"

interface FolderEditModalProps {
  isOpen: boolean
  onClose: () => void
  action: FolderAction
  folder?: FolderStructure | null
  folderStructure: FolderStructure[]
  onCreateFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, newName: string) => void
  onDeleteFolder: (id: string) => void
  onMoveFolder: (id: string, newParentId: string | null) => void
  onCustomizeFolder: (id: string, color: string, icon: string) => void
}

const FOLDER_COLORS = [
  { value: "default", label: "Default", class: "bg-background border-border" },
  { value: "red", label: "Red", class: "bg-red-500/10 text-red-500 border-red-500/20" },
  { value: "green", label: "Green", class: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "blue", label: "Blue", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "purple", label: "Purple", class: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "pink", label: "Pink", class: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { value: "orange", label: "Orange", class: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
]

const FOLDER_ICONS = [
  { value: "folder", label: "Folder", icon: Folder },
  { value: "folder-plus", label: "Folder Plus", icon: FolderPlus },
  { value: "folder-open", label: "Folder Open", icon: Folder },
  { value: "folder-input", label: "Folder Input", icon: Folder },
  { value: "folder-output", label: "Folder Output", icon: Folder },
  { value: "folder-key", label: "Folder Key", icon: Folder },
  { value: "folder-lock", label: "Folder Lock", icon: Folder },
  { value: "folder-search", label: "Folder Search", icon: Folder },
]

export function FolderEditModal({
  isOpen,
  onClose,
  action,
  folder,
  folderStructure,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFolder,
  onCustomizeFolder,
}: FolderEditModalProps) {
  const [folderName, setFolderName] = useState("")
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState("default")
  const [selectedIcon, setSelectedIcon] = useState("folder")

  useEffect(() => {
    if (isOpen && folder) {
      setFolderName(folder.name)
      setSelectedParentId(folder.parentId)
      setSelectedColor(folder.color || "default")
      setSelectedIcon(folder.icon || "folder")
    } else if (isOpen && action === "create") {
      setFolderName("")
      setSelectedColor("default")
      setSelectedIcon("folder")
    }
  }, [isOpen, folder, action])

  const handleSubmit = () => {
    if (action === "create" && folderName.trim()) {
      onCreateFolder(folderName.trim(), selectedParentId)
    } else if (action === "rename" && folder && folderName.trim()) {
      onRenameFolder(folder.id, folderName.trim())
    } else if (action === "delete" && folder) {
      onDeleteFolder(folder.id)
    } else if (action === "move" && folder) {
      onMoveFolder(folder.id, selectedParentId)
    } else if (action === "customize" && folder) {
      onCustomizeFolder(folder.id, selectedColor, selectedIcon)
    }
    onClose()
  }

  const renderFolderOptions = (folders: FolderStructure[], level = 0) => {
    return folders.map((f) => {
      // Don't allow moving a folder into itself or its descendants
      const isDisabled = folder && (f.id === folder.id || f.path.startsWith(`${folder.path}/`))

      return (
        <div key={f.id}>
          <div className="flex items-center py-1">
            <input
              type="radio"
              id={f.id}
              name="parentFolder"
              value={f.id}
              checked={selectedParentId === f.id}
              onChange={() => setSelectedParentId(f.id)}
              disabled={isDisabled}
              className="mr-2"
            />
            <label htmlFor={f.id} className={`ml-${level * 4} ${isDisabled ? "text-muted-foreground" : ""}`}>
              {f.name}
            </label>
          </div>
          {f.children.length > 0 && renderFolderOptions(f.children, level + 1)}
        </div>
      )
    })
  }

  const getActionTitle = () => {
    switch (action) {
      case "create":
        return "Create Folder"
      case "rename":
        return "Rename Folder"
      case "delete":
        return "Delete Folder"
      case "move":
        return "Move Folder"
      case "customize":
        return "Customize Folder"
      default:
        return "Folder Action"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-md bg-background p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{getActionTitle()}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="space-y-4">
          {(action === "create" || action === "rename") && (
            <div>
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
          )}

          {(action === "create" || action === "move") && (
            <div>
              <Label>Parent Folder</Label>
              <div className="mt-2 border rounded-md p-2 max-h-60 overflow-y-auto">
                <div className="flex items-center py-1">
                  <input
                    type="radio"
                    id="root"
                    name="parentFolder"
                    value="root"
                    checked={selectedParentId === null}
                    onChange={() => setSelectedParentId(null)}
                    className="mr-2"
                  />
                  <label htmlFor="root">Root (No parent)</label>
                </div>
                {renderFolderOptions(folderStructure)}
              </div>
            </div>
          )}

          {action === "delete" && (
            <div className="text-center py-4">
              <p className="mb-4">Are you sure you want to delete the folder "{folder?.name}"?</p>
              <p className="text-destructive mb-4">This will also delete all subfolders and notes inside it.</p>
            </div>
          )}

          {action === "customize" && (
            <Tabs defaultValue="color">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="icon">Icon</TabsTrigger>
              </TabsList>
              <TabsContent value="color" className="mt-4">
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="grid grid-cols-4 gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <div key={color.value} className="text-center">
                      <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
                      <Label
                        htmlFor={`color-${color.value}`}
                        className={`flex flex-col items-center space-y-2 rounded-md border-2 p-2 hover:border-primary ${
                          selectedColor === color.value ? "border-primary" : "border-muted"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-full border ${color.class}`} />
                        <span className="text-xs">{color.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </TabsContent>
              <TabsContent value="icon" className="mt-4">
                <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="grid grid-cols-4 gap-2">
                  {FOLDER_ICONS.map((icon) => {
                    const IconComponent = icon.icon
                    return (
                      <div key={icon.value} className="text-center">
                        <RadioGroupItem value={icon.value} id={`icon-${icon.value}`} className="sr-only" />
                        <Label
                          htmlFor={`icon-${icon.value}`}
                          className={`flex flex-col items-center space-y-2 rounded-md border-2 p-2 hover:border-primary ${
                            selectedIcon === icon.value ? "border-primary" : "border-muted"
                          }`}
                        >
                          <IconComponent className="h-8 w-8" />
                          <span className="text-xs">{icon.label}</span>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant={action === "delete" ? "destructive" : "default"}
              disabled={(action === "create" || action === "rename") && !folderName.trim()}
            >
              {action === "create"
                ? "Create"
                : action === "rename"
                  ? "Rename"
                  : action === "delete"
                    ? "Delete"
                    : action === "move"
                      ? "Move"
                      : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
