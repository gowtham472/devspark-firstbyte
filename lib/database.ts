// lib/database.ts
import { 
  collection,
  doc,
  Timestamp,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,

  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from './firebase'
import type { StudyHub, HubFile, Comment, User } from './types'

// Collections
const COLLECTIONS = {
  users: 'users',
  studyHubs: 'studyHubs',
  files: 'files',
  comments: 'comments',
  activities: 'activities',
  notifications: 'notifications'
} as const

// Helper function to convert Firestore timestamp to Date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertTimestamp = <T>(data: any): T => {
  const converted: Record<string, unknown> = { ...data }
  Object.keys(converted).forEach(key => {
    const val = converted[key]
    if (val && typeof val === 'object' && 'seconds' in (val as Record<string, unknown>)) {
      const ts = val as Timestamp
      converted[key] = ts.toDate()
    }
  })
  return converted as T
}

// Study Hubs
export const studyHubsDB = {
  // Create a new study hub
  async create(hubData: Omit<StudyHub, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.studyHubs), {
      ...hubData,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      stars: 0,
      views: 0,
      downloads: 0,
      starredBy: []
    })
    return docRef.id
  },

  // Get a study hub by ID
  async getById(hubId: string): Promise<StudyHub | null> {
    const docRef = doc(db, COLLECTIONS.studyHubs, hubId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertTimestamp({ id: docSnap.id, ...docSnap.data() }) as StudyHub
    }
    return null
  },

  // Get public study hubs with pagination
  async getPublic(lastDoc?: DocumentSnapshot, pageSize = 12) {
    let q = query(
      collection(db, COLLECTIONS.studyHubs),
      where('visibility', '==', 'public'),
      orderBy('lastActivity', 'desc'),
      limit(pageSize)
    )
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }
    
    const querySnapshot = await getDocs(q)
    const hubs = querySnapshot.docs.map(doc => 
      convertTimestamp({ id: doc.id, ...doc.data() })
    ) as StudyHub[]
    
    return {
      hubs,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    }
  },

  // Get user's hubs
  async getUserHubs(userId: string) {
    const q = query(
      collection(db, COLLECTIONS.studyHubs),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      convertTimestamp({ id: doc.id, ...doc.data() })
    ) as StudyHub[]
  },

  // Search hubs by title and tags
  async search(searchTerm: string, tags: string[] = [], lastDoc?: DocumentSnapshot) {
    let q = query(
      collection(db, COLLECTIONS.studyHubs),
      where('visibility', '==', 'public'),
      orderBy('lastActivity', 'desc'),
      limit(12)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const querySnapshot = await getDocs(q)
    let hubs = querySnapshot.docs.map(doc => 
      convertTimestamp({ id: doc.id, ...doc.data() })
    ) as StudyHub[]

    // Client-side filtering for now (consider using Algolia for better search)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      hubs = hubs.filter(hub => 
        hub.title.toLowerCase().includes(searchLower) ||
        hub.description.toLowerCase().includes(searchLower) ||
        hub.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (tags.length > 0) {
      hubs = hubs.filter(hub => 
        tags.some(tag => hub.tags.includes(tag))
      )
    }

    return {
      hubs,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    }
  },

  // Update a study hub
  async update(hubId: string, updates: Partial<StudyHub>) {
    const docRef = doc(db, COLLECTIONS.studyHubs, hubId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  },

  // Delete a study hub
  async delete(hubId: string) {
    const docRef = doc(db, COLLECTIONS.studyHubs, hubId)
    await deleteDoc(docRef)
  },

  // Star/Unstar a hub
  async toggleStar(hubId: string, userId: string, isStarred: boolean) {
    const docRef = doc(db, COLLECTIONS.studyHubs, hubId)
    
    if (isStarred) {
      await updateDoc(docRef, {
        stars: increment(-1),
        starredBy: arrayRemove(userId)
      })
    } else {
      await updateDoc(docRef, {
        stars: increment(1),
        starredBy: arrayUnion(userId)
      })
    }
  },

  // Increment views
  async incrementViews(hubId: string) {
    const docRef = doc(db, COLLECTIONS.studyHubs, hubId)
    await updateDoc(docRef, {
      views: increment(1),
      lastActivity: new Date()
    })
  }
}

// Files
export const filesDB = {
  // Add file to hub
  async add(fileData: Omit<HubFile, 'id' | 'uploadedAt' | 'version'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.files), {
      ...fileData,
      uploadedAt: new Date(),
      version: 1
    })
    return docRef.id
  },

  // Get files for a hub
  async getHubFiles(hubId: string) {
    const q = query(
      collection(db, COLLECTIONS.files),
      where('hubId', '==', hubId),
      orderBy('uploadedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      convertTimestamp({ id: doc.id, ...doc.data() })
    ) as HubFile[]
  },

  // Delete a file
  async delete(fileId: string) {
    const docRef = doc(db, COLLECTIONS.files, fileId)
    await deleteDoc(docRef)
  }
}

// Comments
export const commentsDB = {
  // Add comment
  async add(commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.comments), {
      ...commentData,
      createdAt: new Date()
    })
    return docRef.id
  },

  // Get comments for a hub
  async getHubComments(hubId: string) {
    const q = query(
      collection(db, COLLECTIONS.comments),
      where('hubId', '==', hubId),
      orderBy('createdAt', 'asc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      convertTimestamp({ id: doc.id, ...doc.data() })
    ) as Comment[]
  },

  // Delete comment
  async delete(commentId: string) {
    const docRef = doc(db, COLLECTIONS.comments, commentId)
    await deleteDoc(docRef)
  }
}

// Users
export const usersDB = {
  // Get user by ID
  async getById(userId: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.users, userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return convertTimestamp(docSnap.data()) as User
    }
    return null
  },

  // Get user by username
  async getByUsername(username: string): Promise<User | null> {
    const q = query(
      collection(db, COLLECTIONS.users),
      where('username', '==', username),
      limit(1)
    )
    
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return convertTimestamp({ uid: doc.id, ...doc.data() }) as User
    }
    return null
  },

  // Follow/Unfollow user
  async toggleFollow(currentUserId: string, targetUserId: string, isFollowing: boolean) {
    const currentUserRef = doc(db, COLLECTIONS.users, currentUserId)
    const targetUserRef = doc(db, COLLECTIONS.users, targetUserId)
    
    if (isFollowing) {
      // Unfollow
      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      })
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUserId)
      })
    } else {
      // Follow
      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      })
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUserId)
      })
    }
  }
}