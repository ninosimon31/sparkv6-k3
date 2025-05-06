"use client"

import { useState } from "react"
import type { Item, ViewType } from "@/lib/types"
import { ItemCard } from "@/components/item-card"
import { ItemDetail } from "@/components/item-detail"
import { Button } from "@/components/ui/button"
import { Grid, List, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentAreaProps {
  items: Item[]
  isLoading: boolean
  selectedView: ViewType
  onItemClick: (item: Item) => void
  selectedItem: Item | null
  onUpdateItem: (item: Item) => void
  onDeleteItem: (id: string) => void
}

type LayoutType = "grid" | "list" | "cards"

export function ContentArea({
  items,
  isLoading,
  selectedView,
  onItemClick,
  selectedItem,
  onUpdateItem,
  onDeleteItem,
}: ContentAreaProps) {
  const [layout, setLayout] = useState<LayoutType>("cards")

  if (selectedItem) {
    return (
      <ItemDetail
        item={selectedItem}
        onBack={() => onItemClick(null)}
        onUpdate={onUpdateItem}
        onDelete={onDeleteItem}
      />
    )
  }

  const getViewTitle = () => {
    if (selectedView === "all") return "All Items"
    if (selectedView === "notes") return "Notes"
    if (selectedView === "links") return "Links"
    if (selectedView === "images") return "Images"
    if (selectedView === "files") return "Files"
    return "Items"
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
        <div className="flex items-center space-x-1">
          <Button variant={layout === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setLayout("grid")}>
            <Grid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button variant={layout === "cards" ? "secondary" : "ghost"} size="icon" onClick={() => setLayout("cards")}>
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Card view</span>
          </Button>
          <Button variant={layout === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setLayout("list")}>
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div
            className={cn(
              "gap-4",
              layout === "grid" && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
              layout === "cards" && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              layout === "list" && "space-y-2",
            )}
          >
            {items.map((item) => (
              <ItemCard key={item.id} item={item} layout={layout} onClick={() => onItemClick(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
