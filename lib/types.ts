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
  color?: string
  icon?: string
}

export interface FolderStructure {
  id: string
  name: string
  path: string
  parentId: string | null
  children: FolderStructure[]
  color?: string
  icon?: string
}

export type FolderAction = "create" | "rename" | "delete" | "move" | "customize"
