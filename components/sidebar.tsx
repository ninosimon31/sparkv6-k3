"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Home,
  FileText,
  LinkIcon,
  ImageIcon,
  File as FileIcon,
  Folder as FolderIcon,
  Tag as TagIcon,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  TagIcon as TagPlusIcon,
  Edit,
  ChevronLeft,
  Settings2,
  LayoutGrid,
  CheckSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { FolderTree } from "@/components/folder-tree"
import { FolderEditModal } from "@/components/folder-edit-modal"
import { SettingsModal } from "@/components/settings-modal"
import type { ViewType, ItemType, FolderStructure, Item, FolderAction } from "@/lib/types"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface SidebarProps {
  // selectedView: ViewType // Potentially remove if not used with new design
  // setSelectedView: (view: ViewType) => void // Potentially remove
  selectedFolder: string | null
  setSelectedFolder: (folder: string | null) => void
  selectedTag: string | null
  setSelectedTag: (tag: string | null) => void
  folderStructure: FolderStructure[]
  tags: string[]
  items: Item[]
  isLoading: boolean
  onCreateItem: (type: ItemType) => void
  onOpenSearch: () => void
  onAddFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, newName: string) => void
  onMoveFolder: (folderId: string, newParentId: string | null) => void
  onDeleteFolder: (id: string) => void
  onCustomizeFolder: (id: string, color: string, icon: string) => void
  onAddTag: (tagName: string) => void
  getItemsByFolder: (folderPath: string) => Item[]
  findFolderById: (id: string) => FolderStructure | null
  onMoveItem: (itemId: string, newFolderPath: string | null) => void
  onReorderItem: (itemId: string, targetItemId: string | null, folderPath: string, position: "before" | "after") => void
  onSelectItem: (itemId: string | null) => void
}

export function Sidebar({
  // selectedView,
  // setSelectedView,
  selectedFolder,
  setSelectedFolder,
  selectedTag,
  setSelectedTag,
  folderStructure,
  tags,
  items,
  isLoading,
  onCreateItem,
  onOpenSearch,
  onAddFolder,
  onRenameFolder,
  onMoveFolder,
  onDeleteFolder,
  onCustomizeFolder,
  onAddTag,
  getItemsByFolder,
  findFolderById,
  onMoveItem,
  onReorderItem,
  onSelectItem,
}: SidebarProps) {
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true)
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)
  const [newTagName, setNewTagName] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<FolderStructure | null>(null)
  const [currentAction, setCurrentAction] = useState<FolderAction | null>(null)
  const [rootItems, setRootItems] = useState<Item[]>([])
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath)
    setSelectedTag(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setSelectedFolder(null)
  }

  const handleAddTagInput = () => {
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

  const handleFolderAction = (action: FolderAction, folder?: FolderStructure | null) => {
    setCurrentFolder(folder === undefined ? null : folder)
    setCurrentAction(action)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setCurrentFolder(null)
  }

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen)
  }

  useEffect(() => {
    if (Array.isArray(items)) {
      setRootItems(items.filter(item => item.folder === null));
    } else {
      setRootItems([]);
    }
  }, [items]);

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-72"

  if (isSidebarCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div
          className={cn(
            "flex flex-col items-center justify-between h-full py-4 bg-background border-r border-border",
            sidebarWidth
          )}
        >
          <div className="flex flex-col items-center gap-3 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-10 p-0 rounded-lg"
                  onClick={() => setIsSidebarCollapsed(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand Sidebar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-10 p-0 rounded-lg"
                  onClick={onOpenSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start">
                    <DropdownMenuItem onClick={() => { onCreateItem("note"); setIsSidebarCollapsed(false); }}>
                      <FileText className="mr-2 h-4 w-4" /> New Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { onCreateItem("link"); setIsSidebarCollapsed(false); }}>
                      <LinkIcon className="mr-2 h-4 w-4" /> New Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="right">New Item</TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg">
                <Settings2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-background border-r border-border transition-all duration-200",
          sidebarWidth
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">Spark</h1>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>New Item</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCreateItem("note")}>
                  <FileText className="mr-2 h-4 w-4" /> New Note
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateItem("link")}>
                  <LinkIcon className="mr-2 h-4 w-4" /> New Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateItem("image")}>
                  <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateItem("file")}>
                  <FileIcon className="mr-2 h-4 w-4" /> Upload File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse Sidebar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
                >
                  {isFoldersExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  Home
                </button>
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleFolderAction("create", null)}
                        >
                            <FolderPlus className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Root Folder</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {isFoldersExpanded && (
                <FolderTree
                  folders={folderStructure}
                  selectedFolder={selectedFolder}
                  onSelectFolder={handleFolderSelect}
                  onFolderAction={handleFolderAction}
                  getItemsByFolder={getItemsByFolder}
                  onMoveItem={onMoveItem}
                  onReorderItem={onReorderItem}
                  onMoveFolder={onMoveFolder}
                  onSelectItem={onSelectItem}
                  rootItems={rootItems}
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                >
                  {isTagsExpanded ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  Tags
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAddTagInput}>
                      <TagPlusIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New Tag</TooltipContent>
                </Tooltip>
              </div>
              {isTagsExpanded && (
                <div className="pl-4 pr-2 space-y-0.5">
                  {isAddingTag && (
                    <form onSubmit={handleTagNameSubmit} className="mb-1">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag..."
                        className="w-full h-7 px-2 text-sm border border-input rounded-md bg-transparent focus:ring-1 focus:ring-ring focus:outline-none"
                        autoFocus
                        onBlur={() => {
                          if (!newTagName.trim()) setIsAddingTag(false)
                        }}
                      />
                    </form>
                  )}
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start h-7 text-sm truncate"
                        onClick={() => handleTagSelect(tag)}
                      >
                        <TagIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {tag}
                      </Button>
                    ))
                  ) : (
                    !isAddingTag && <p className="text-xs text-muted-foreground px-2 py-1">No tags yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-full justify-start" onClick={toggleSettingsModal}>
                <Settings2 className="h-4 w-4 mr-2" /> Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>

        {currentAction && (
          <FolderEditModal
            isOpen={isEditModalOpen}
            onClose={handleEditModalClose}
            action={currentAction}
            folder={currentFolder}
            folderStructure={folderStructure}
            onCreateFolder={onAddFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveFolder={(folderId, newParentId) => {
              console.log("Move folder action in modal:", folderId, newParentId)
            }}
            onCustomizeFolder={onCustomizeFolder}
          />
        )}

        <SettingsModal 
          isOpen={isSettingsModalOpen} 
          onClose={toggleSettingsModal} 
        />
      </div>
    </TooltipProvider>
  )
}
