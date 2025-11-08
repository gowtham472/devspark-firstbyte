// lib/types.ts

export interface User {
  uid: string
  email: string
  name: string
  username: string
  bio?: string
  avatar?: string
  institution?: string
  website?: string
  socialLinks?: {
    github?: string
    linkedin?: string
    twitter?: string
  }
  followers: string[]
  following: string[]
  starredHubs: string[]
  createdAt: Date
  updatedAt: Date
}

export interface StudyHub {
  id: string
  title: string
  description: string
  tags: string[]
  ownerId: string
  ownerName: string
  ownerUsername: string
  ownerAvatar?: string
  visibility: 'public' | 'private'
  previewImage?: string
  files: HubFile[]
  stars: number
  starredBy: string[]
  views: number
  downloads: number
  createdAt: Date
  updatedAt: Date
  lastActivity: Date
}

export interface HubFile {
  id: string
  hubId: string
  fileName: string
  fileURL: string
  fileType: string
  fileSize: number
  uploadedAt: Date
  uploaderId: string
  version: number
  description?: string
}

export interface Comment {
  id: string
  hubId: string
  userId: string
  userName: string
  userAvatar?: string
  text: string
  createdAt: Date
  updatedAt?: Date
  replies?: Comment[]
}

export interface Activity {
  id: string
  userId: string
  type: 'hub_created' | 'hub_starred' | 'hub_commented' | 'user_followed' | 'file_uploaded'
  targetId: string
  targetType: 'hub' | 'user' | 'file'
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'star' | 'comment' | 'follow' | 'hub_update'
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: Date
}