"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  MoreHorizontal,
  FolderPlus,
  Trash2,
  Edit,
  Move,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { FolderStructure, Item, FolderAction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FolderTreeProps {
  folders: FolderStructure[]
  selectedFolder: string | null
  onSelectFolder: (folderPath: string) => void
  onFolderAction: (action: FolderAction, folder: FolderStructure | null) => void
  getItemsByFolder: (folderPath: string) => Item[]
  isEditMode: boolean
}

export function FolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
  onFolderAction,
  getItemsByFolder,
  isEditMode,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const getFolderColorClass = (folder: FolderStructure) => {
    switch (folder.color) {
      case "red":
        return "text-red-500"
      case "green":
        return "text-green-500"
      case "blue":
        return "text-blue-500"
      case "yellow":
        return "text-yellow-500"
      case "purple":
        return "text-purple-500"
      case "pink":
        return "text-pink-500"
      case "orange":
        return "text-orange-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getFolderIcon = (folder: FolderStructure) => {
    // In a real app, you would have more icons to choose from
    return <Folder className={`h-4 w-4 mr-2 ${getFolderColorClass(folder)}`} />
  }

  const renderFolderItems = (folderPath: string) => {
    const items = getItemsByFolder(folderPath)

    return items.map((item) => (
      <div
        key={item.id}
        className={`flex items-center pl-8 py-1 text-sm hover:bg-muted/50 cursor-pointer group ${
          isEditMode ? "pr-2" : ""
        }`}
        onClick={(e) => {
          if (!isEditMode) {
            e.stopPropagation()
            // Handle item click - could navigate to item detail
          }
        }}
      >
        <File className={`h-4 w-4 mr-2 ${item.color ? `text-${item.color}-500` : "text-muted-foreground"}`} />
        <span className="truncate">{item.title || "Untitled"}</span>

        {isEditMode && (
          <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Move className="h-4 w-4 mr-2" />
                  Move
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Palette className="h-4 w-4 mr-2" />
                  Customize
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    ))
  }

  const renderFolder = (folder: FolderStructure, level = 0) => {
    const isExpanded = expandedFolders[folder.id]
    const isSelected = selectedFolder === folder.path
    const hasItems = getItemsByFolder(folder.path).length > 0

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center py-1 hover:bg-muted/50 cursor-pointer group",
            isSelected ? "bg-muted" : "",
            level === 0 ? "pl-2" : `pl-${level * 4}`,
          )}
          onClick={() => !isEditMode && onSelectFolder(folder.path)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 mr-1"
            onClick={(e) => {
              e.stopPropagation()
              toggleFolder(folder.id)
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {getFolderIcon(folder)}
          <span className="flex-1 truncate">{folder.name}</span>

          {isEditMode && (
            <div className="ml-auto flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderAction("create", folder)
                    }}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add Subfolder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderAction("rename", folder)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderAction("move", folder)
                    }}
                  >
                    <Move className="h-4 w-4 mr-2" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderAction("customize", folder)
                    }}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Customize
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onFolderAction("delete", folder)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="ml-4">
            {/* Render items in this folder */}
            {hasItems && renderFolderItems(folder.path)}

            {/* Render subfolders */}
            {folder.children.map((childFolder) => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => renderFolder(folder))}

      {/* Add root folder button in edit mode */}
      {isEditMode && folders.length === 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => onFolderAction("create", null)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Folder
        </Button>
      )}
    </div>
  )
}
