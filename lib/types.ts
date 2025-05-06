export type ItemType = "note" | "link" | "image" | "file"

export type ViewType = "all" | "notes" | "links" | "images" | "files"

export interface Item {
  id: string
  type: ItemType
  title?: string
  content?: string
  url?: string
  previewImage?: string
  previewDescription?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  folder?: string | null
  linkedItems?: Item[]
  backlinks?: Item[]
}
