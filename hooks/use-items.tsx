"use client"

import { useState, useEffect } from "react"
import type { Item } from "@/lib/types"

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load items from IndexedDB on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        // In a real app, we would load from IndexedDB
        // For this demo, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockItems: Item[] = [
          {
            id: "item_1",
            type: "note",
            title: "Welcome to Spark",
            content:
              "Spark is a simple, powerful note-taking app with local storage. Create notes, add links, upload images, and organize everything with tags and folders.",
            createdAt: new Date().toISOString(),
            tags: ["Welcome", "Getting Started"],
            folder: "Guides",
          },
          {
            id: "item_2",
            type: "link",
            title: "Markdown Guide",
            url: "https://www.markdownguide.org/",
            content: "A comprehensive guide to Markdown syntax.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            tags: ["Reference", "Markdown"],
            folder: "Resources",
            previewImage: "/placeholder.svg?height=200&width=400",
          },
          {
            id: "item_3",
            type: "image",
            title: "Project Diagram",
            url: "/placeholder.svg?height=400&width=600",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            tags: ["Diagram", "Project"],
            folder: "Projects",
          },
        ]

        // Extract unique folders and tags
        const uniqueFolders = Array.from(new Set(mockItems.map((item) => item.folder).filter(Boolean))) as string[]

        const uniqueTags = Array.from(new Set(mockItems.flatMap((item) => item.tags || [])))

        setItems(mockItems)
        setFolders(uniqueFolders)
        setTags(uniqueTags)
      } catch (error) {
        console.error("Failed to load items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  const addItem = (item: Item) => {
    setItems((prev) => [...prev, item])

    // Update folders if needed
    if (item.folder && !folders.includes(item.folder)) {
      setFolders((prev) => [...prev, item.folder!])
    }

    // Update tags if needed
    if (item.tags && item.tags.length > 0) {
      const newTags = item.tags.filter((tag) => !tags.includes(tag))
      if (newTags.length > 0) {
        setTags((prev) => [...prev, ...newTags])
      }
    }

    // In a real app, we would save to IndexedDB
  }

  const updateItem = (updatedItem: Item) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))

    // Update folders if needed
    if (updatedItem.folder && !folders.includes(updatedItem.folder)) {
      setFolders((prev) => [...prev, updatedItem.folder!])
    }

    // Update tags if needed
    if (updatedItem.tags && updatedItem.tags.length > 0) {
      const newTags = updatedItem.tags.filter((tag) => !tags.includes(tag))
      if (newTags.length > 0) {
        setTags((prev) => [...prev, ...newTags])
      }
    }

    // In a real app, we would save to IndexedDB
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))

    // In a real app, we would delete from IndexedDB
    // We would also need to update folders and tags if they're no longer used
  }

  return {
    items,
    folders,
    tags,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
  }
}
