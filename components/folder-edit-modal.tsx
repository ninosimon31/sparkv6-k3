"use client"

import { useState, useEffect } from "react"
import { X, Folder, FolderPlus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { FolderStructure, FolderAction } from "@/lib/types"
import { cn } from "@/lib/utils"
import type React from 'react'

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

export const FOLDER_ICONS = [
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
  const [modalExpandedFolders, setModalExpandedFolders] = useState<Record<string, boolean>>({})

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

  const toggleModalFolderExpansion = (folderId: string) => {
    setModalExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const renderFolderOptions = (foldersToRender: FolderStructure[], level = 0): React.ReactNode[] => {
    return foldersToRender.flatMap((f) => {
      const isMoveDisabled = !!(action === "move" && folder && (f.id === folder.id || f.path.startsWith(`${folder.path}/`)));
      const isSelectedAsParent = selectedParentId === f.id;
      const IconComponent = FOLDER_ICONS.find(icon => icon.value === f.icon)?.icon || Folder;
      const isExpandedInModal = modalExpandedFolders[f.id];
      const hasChildren = f.children.length > 0;

      return [
        <div key={f.id} className={cn("flex items-center w-full", level > 0 && `ml-${level * 4}`)}>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 p-1 mr-1"
              onClick={(e) => { e.stopPropagation(); toggleModalFolderExpansion(f.id); }}
            >
              {isExpandedInModal ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <div className="w-8 h-8 flex-shrink-0 mr-1" /> // Placeholder for alignment
          )}
          <Button
            variant={isSelectedAsParent ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex-grow justify-start h-8 text-left truncate",
              isMoveDisabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isMoveDisabled && setSelectedParentId(f.id)}
            disabled={isMoveDisabled}
            title={f.name}
          >
            <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{f.name}</span>
          </Button>
        </div>,
        // Recursively render children if they exist AND this folder is expanded in the modal
        ...(hasChildren && isExpandedInModal ? renderFolderOptions(f.children, level + 1) : []),
      ];
    });
  };

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
              <div className="mt-2 border rounded-md p-2 max-h-60 overflow-y-auto space-y-1">
                {/* Root Option */}
                <Button
                  variant={selectedParentId === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start h-8 text-left"
                  onClick={() => setSelectedParentId(null)}
                >
                    <Folder className="h-4 w-4 mr-2 flex-shrink-0" /> 
                    Root (No parent)
                </Button>
                {/* Render the folder tree */}
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
