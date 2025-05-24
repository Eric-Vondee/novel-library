import { v2 as cloudinary } from 'cloudinary'
import path from 'node:path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export class CloudinaryService {
  async uploadFile(filePath: string, fileName: string, isImage = false) {
    try {
      const cleanFileName = fileName.trim()
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: isImage ? 'image' : 'raw',
        public_id: isImage
          ? `novels/images/${path.parse(cleanFileName).name}`
          : `novels/${path.parse(cleanFileName).name}`,
        format: isImage ? undefined : 'epub',
      })
      return result
    } catch (error) {
      console.error('Error uploading file to Cloudinary:', error)
      throw error
    }
  }

  async getFile(publicId: string, isImage = false) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: isImage ? 'image' : 'raw',
      })
      return result
    } catch (error) {
      console.error('Error getting file from Cloudinary:', error)
      throw error
    }
  }

  async listFiles(isImage = false) {
    try {
      let allResources: any[] = []
      let nextCursor: string | undefined

      do {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: isImage ? 'novels/images/' : 'novels/',
          resource_type: isImage ? 'image' : 'raw',
          max_results: 500, // Get maximum results per request
          next_cursor: nextCursor,
        })

        allResources = allResources.concat(result.resources)
        nextCursor = result.next_cursor
      } while (nextCursor)

      return allResources
    } catch (error) {
      console.error('Error listing files from Cloudinary:', error)
      throw error
    }
  }

  getDownloadUrl(publicId: string, isImage = false) {
    return cloudinary.url(publicId, {
      resource_type: isImage ? 'image' : 'raw',
      attachment: !isImage, // Only add attachment for non-images
    })
  }
}
