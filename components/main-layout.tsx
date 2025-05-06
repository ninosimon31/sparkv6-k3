"use client"

import { useState } from "react"
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

  const { items, folders, tags, addItem, updateItem, deleteItem, isLoading } = useItems()

  // Filter items based on selected view, folder, tag, and search query
  const filteredItems = items.filter((item) => {
    // Filter by view type
    if (selectedView === "notes" && item.type !== "note") return false
    if (selectedView === "links" && item.type !== "link") return false
    if (selectedView === "images" && item.type !== "image") return false
    if (selectedView === "files" && item.type !== "file") return false

    // Filter by folder
    if (selectedFolder && item.folder !== selectedFolder) return false

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

  const handleCreateItem = (type: ItemType) => {
    setCreateItemType(type)
    setIsCreateDialogOpen(true)
  }

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        folders={folders}
        tags={tags}
        onCreateItem={handleCreateItem}
        setSearchQuery={setSearchQuery}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />
      <ContentArea
        items={filteredItems}
        isLoading={isLoading}
        selectedView={selectedView}
        onItemClick={handleItemClick}
        selectedItem={selectedItem}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
      />
      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        setIsOpen={setIsCreateDialogOpen}
        itemType={createItemType}
        onCreateItem={addItem}
        folders={folders}
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
