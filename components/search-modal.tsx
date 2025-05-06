"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Item } from "@/lib/types"
import { Search, File, FileText, LinkIcon, ImageIcon, Tag, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useHotkeys } from "@/hooks/use-hotkeys"

interface SearchModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  items: Item[]
  onItemSelect: (item: Item) => void
}

export function SearchModal({ isOpen, setIsOpen, items, onItemSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
      setActiveIndex(0)
    }
  }, [isOpen])

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return false

    const query = searchQuery.toLowerCase()
    const matchesTitle = item.title?.toLowerCase().includes(query)
    const matchesContent = item.content?.toLowerCase().includes(query)
    const matchesTags = item.tags?.some((tag) => tag.toLowerCase().includes(query))
    const matchesFolder = item.folder?.toLowerCase().includes(query)

    return matchesTitle || matchesContent || matchesTags || matchesFolder
  })

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredItems[activeIndex]) {
          onItemSelect(filteredItems[activeIndex])
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filteredItems, activeIndex, onItemSelect, setIsOpen])

  // Register global hotkey to open search
  useHotkeys("ctrl+p", () => setIsOpen(true))
  useHotkeys("cmd+p", () => setIsOpen(true))
  useHotkeys("ctrl+k", () => setIsOpen(true))
  useHotkeys("cmd+k", () => setIsOpen(true))

  const getItemIcon = (type: string) => {
    switch (type) {
      case "note":
        return <FileText className="h-4 w-4 flex-shrink-0" />
      case "link":
        return <LinkIcon className="h-4 w-4 flex-shrink-0" />
      case "image":
        return <ImageIcon className="h-4 w-4 flex-shrink-0" />
      case "file":
        return <File className="h-4 w-4 flex-shrink-0" />
      default:
        return <FileText className="h-4 w-4 flex-shrink-0" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden fixed top-1/5 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Find or create a note..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pl-12 h-12 text-base"
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[300px] overflow-auto">
          {filteredItems.length > 0 ? (
            <div className="py-2">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "px-4 py-2 cursor-pointer flex items-start gap-3",
                    index === activeIndex ? "bg-muted" : "hover:bg-muted/50",
                  )}
                  onClick={() => onItemSelect(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {getItemIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    {item.folder && <div className="text-xs text-muted-foreground truncate">{item.folder}</div>}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="px-4 py-8 text-center text-muted-foreground">No matches found</div>
          ) : null}
        </ScrollArea>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <div className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">↓</kbd>
            to navigate
          </div>
          <div className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">Enter</kbd>
            to open
          </div>
          <div className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs mr-1">Esc</kbd>
            to dismiss
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
