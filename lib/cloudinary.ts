// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  public_id: string
  secure_url: string
  original_filename: string
  bytes: number
  format: string
}

// Client-side upload function using upload widget
export const uploadToCloudinary = (file: File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        reject(new Error(data.error.message))
      } else {
        resolve(data)
      }
    })
    .catch(error => reject(error))
  })
}

// Generate signed upload parameters (for secure uploads)
export const getUploadSignature = async (publicId: string, timestamp: number) => {
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  )
  
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  }
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

// Get file info from Cloudinary
export const getFileInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error)
    throw error
  }
}

// Generate thumbnail URL for images/videos
export const getThumbnailUrl = (publicId: string, options = {}) => {
  const defaultOptions = {
    width: 300,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  }
  
  return cloudinary.url(publicId, { ...defaultOptions, ...options })
}

// File type configurations
export const ALLOWED_FILE_TYPES = {
  documents: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  audio: ['mp3', 'wav', 'aac', 'ogg'],
  archives: ['zip', 'rar', '7z', 'tar', 'gz']
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const isValidFileType = (filename: string): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) return false
  
  const allTypes = Object.values(ALLOWED_FILE_TYPES).flat()
  return allTypes.includes(extension)
}

export const getFileCategory = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension) return 'other'
  
  for (const [category, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(extension)) {
      return category
    }
  }
  
  return 'other'
}