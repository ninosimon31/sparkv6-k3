"use client"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ViewType, ItemType } from "@/lib/types"

interface SidebarProps {
  selectedView: ViewType
  setSelectedView: (view: ViewType) => void
  selectedFolder: string | null
  setSelectedFolder: (folder: string | null) => void
  selectedTag: string | null
  setSelectedTag: (tag: string | null) => void
  folders: string[]
  tags: string[]
  onCreateItem: (type: ItemType) => void
  setSearchQuery: (query: string) => void
  onOpenSearch: () => void
}

export function Sidebar({
  selectedView,
  setSelectedView,
  selectedFolder,
  setSelectedFolder,
  selectedTag,
  setSelectedTag,
  folders,
  tags,
  onCreateItem,
  setSearchQuery,
  onOpenSearch,
}: SidebarProps) {
  const [isFoldersExpanded, setIsFoldersExpanded] = useState(true)
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)

  const handleViewSelect = (view: ViewType) => {
    setSelectedView(view)
    setSelectedFolder(null)
    setSelectedTag(null)
  }

  const handleFolderSelect = (folder: string) => {
    setSelectedFolder(folder)
    setSelectedView("all")
    setSelectedTag(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setSelectedView("all")
    setSelectedFolder(null)
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
            <button
              className="flex items-center w-full text-sm font-medium p-2 hover:bg-muted rounded-md"
              onClick={() => setIsFoldersExpanded(!isFoldersExpanded)}
            >
              {isFoldersExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Folder className="h-4 w-4 mr-2" />
              <span>Folders</span>
            </button>

            {isFoldersExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {folders.map((folder) => (
                  <Button
                    key={folder}
                    variant={selectedFolder === folder ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-8"
                    onClick={() => handleFolderSelect(folder)}
                  >
                    {folder}
                  </Button>
                ))}
                {folders.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">No folders yet</p>}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              className="flex items-center w-full text-sm font-medium p-2 hover:bg-muted rounded-md"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
            >
              {isTagsExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Tag className="h-4 w-4 mr-2" />
              <span>Tags</span>
            </button>

            {isTagsExpanded && (
              <div className="ml-6 mt-1 space-y-1">
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
                {tags.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">No tags yet</p>}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
