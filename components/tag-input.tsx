"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TagInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  availableTags: string[]
  disabled?: boolean
}

export function TagInput({ tags, setTags, availableTags, disabled = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Update suggestions when input value changes
  useEffect(() => {
    if (inputValue.trim()) {
      // Show all tags that start with the input value
      const filtered = availableTags.filter(
        (tag) => !tags.includes(tag) && tag.toLowerCase().startsWith(inputValue.toLowerCase()),
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [inputValue, availableTags, tags])

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
    }
    setInputValue("")

    // Focus back on the input after adding a tag
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      handleAddTag(inputValue)
    }
  }

  // Handle clicking the + button
  const handleAddButtonClick = () => {
    if (inputValue) {
      handleAddTag(inputValue)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => handleRemoveTag(tag)}>
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </Button>
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="w-full"
          />

          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="px-3 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleAddTag(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button variant="outline" size="icon" onClick={handleAddButtonClick}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add tag</span>
        </Button>
      </div>
    </div>
  )
}
