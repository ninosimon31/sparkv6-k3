"use client"

import { useState, useEffect } from "react"

interface IndexedDBOptions {
  dbName: string
  storeName: string
  version?: number
}

export function useIndexedDB<T extends { id: string }>({ dbName, storeName, version = 1 }: IndexedDBOptions) {
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize the database
  useEffect(() => {
    const request = indexedDB.open(dbName, version)

    request.onerror = (event) => {
      setError(new Error("Failed to open database"))
      setIsLoading(false)
    }

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result)
      setIsLoading(false)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" })
      }
    }

    return () => {
      if (db) {
        db.close()
      }
    }
  }, [dbName, storeName, version])

  // Get all items
  const getAll = async (): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result as T[])
      }

      request.onerror = () => {
        reject(new Error("Failed to get items"))
      }
    })
  }

  // Get item by ID
  const getById = async (id: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result as T)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get item with ID: ${id}`))
      }
    })
  }

  // Add or update item
  const put = async (item: T): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        resolve(item)
      }

      request.onerror = () => {
        reject(new Error("Failed to save item"))
      }
    })
  }

  // Delete item
  const remove = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete item with ID: ${id}`))
      }
    })
  }

  return {
    db,
    error,
    isLoading,
    getAll,
    getById,
    put,
    remove,
  }
}
