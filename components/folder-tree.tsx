"use client"

import { useState, useRef } from "react"
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
  FileText,
  PenLine,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import type { FolderStructure, Item, FolderAction } from "@/lib/types"
import { cn } from "@/lib/utils"
import { FOLDER_ICONS } from "./folder-edit-modal"

interface FolderTreeProps {
  folders: FolderStructure[]
  selectedFolder: string | null
  onSelectFolder: (folderPath: string) => void
  onFolderAction: (action: FolderAction, folder: FolderStructure | null, data?: { name?: string; parentId?: string | null; color?: string; icon?: string }) => void
  getItemsByFolder: (folderPath: string) => Item[]
  onMoveItem: (itemId: string, newFolderPath: string | null) => void
  onReorderItem: (itemId: string, targetItemId: string | null, folderPath: string, position: "before" | "after") => void
  onMoveFolder: (folderId: string, newParentId: string | null) => void
  onSelectItem: (itemId: string | null) => void
  rootItems?: Item[]
}

export function FolderTree({
  folders,
  selectedFolder,
  onSelectFolder,
  onFolderAction,
  getItemsByFolder,
  onMoveItem,
  onReorderItem,
  onMoveFolder,
  onSelectItem,
  rootItems,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dropTargetItemIndicator, setDropTargetItemIndicator] = useState<string | null>(null);
  const [dropTargetFolderIndicator, setDropTargetFolderIndicator] = useState<string | null>(null);

  const [folderContextMenu, setFolderContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null);
  const [itemContextMenu, setItemContextMenu] = useState<{ itemId: string; x: number; y: number } | null>(null);

  const handleFolderContextMenuOpen = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setItemContextMenu(null);
    setFolderContextMenu({ folderId, x: e.clientX, y: e.clientY });
  };

  const closeFolderContextMenu = () => {
    setFolderContextMenu(null);
  };

  const handleItemContextMenuOpen = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[ContextMenu] Item context menu opening for:", itemId);
    setFolderContextMenu(null); 
    setItemContextMenu({ itemId, x: e.clientX, y: e.clientY }); 
  };

  const closeItemContextMenu = () => {
    setItemContextMenu(null);
  };

  const handleDragStartItem = (e: React.DragEvent<HTMLDivElement>, item: Item) => {
    console.log("[DragStart] Item:", item.id, "Folder:", item.folder);
    e.dataTransfer.setData("type", "item");
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("sourceFolderPath", item.folder || "__ROOT__");
    e.dataTransfer.effectAllowed = "move";
    setDraggingItemId(item.id);
    console.log("[DragStart] draggingItemId set to:", item.id);
  };

  const handleDragStartFolder = (e: React.DragEvent<HTMLDivElement>, folder: FolderStructure) => {
    console.log("[DragStart] Folder:", folder.id, "Path:", folder.path);
    e.dataTransfer.setData("type", "folder");
    e.dataTransfer.setData("folderId", folder.id);
    e.dataTransfer.setData("sourceFolderPath", folder.path || "__ROOT__"); 
    e.dataTransfer.effectAllowed = "move";
    setDraggingItemId(folder.id);
    console.log("[DragStart] draggingItemId set to:", folder.id);
  };

  const handleDragEndItem = () => {
    console.log("[DragEnd] Current draggingItemId:", draggingItemId);
    setDraggingItemId(null);
    setDropTargetItemIndicator(null);
    setDropTargetFolderIndicator(null);
    console.log("[DragEnd] draggingItemId and indicators cleared");
  };

  const handleDragOverFolder = (e: React.DragEvent<HTMLDivElement>, folderId: string | null) => {
    if (!draggingItemId) {
      // console.log("[DragOverFolder] Aborted: no draggingItemId");
      return;
    }
    console.log("[DragOverFolder] Target folderId:", folderId, "Dragging:", draggingItemId);
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // const draggedType = e.dataTransfer.types.includes("folderid") ? "folder" : "item"; // Already checked in setData
    // console.log("[DragOverFolder] Dragged type detected:", draggedType);

    if (folderId) {
        setDropTargetFolderIndicator(folderId);
    } else {
        setDropTargetFolderIndicator(null);
    }
    setDropTargetItemIndicator(null);
  };

  const handleDragLeaveFolder = () => {
    setDropTargetFolderIndicator(null);
  };

  const handleDropOnItem = (e: React.DragEvent<HTMLDivElement>, targetItem: Item) => {
    console.log("[DropOnItem] Target item:", targetItem.id, "Current draggingItemId:", draggingItemId);
    if (!draggingItemId) {
      console.log("[DropOnItem] Aborted: no draggingItemId");
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const draggedItemId = e.dataTransfer.getData("itemId");
    const sourceFolderPath = e.dataTransfer.getData("sourceFolderPath") === "__ROOT__" ? null : e.dataTransfer.getData("sourceFolderPath");
    const type = e.dataTransfer.getData("type");
    console.log("[DropOnItem] Dragged type:", type, "Dragged ID:", draggedItemId, "Source Path:", sourceFolderPath);

    if (type !== "item") {
        console.log("[DropOnItem] Aborted: Not an item being dragged or type not set.");
        return;
    }

    const targetItemFolderPath = targetItem.folder ?? null;

    if (draggedItemId && draggedItemId !== targetItem.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const verticalMidpoint = rect.top + rect.height / 2;
      const position = e.clientY < verticalMidpoint ? "before" : "after";

      if (sourceFolderPath === targetItemFolderPath) {
        console.log(`Reordering item ${draggedItemId} ${position} item ${targetItem.id} in folder ${targetItemFolderPath}`);
        onReorderItem(draggedItemId, targetItem.id, targetItemFolderPath || "__ROOT__", position);
      } else {
        console.log(`Moving item ${draggedItemId} from ${sourceFolderPath} to folder ${targetItemFolderPath} and placing ${position} item ${targetItem.id}`);
        onMoveItem(draggedItemId, targetItemFolderPath);
        setTimeout(() => {
            onReorderItem(draggedItemId, targetItem.id, targetItemFolderPath || "__ROOT__", position);
        }, 0); 
      }
    }
  };

  const handleDropOnFolder = (e: React.DragEvent<HTMLDivElement>, targetFolder: FolderStructure) => {
    console.log("[DropOnFolder] Target folder:", targetFolder.id, "Path:", targetFolder.path, "Current draggingItemId:", draggingItemId);
    if (!draggingItemId) {
      console.log("[DropOnFolder] Aborted: no draggingItemId");
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData(type === "item" ? "itemId" : "folderId");
    const sourceFolderPath = e.dataTransfer.getData("sourceFolderPath") === "__ROOT__" ? null : e.dataTransfer.getData("sourceFolderPath");
    console.log("[DropOnFolder] Dragged type:", type, "Dragged ID:", id, "Source Path:", sourceFolderPath);

    if (!type || !id) {
        console.log("[DropOnFolder] Aborted: type or id not found in dataTransfer.");
        return;
    }

    const targetFolderIdToUse = targetFolder.id === "__ROOT_ID__" ? null : targetFolder.id;
    const targetFolderPathToUse = targetFolder.id === "__ROOT_ID__" ? null : targetFolder.path;

    if (type === "item") {
      // const itemId = e.dataTransfer.getData("itemId"); // already got as id
      if (id && sourceFolderPath !== targetFolderPathToUse) {
        console.log(`[DropOnFolder] Moving item ${id} from ${sourceFolderPath} to ${targetFolderPathToUse}`);
        onMoveItem(id, targetFolderPathToUse);
      }
    } else if (type === "folder") {
      const folderId = e.dataTransfer.getData("folderId");
      const draggedFolderOriginalPath = e.dataTransfer.getData("sourceFolderPath");
      const draggedFolderCurrentParentId = folders.find(f => f.id === folderId)?.parentId ?? null;

      if (folderId === targetFolder.id || (targetFolder.path && draggedFolderOriginalPath && targetFolder.path.startsWith(draggedFolderOriginalPath + '/'))) {
        console.warn("Cannot move a folder into itself or a descendant.");
      } 
      else if (folderId && targetFolderIdToUse === draggedFolderCurrentParentId) { 
         console.warn("Folder is already in this parent folder.");
      }
      else if (folderId) {
          console.log(`Moving folder ${folderId} to parent ${targetFolderIdToUse === null ? 'Root' : targetFolderIdToUse}`);
          onMoveFolder(folderId, targetFolderIdToUse);
      }
    }
  };

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
    const IconComponent = FOLDER_ICONS.find((i: { value: string }) => i.value === folder.icon)?.icon || Folder;
    const colorClass = getFolderColorClass(folder);
    const hasItems = getItemsByFolder(folder.path).length > 0;
    const itemIndicatorClass = hasItems ? "opacity-75" : "opacity-100";
    return <IconComponent className={cn(`h-4 w-4 mr-2 ${colorClass}`, itemIndicatorClass)} />;
  }

  const renderInteractiveItem = (item: Item, isRootItem: boolean, indentLevel: number = 0) => {
    const itemStyle = isRootItem 
        ? { paddingLeft: `0.5rem`, paddingRight: `0.5rem` } 
        : { paddingLeft: `${(indentLevel * 1.25) + 2}rem`, paddingRight: `0.5rem` }; 

    return (
      <div
        key={item.id}
        className={cn(
          "flex items-center h-7 text-sm hover:bg-muted/50 group relative rounded-md cursor-grab",
          draggingItemId === item.id && "opacity-50",
          dropTargetItemIndicator === item.id + "_before" && "border-t-2 border-primary rounded-none",
          dropTargetItemIndicator === item.id + "_after" && "border-b-2 border-primary rounded-none"
        )}
        style={itemStyle}
        onClick={(e) => {
          e.stopPropagation();
          onSelectItem(item.id);
        }}
        draggable={true}
        onDragStart={(e) => handleDragStartItem(e, item)}
        onDragEnd={handleDragEndItem}
        onDragOver={(e) => {
          if (!draggingItemId || draggingItemId === item.id) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          const rect = e.currentTarget.getBoundingClientRect();
          const verticalMidpoint = rect.top + rect.height / 2;
          if (e.clientY < verticalMidpoint) {
            setDropTargetItemIndicator(item.id + "_before");
          } else {
            setDropTargetItemIndicator(item.id + "_after");
          }
          setDropTargetFolderIndicator(null);
        }}
        onDragLeave={() => setDropTargetItemIndicator(null)}
        onDrop={(e) => handleDropOnItem(e, item)}
      >
        <File className={`h-4 w-4 mr-2 flex-shrink-0 ${item.color ? `text-${item.color}-500` : "text-muted-foreground"}`} />
        <span className="truncate flex-1">{item.title || "Untitled"}</span>

        <DropdownMenu
          open={itemContextMenu?.itemId === item.id}
          onOpenChange={(isOpen) => {
            if (!isOpen) closeItemContextMenu();
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleItemContextMenuOpen(e, item.id);
              }}
              onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleItemContextMenuOpen(e, item.id);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
              className="w-48" 
              onClick={(e) => e.stopPropagation()} 
              onContextMenu={(e) => e.stopPropagation()}
              onCloseAutoFocus={(e) => e.preventDefault()}
          >
              <DropdownMenuItem onClick={() => { console.log("Rename item:", item.title); closeItemContextMenu(); }}>
                  <PenLine className="mr-2 h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { console.log("Delete item:", item.title); closeItemContextMenu(); }} className="text-red-600 hover:!text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderFolder = (folder: FolderStructure, level = 0) => {
    const isExpanded = expandedFolders[folder.id] ?? false
    const folderItems = getItemsByFolder(folder.path)

    return (
      <div key={folder.id} className="space-y-0.5">
        <DropdownMenu 
            open={folderContextMenu?.folderId === folder.id} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    closeFolderContextMenu();
                }
            }}
        >
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center justify-between py-1 px-2 text-sm hover:bg-muted/50 group relative rounded-md",
                selectedFolder === folder.path && "bg-muted",
                draggingItemId === folder.id && "opacity-50",
                dropTargetFolderIndicator === folder.id && "bg-primary/20 border border-primary"
              )}
              style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
              onClick={(e) => {
                e.stopPropagation()
                onSelectFolder(folder.path)
                toggleFolder(folder.id)
              }}
              onContextMenu={(e) => handleFolderContextMenuOpen(e, folder.id)}
              draggable={folder.id !== "__ROOT_ID__"}
              onDragStart={(e) => folder.id !== "__ROOT_ID__" && handleDragStartFolder(e, folder)}
              onDragEnd={handleDragEndItem}
              onDragOver={(e) => folder.id !== "__ROOT_ID__" && handleDragOverFolder(e, folder.id)}
              onDragLeave={handleDragLeaveFolder}
              onDrop={(e) => folder.id !== "__ROOT_ID__" && handleDropOnFolder(e, folder)}
            >
              <div className="flex items-center flex-1 truncate cursor-pointer">
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                {getFolderIcon(folder)}
                <span className="truncate">{folder.name}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            onClick={(e) => e.stopPropagation()} 
            onContextMenu={(e) => e.stopPropagation()}
            className="w-48"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem onClick={() => { onFolderAction("rename", folder); closeFolderContextMenu(); }}>
              <PenLine className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onFolderAction("customize", folder); closeFolderContextMenu(); }}>
              <Palette className="mr-2 h-4 w-4" />
              Customize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { onFolderAction("create", null, { parentId: folder.id }); closeFolderContextMenu(); }}>
              <FolderPlus className="mr-2 h-4 w-4" />
              New Subfolder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onClick={() => { onFolderAction("delete", folder); closeFolderContextMenu(); }} 
                className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isExpanded && folderItems.length > 0 && (
          <div className="mt-0.5 space-y-0.5">
            {folderItems.map(item => renderInteractiveItem(item, false, level + 1))}
          </div>
        )}
        {isExpanded && folderItems.length === 0 && (
          <p className="pl-8 py-1 text-xs text-muted-foreground" style={{ paddingLeft: `${(level + 1) * 1.25 + 2}rem` }}>
            No items in this folder.
          </p>
        )}
        {isExpanded && (
          folder.children && folder.children.map(childFolder => renderFolder(childFolder, level + 1))
        )}
      </div>
    )
  }

  const handleDropOnRoot = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("[DropOnRoot] Drop event on root zone. Current draggingItemId:", draggingItemId);
    if (!draggingItemId) {
      console.log("[DropOnRoot] Aborted: no draggingItemId");
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    const type = e.dataTransfer.getData("type");
    const id = e.dataTransfer.getData(type === "item" ? "itemId" : "folderId");
    const sourcePath = e.dataTransfer.getData("sourceFolderPath");

    if (id && sourcePath !== null && sourcePath !== "__ROOT__") {
        if (type === "item") {
            console.log(`Moving item ${id} to root.`);
            onMoveItem(id, null);
        } else if (type === "folder") {
            console.log(`Moving folder ${id} to root.`);
            onMoveFolder(id, null);
        }
    }
    handleDragEndItem();
  };
  
  const RootDropZone = () => (
    <div
      className={cn(
        "border-dashed transition-all duration-150 ease-in-out",
        draggingItemId 
            ? "h-8 py-1 my-0.5 border-2 border-transparent"
            : "h-0 py-0 my-0 border-0 overflow-hidden",
        draggingItemId && dropTargetFolderIndicator === "__ROOT_DROP_ZONE__" && "border-primary bg-primary/10"
      )}
      onDragOver={(e) => {
        if (!draggingItemId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropTargetFolderIndicator("__ROOT_DROP_ZONE__");
        setDropTargetItemIndicator(null);
      }}
      onDragLeave={() => setDropTargetFolderIndicator(null)}
      onDrop={handleDropOnRoot}
    >
      {draggingItemId && dropTargetFolderIndicator === "__ROOT_DROP_ZONE__" && (
         <div className="flex items-center justify-center h-full text-xs text-primary">Move to Root</div>
      )}
    </div>
  );

  return (
    <div className="pb-2">
      {draggingItemId && <RootDropZone />}
      
      <div className="space-y-0.5">
        {rootItems && rootItems.length > 0 && (
            rootItems.map(item => renderInteractiveItem(item, true, 0))
        )}
        {folders.map(folder => renderFolder(folder))}
      </div>

      {(!rootItems || rootItems.length === 0) && folders.length === 0 && (
          <div 
            className={cn(
                "px-2 py-4 text-center text-xs text-muted-foreground border-2 border-dashed border-transparent h-20 flex items-center justify-center",
                dropTargetFolderIndicator === "__ROOT_FALLBACK_DROP_ZONE__" && "border-primary bg-primary/10"
            )}
            onDragOver={(e) => {
                if (!draggingItemId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDropTargetFolderIndicator("__ROOT_FALLBACK_DROP_ZONE__");
                setDropTargetItemIndicator(null);
            }}
            onDragLeave={() => setDropTargetFolderIndicator(null)}
            onDrop={handleDropOnRoot}
          >
            {dropTargetFolderIndicator === "__ROOT_FALLBACK_DROP_ZONE__" ? "Move to Root" : "No folders yet. Drag items or folders here to move them to root."}
        </div>
      )}
    </div>
  )
}
