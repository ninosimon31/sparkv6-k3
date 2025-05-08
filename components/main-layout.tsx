"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { ContentArea } from "@/components/content-area"
import type { ItemType, ViewType, Item } from "@/lib/types"
import { useItems } from "@/hooks/use-items"
import { CreateItemDialog } from "@/components/create-item-dialog"
import { SearchModal } from "@/components/search-modal"

export function MainLayout() {
  const [selectedView, setSelectedView] = useState<ViewType>("all")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createItemType, setCreateItemType] = useState<ItemType>("note")
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const {
    items,
    folderStructure,
    tags,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    reorderItemInFolder,
    addFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    customizeFolder,
    addTag,
    getItemsByFolder,
    findFolderById,
  } = useItems()

  // Filter items based on selected view, folder, tag, and search query
  const filteredItems = items.filter((item) => {
    // Filter by view type
    if (selectedView === "notes" && item.type !== "note") return false
    if (selectedView === "links" && item.type !== "link") return false
    if (selectedView === "images" && item.type !== "image") return false
    if (selectedView === "files" && item.type !== "file") return false

    // Filter by folder
    if (selectedFolder !== null) {
      if (item.folder !== selectedFolder) return false
    } else {
      if (item.folder !== null) return false
    }

    // Filter by tag
    if (selectedTag && !item.tags?.includes(selectedTag)) return false

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = item.title?.toLowerCase().includes(query)
      const matchesContent = item.content?.toLowerCase().includes(query)
      const matchesTags = item.tags?.some((tag) => tag.toLowerCase().includes(query))

      return matchesTitle || matchesContent || matchesTags
    }

    return true
  })

  const handleCreateItem = useCallback((type: ItemType) => {
    setCreateItemType(type)
    setIsCreateDialogOpen(true)
  }, [])

  const handleItemSelect = useCallback((itemId: string | null) => {
    if (itemId === null) {
      setSelectedItem(null);
      return;
    }
    const itemToSelect = items.find(it => it.id === itemId);
    setSelectedItem(itemToSelect || null);
  }, [items]);

  const handleContentAreaItemClick = useCallback((item: Item | null) => {
    setSelectedItem(item)
  }, [])

  const handleAddItem = useCallback(
    (item: Item) => {
      try {
        // Add the item to the collection
        addItem(item)
      } catch (error) {
        console.error("Error adding item:", error)
        // Force a refresh if there was an error
        window.location.reload()
      }
    },
    [addItem],
  )

  const handleAddFolder = useCallback(
    (folderName: string, parentId: string | null = null) => {
      addFolder(folderName, parentId)
    },
    [addFolder],
  )

  const handleRenameFolder = useCallback(
    (id: string, newName: string) => {
      renameFolder(id, newName)
    },
    [renameFolder],
  )

  const handleMoveFolder = useCallback(
    (id: string, newParentId: string | null) => {
      moveFolder(id, newParentId)
    },
    [moveFolder],
  )

  const handleDeleteFolder = useCallback(
    (id: string) => {
      deleteFolder(id)
    },
    [deleteFolder],
  )

  const handleCustomizeFolder = useCallback(
    (id: string, color: string, icon: string) => {
      customizeFolder(id, color, icon)
    },
    [customizeFolder],
  )

  const handleAddTag = useCallback(
    (tagName: string) => {
      addTag(tagName)
    },
    [addTag],
  )

  const handleMoveItem = useCallback(
    (itemId: string, newFolderPath: string | null) => {
      moveItem(itemId, newFolderPath);
    },
    [moveItem]
  );

  const handleReorderItemInFolder = useCallback(
    (itemId: string, targetItemId: string | null, folderPath: string, position: "before" | "after") => {
      reorderItemInFolder(itemId, targetItemId, folderPath, position);
    },
    [reorderItemInFolder]
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        folderStructure={folderStructure}
        tags={tags}
        onCreateItem={handleCreateItem}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onAddFolder={handleAddFolder}
        onRenameFolder={handleRenameFolder}
        onMoveFolder={handleMoveFolder}
        onDeleteFolder={handleDeleteFolder}
        onCustomizeFolder={handleCustomizeFolder}
        onAddTag={handleAddTag}
        getItemsByFolder={getItemsByFolder}
        findFolderById={findFolderById}
        onMoveItem={handleMoveItem}
        onReorderItem={handleReorderItemInFolder}
        items={items}
        onSelectItem={handleItemSelect}
        isLoading={isLoading}
      />
      <ContentArea
        items={filteredItems}
        isLoading={isLoading}
        selectedView={selectedView}
        onItemClick={handleContentAreaItemClick}
        selectedItem={selectedItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
      />
      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        itemType={createItemType}
        onCreateItem={handleAddItem}
        folderStructure={folderStructure}
        tags={tags}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        setIsOpen={setIsSearchModalOpen}
        items={items}
        onItemSelect={(item) => {
          setSelectedItem(item)
          setIsSearchModalOpen(false)
        }}
      />
    </div>
  )
}
