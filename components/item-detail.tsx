"use client"

import { useState } from "react"
import type { Item } from "@/lib/types"
import { ArrowLeft, Edit, Trash, ExternalLink, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { EditItemDialog } from "@/components/edit-item-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface ItemDetailProps {
  item: Item
  onBack: () => void
  onUpdate: (item: Item) => void
  onDelete: (id: string) => void
}

export function ItemDetail({ item, onBack, onUpdate, onDelete }: ItemDetailProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    onDelete(item.id)
    onBack()
  }

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{formatDate(item.updatedAt || item.createdAt)}</span>
              {item.folder && (
                <>
                  <span className="mx-2">•</span>
                  <span>{item.folder}</span>
                </>
              )}
            </div>
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {item.type === "link" && item.url && (
            <div className="mb-6">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {item.url}
              </a>
            </div>
          )}

          {item.type === "image" && item.url && (
            <div className="mb-6 relative">
              <div className="relative max-h-[500px] overflow-hidden rounded-lg">
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={item.title || "Image"}
                  width={800}
                  height={600}
                  className="object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {item.type === "file" && item.url && (
            <div className="mb-6">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Download {item.title}
              </a>
            </div>
          )}

          {item.content && <div className="prose prose-sm max-w-none dark:prose-invert">{item.content}</div>}

          {item.linkedItems && item.linkedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Linked Items</h2>
              <div className="space-y-2">
                {item.linkedItems.map((linkedItem) => (
                  <div
                    key={linkedItem.id}
                    className="flex items-center p-3 rounded-md hover:bg-muted cursor-pointer border border-border"
                    onClick={() => (window.location.href = `/items/${linkedItem.id}`)}
                  >
                    <LinkIcon className="h-4 w-4 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{linkedItem.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.backlinks && item.backlinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Mentioned In</h2>
              <div className="space-y-2">
                {item.backlinks.map((backlink) => (
                  <div
                    key={backlink.id}
                    className="flex items-center p-3 rounded-md hover:bg-muted cursor-pointer border border-border"
                    onClick={() => (window.location.href = `/items/${backlink.id}`)}
                  >
                    <LinkIcon className="h-4 w-4 mr-3" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{backlink.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <EditItemDialog isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} item={item} onUpdateItem={onUpdate} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
