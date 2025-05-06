"use client"

import type { Item } from "@/lib/types"
import { FileText, LinkIcon, ImageIcon, File, ExternalLink, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ItemCardProps {
  item: Item
  layout: "grid" | "list" | "cards"
  onClick: () => void
}

export function ItemCard({ item, layout, onClick }: ItemCardProps) {
  const getItemIcon = () => {
    switch (item.type) {
      case "note":
        return <FileText className="h-4 w-4" />
      case "link":
        return <LinkIcon className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "file":
        return <File className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (layout === "list") {
    return (
      <div className="flex items-center p-3 rounded-md hover:bg-muted cursor-pointer" onClick={onClick}>
        <div className="mr-3">{getItemIcon()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{item.title}</h3>
          {item.type === "link" && item.url && <p className="text-xs text-muted-foreground truncate">{item.url}</p>}
        </div>
        <div className="ml-2 text-xs text-muted-foreground">{formatDate(item.updatedAt || item.createdAt)}</div>
      </div>
    )
  }

  if (layout === "grid") {
    return (
      <div
        className="group relative aspect-square rounded-md border border-border overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {item.type === "image" && item.url ? (
          <Image src={item.url || "/placeholder.svg"} alt={item.title || "Image"} fill className="object-cover" />
        ) : item.type === "link" && item.previewImage ? (
          <div className="relative h-full">
            <Image
              src={item.previewImage || "/placeholder.svg"}
              alt={item.title || "Link preview"}
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="p-4 text-center">
                <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-background flex items-center justify-center">
                {getItemIcon()}
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
        </div>
      </div>
    )
  }

  // Default card layout
  return (
    <Card className="overflow-hidden">
      {item.type === "image" && item.url ? (
        <div className="relative h-40">
          <Image src={item.url || "/placeholder.svg"} alt={item.title || "Image"} fill className="object-cover" />
        </div>
      ) : item.type === "link" && item.previewImage ? (
        <div className="relative h-40">
          <Image
            src={item.previewImage || "/placeholder.svg"}
            alt={item.title || "Link preview"}
            fill
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <ExternalLink className="h-8 w-8" />
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-muted">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">{getItemIcon()}</div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-medium line-clamp-2">{item.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>Open</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {item.type === "link" && item.url && <p className="text-xs text-muted-foreground mt-1 truncate">{item.url}</p>}

        {item.type === "note" && item.content && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.content}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
        {item.tags &&
          item.tags.length > 0 &&
          item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        {item.tags && item.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{item.tags.length - 3}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
