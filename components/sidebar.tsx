"use client"

import type React from "react"

import { useState } from "react"
import {
  Home,
  FileText,
  LinkIcon,
  ImageIcon,
  File,
  Folder,
  Tag,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  TagIcon as TagPlus,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { FolderTree } from "@/components/folder-tree"
import { FolderEditModal } from "@/components/folder-edit-modal"
import type { ViewType, ItemType, FolderStructure, Item, FolderAction } from "@/lib/types"

interface SidebarProps {
  selectedView: ViewType
  setSelectedView: (view: ViewType) => void
  selectedFolder: string | null
  setSelectedFolder: (folder: string | null) => void
  selectedTag: string | null
  setSelectedTag: (tag: string | null) => void
  folderStructure: FolderStructure[]
  tags: string[]
  onCreateItem: (type: ItemType) => void
  setSearchQuery: (query: string) => void
  onOpenSearch: () => void
  onAddFolder: (folderPath: string, parentId: string | null) => void
  onRenameFolder: (id: string, newName: string) => void
  onMoveFolder: (id: string, newParentId: string | null) => void
  onDeleteFolder: (id: string) => void
  onCustomizeFolder: (id: string, color: string, icon: string) => void
  onAddTag: (tagName: string) => void
  getItemsByFolder: (folderPath: string) => Item[]
  findFolderById: (id: string) => FolderStructure | null
}

export function Sidebar({
  selectedView,
  setSelectedView,
  selectedFolder,
  setSelectedFolder,
  selectedTag,
  setSelectedTag,
  folderStructure,
  tags,
  onCreateItem,
  setSearchQuery,
  onOpenSearch,
  onAddFolder,
  onRenameFolder,
  onMoveFolder,
  onDeleteFolder,
  onCustomizeFolder,
  onAddTag,
  getItemsByFolder,
  findFolderById,
}: SidebarProps) {
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true)
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)
  const [newTagName, setNewTagName] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Folder edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState<FolderAction>("create")
  const [currentFolder, setCurrentFolder] = useState<FolderStructure | null>(null)

  const handleViewSelect = (view: ViewType) => {
    setSelectedView(view)
    setSelectedFolder(null)
    setSelectedTag(null)
  }

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath)
    setSelectedView("all")
    setSelectedTag(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setSelectedView("all")
    setSelectedFolder(null)
  }

  const handleAddTag = () => {
    setIsAddingTag(true)
  }

  const handleTagNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTagName.trim()) {
      onAddTag(newTagName.trim())
      setNewTagName("")
      setIsAddingTag(false)
    }
  }

  const handleFolderAction = (action: FolderAction, folder: FolderStructure | null) => {
    setCurrentAction(action)
    setCurrentFolder(folder)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setCurrentFolder(null)
  }

  return (
    <div className="w-64 border-r border-border bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="font-semibold text-xl">Spark</h1>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={onOpenSearch}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Create new item</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateItem("note")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>New Note</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateItem("link")}>
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Add Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateItem("image")}>
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Upload Image</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateItem("file")}>
                <File className="mr-2 h-4 w-4" />
                <span>Upload File</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <nav className="space-y-1">
            <Button
              variant={selectedView === "all" && !selectedFolder && !selectedTag ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewSelect("all")}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </Button>
            <Button
              variant={selectedView === "notes" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewSelect("notes")}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Notes</span>
            </Button>
            <Button
              variant={selectedView === "links" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewSelect("links")}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>Links</span>
            </Button>
            <Button
              variant={selectedView === "images" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewSelect("images")}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Images</span>
            </Button>
            <Button
              variant={selectedView === "files" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleViewSelect("files")}
            >
              <File className="mr-2 h-4 w-4" />
              <span>Files</span>
            </Button>
          </nav>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-1">
              <button
                className="flex items-center text-sm font-medium p-2 hover:bg-muted rounded-md"
                onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
              >
                {isFoldersExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                <Folder className="h-4 w-4 mr-2" />
                <span>Folders</span>
              </button>
              <div className="flex items-center">
                <Button
                  variant={isEditMode ? "secondary" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">{isEditMode ? "Exit Edit Mode" : "Edit Folders"}</span>
                </Button>
                {isEditMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleFolderAction("create", null)}
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">Add folder</span>
                  </Button>
                )}
              </div>
            </div>

            {isFoldersExpanded && (
              <div className="ml-2 mt-1">
                <FolderTree
                  folders={folderStructure}
                  selectedFolder={selectedFolder}
                  onSelectFolder={handleFolderSelect}
                  onFolderAction={handleFolderAction}
                  getItemsByFolder={getItemsByFolder}
                  isEditMode={isEditMode}
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <button
                className="flex items-center text-sm font-medium p-2 hover:bg-muted rounded-md"
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              >
                {isTagsExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                <Tag className="h-4 w-4 mr-2" />
                <span>Tags</span>
              </button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddTag}>
                <TagPlus className="h-4 w-4" />
                <span className="sr-only">Add tag</span>
              </Button>
            </div>

            {isTagsExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {isAddingTag && (
                  <form onSubmit={handleTagNameSubmit} className="flex items-center mb-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Tag name"
                      className="h-7 text-sm"
                      autoFocus
                      onBlur={() => {
                        if (!newTagName.trim()) {
                          setIsAddingTag(false)
                        }
                      }}
                    />
                  </form>
                )}
                {tags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-8"
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Button>
                ))}
                {tags.length === 0 && !isAddingTag && (
                  <p className="text-xs text-muted-foreground px-2 py-1">No tags yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <FolderEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        action={currentAction}
        folder={currentFolder}
        folderStructure={folderStructure}
        onCreateFolder={onAddFolder}
        onRenameFolder={onRenameFolder}
        onDeleteFolder={onDeleteFolder}
        onMoveFolder={onMoveFolder}
        onCustomizeFolder={onCustomizeFolder}
      />
    </div>
  )
}
