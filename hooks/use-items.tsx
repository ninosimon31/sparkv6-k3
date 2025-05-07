"use client"

import { useState, useEffect, useCallback } from "react"
import type { Item, FolderStructure } from "@/lib/types"

// Create keys for localStorage
const STORAGE_KEY = "spark-items"
const FOLDERS_KEY = "spark-folders"
const TAGS_KEY = "spark-tags"

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get all folder paths (flattened)
  const getAllFolderPaths = useCallback(() => {
    const paths: string[] = []

    const traverseFolders = (folders: FolderStructure[], parentPath = "") => {
      folders.forEach((folder) => {
        const currentPath = parentPath ? `${parentPath}/${folder.name}` : folder.name
        paths.push(currentPath)
        if (folder.children.length > 0) {
          traverseFolders(folder.children, currentPath)
        }
      })
    }

    traverseFolders(folderStructure)
    return paths
  }, [folderStructure])

  // Load items from localStorage on mount
  useEffect(() => {
    const loadItems = () => {
      try {
        setIsLoading(true)

        // Try to load from localStorage
        const savedItems = localStorage.getItem(STORAGE_KEY)
        const savedFolders = localStorage.getItem(FOLDERS_KEY)
        const savedTags = localStorage.getItem(TAGS_KEY)

        if (savedItems) {
          const parsedItems = JSON.parse(savedItems) as Item[]
          setItems(parsedItems)
        } else {
          setItems([])
        }

        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders) as FolderStructure[]
          setFolderStructure(parsedFolders)
        } else {
          setFolderStructure([])
        }

        if (savedTags) {
          const parsedTags = JSON.parse(savedTags) as string[]
          setTags(parsedTags)
        } else {
          setTags([])
        }
      } catch (error) {
        console.error("Failed to load items:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save items to localStorage:", error)
      }
    }
  }, [items, isLoading])

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folderStructure))
      } catch (error) {
        console.error("Failed to save folders to localStorage:", error)
      }
    }
  }, [folderStructure, isLoading])

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
      } catch (error) {
        console.error("Failed to save tags to localStorage:", error)
      }
    }
  }, [tags, isLoading])

  const addItem = useCallback(
    (item: Item) => {
      try {
        // Update state synchronously
        const newItems = [...items, item]
        setItems(newItems)

        // Update tags if needed
        if (item.tags && item.tags.length > 0) {
          const newTags = item.tags.filter((tag) => !tags.includes(tag))
          if (newTags.length > 0) {
            const updatedTags = [...tags, ...newTags]
            setTags(updatedTags)
          }
        }
      } catch (error) {
        console.error("Error adding item:", error)
        throw error
      }
    },
    [items, tags],
  )

  const updateItem = useCallback(
    (updatedItem: Item) => {
      try {
        const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        setItems(updatedItems)

        // Update tags if needed
        if (updatedItem.tags && updatedItem.tags.length > 0) {
          const newTags = updatedItem.tags.filter((tag) => !tags.includes(tag))
          if (newTags.length > 0) {
            setTags([...tags, ...newTags])
          }
        }
      } catch (error) {
        console.error("Error updating item:", error)
      }
    },
    [items, tags],
  )

  const deleteItem = useCallback(
    (id: string) => {
      try {
        const updatedItems = items.filter((item) => item.id !== id)
        setItems(updatedItems)

        // Recalculate tags from remaining items
        const usedTags = new Set(updatedItems.flatMap((item) => item.tags || [])) as Set<string>

        // Keep only tags that are in the tags list but not used by any items
        const remainingTags = tags.filter((tag) => usedTags.has(tag))
        setTags(remainingTags)
      } catch (error) {
        console.error("Error deleting item:", error)
      }
    },
    [items, tags],
  )

  const addTag = useCallback(
    (tagName: string) => {
      if (!tags.includes(tagName)) {
        const newTags = [...tags, tagName]
        setTags(newTags)
      }
    },
    [tags],
  )

  // Find a folder by ID in the folder structure
  const findFolderById = useCallback(
    (id: string): FolderStructure | null => {
      const findFolder = (folders: FolderStructure[]): FolderStructure | null => {
        for (const folder of folders) {
          if (folder.id === id) {
            return folder
          }
          if (folder.children.length > 0) {
            const found = findFolder(folder.children)
            if (found) return found
          }
        }
        return null
      }
      return findFolder(folderStructure)
    },
    [folderStructure],
  )

  // Find a folder's parent in the folder structure
  const findFolderParent = useCallback(
    (id: string): { parent: FolderStructure | null; index: number } => {
      const findParent = (folders: FolderStructure[]): { parent: FolderStructure | null; index: number } => {
        for (const folder of folders) {
          const childIndex = folder.children.findIndex((child) => child.id === id)
          if (childIndex !== -1) {
            return { parent: folder, index: childIndex }
          }
          if (folder.children.length > 0) {
            const result = findParent(folder.children)
            if (result.parent) return result
          }
        }
        return { parent: null, index: -1 }
      }

      // Check if it's a top-level folder
      const topLevelIndex = folderStructure.findIndex((folder) => folder.id === id)
      if (topLevelIndex !== -1) {
        return { parent: null, index: topLevelIndex }
      }

      return findParent(folderStructure)
    },
    [folderStructure],
  )

  // Add a new folder
  const addFolder = useCallback((folderName: string, parentId: string | null = null) => {
    const newFolder: FolderStructure = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: folderName,
      path: folderName,
      parentId,
      children: [],
      color: "default",
      icon: "folder",
    }

    if (!parentId) {
      // Add as a root folder
      setFolderStructure((prev) => [...prev, newFolder])
    } else {
      // Add as a child folder
      const updateFolderChildren = (folders: FolderStructure[]): FolderStructure[] => {
        return folders.map((folder) => {
          if (folder.id === parentId) {
            // Update the path for the new folder
            const updatedNewFolder = {
              ...newFolder,
              path: folder.path ? `${folder.path}/${folderName}` : folderName,
            }
            return {
              ...folder,
              children: [...folder.children, updatedNewFolder],
            }
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: updateFolderChildren(folder.children),
            }
          }
          return folder
        })
      }

      setFolderStructure((prev) => updateFolderChildren(prev))
    }
  }, [])

  // Rename a folder
  const renameFolder = useCallback(
    (id: string, newName: string) => {
      const folder = findFolderById(id)
      if (!folder) return

      const oldPath = folder.path
      const parentPath = oldPath.substring(0, oldPath.lastIndexOf(folder.name))
      const newPath = parentPath + newName

      // Update folder structure
      const updateFolderName = (folders: FolderStructure[]): FolderStructure[] => {
        return folders.map((folder) => {
          if (folder.id === id) {
            return {
              ...folder,
              name: newName,
              path: newPath,
            }
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: updateFolderName(folder.children),
            }
          }
          return folder
        })
      }

      setFolderStructure((prev) => updateFolderName(prev))

      // Update paths of all child folders
      const updateChildPaths = (folders: FolderStructure[]): FolderStructure[] => {
        return folders.map((folder) => {
          if (folder.path.startsWith(oldPath + "/")) {
            const updatedPath = folder.path.replace(oldPath, newPath)
            return {
              ...folder,
              path: updatedPath,
              children: updateChildPaths(folder.children),
            }
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: updateChildPaths(folder.children),
            }
          }
          return folder
        })
      }

      setFolderStructure((prev) => updateChildPaths(prev))

      // Update items in this folder and its subfolders
      setItems((prev) =>
        prev.map((item) => {
          if (item.folder === oldPath) {
            return { ...item, folder: newPath }
          }
          if (item.folder?.startsWith(oldPath + "/")) {
            return { ...item, folder: item.folder.replace(oldPath, newPath) }
          }
          return item
        }),
      )
    },
    [findFolderById],
  )

  // Move a folder
  const moveFolder = useCallback(
    (id: string, newParentId: string | null) => {
      const folder = findFolderById(id)
      if (!folder) return

      const { parent, index } = findFolderParent(id)
      if (parent === null && index === -1) return

      // Remove folder from its current parent
      const removeFolderFromParent = (folders: FolderStructure[]): FolderStructure[] => {
        if (parent === null) {
          // It's a top-level folder
          return folders.filter((_, i) => i !== index)
        }

        return folders.map((folder) => {
          if (folder.id === parent.id) {
            return {
              ...folder,
              children: folder.children.filter((_, i) => i !== index),
            }
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: removeFolderFromParent(folder.children),
            }
          }
          return folder
        })
      }

      // Add folder to its new parent
      const addFolderToNewParent = (folders: FolderStructure[], folderToAdd: FolderStructure): FolderStructure[] => {
        if (newParentId === null) {
          // Add to root
          return [...folders, folderToAdd]
        }

        return folders.map((folder) => {
          if (folder.id === newParentId) {
            // Update the path for the moved folder
            const newParentPath = folder.path
            const oldFolderPath = folderToAdd.path
            const folderName = folderToAdd.name
            const newFolderPath = newParentPath ? `${newParentPath}/${folderName}` : folderName

            // Create updated folder with new path
            const updatedFolder = {
              ...folderToAdd,
              path: newFolderPath,
              parentId: newParentId,
            }

            // Update paths of all items in this folder
            setItems((prev) =>
              prev.map((item) => {
                if (item.folder === oldFolderPath) {
                  return { ...item, folder: newFolderPath }
                }
                if (item.folder?.startsWith(oldFolderPath + "/")) {
                  return { ...item, folder: item.folder.replace(oldFolderPath, newFolderPath) }
                }
                return item
              }),
            )

            return {
              ...folder,
              children: [...folder.children, updatedFolder],
            }
          }
          if (folder.children.length > 0) {
            return {
              ...folder,
              children: addFolderToNewParent(folder.children, folderToAdd),
            }
          }
          return folder
        })
      }

      setFolderStructure((prev) => {
        const folderToMove = { ...folder }
        const foldersWithoutMoved = removeFolderFromParent(prev)
        return addFolderToNewParent(foldersWithoutMoved, folderToMove)
      })
    },
    [findFolderById, findFolderParent],
  )

  // Delete a folder
  const deleteFolder = useCallback(
    (id: string) => {
      const folder = findFolderById(id)
      if (!folder) return

      // Get all paths to delete
      const pathsToDelete: string[] = []
      const collectPaths = (folder: FolderStructure) => {
        pathsToDelete.push(folder.path)
        folder.children.forEach(collectPaths)
      }
      collectPaths(folder)

      // Remove folder from structure
      const removeFolderFromStructure = (folders: FolderStructure[]): FolderStructure[] => {
        return folders
          .filter((folder) => folder.id !== id)
          .map((folder) => ({
            ...folder,
            children: removeFolderFromStructure(folder.children),
          }))
      }

      setFolderStructure((prev) => removeFolderFromStructure(prev))

      // Remove items in deleted folders
      setItems((prev) => prev.filter((item) => !item.folder || !pathsToDelete.includes(item.folder)))
    },
    [findFolderById],
  )

  // Customize a folder
  const customizeFolder = useCallback((id: string, color: string, icon: string) => {
    const updateFolderCustomization = (folders: FolderStructure[]): FolderStructure[] => {
      return folders.map((folder) => {
        if (folder.id === id) {
          return {
            ...folder,
            color,
            icon,
          }
        }
        if (folder.children.length > 0) {
          return {
            ...folder,
            children: updateFolderCustomization(folder.children),
          }
        }
        return folder
      })
    }

    setFolderStructure((prev) => updateFolderCustomization(prev))
  }, [])

  // Helper function to get flattened folder list
  const getFlattenedFolders = useCallback((folders: FolderStructure[]): FolderStructure[] => {
    const result: FolderStructure[] = []

    const traverse = (folderList: FolderStructure[]) => {
      folderList.forEach((folder) => {
        result.push(folder)
        if (folder.children.length > 0) {
          traverse(folder.children)
        }
      })
    }

    traverse(folders)
    return result
  }, [])

  // Get items in a specific folder
  const getItemsByFolder = useCallback(
    (folderPath: string) => {
      return items.filter((item) => item.folder === folderPath)
    },
    [items],
  )

  return {
    items,
    folderStructure,
    tags,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    addFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
    customizeFolder,
    addTag,
    getAllFolderPaths,
    getFlattenedFolders,
    getItemsByFolder,
    findFolderById,
  }
}
