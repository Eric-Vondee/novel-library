import { CloudinaryService } from '../lib/cloudinary'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const NOVELS_DIR = path.join(process.cwd(), 'public', 'novels')
const IMAGES_DIR = path.join(NOVELS_DIR, 'images')

async function migrateImages() {
  const cloudinaryService = new CloudinaryService()

  try {
    console.log('Reading images directory...')
    const files = fs.readdirSync(IMAGES_DIR)
    const imageFiles = files.filter(
      (file: string) =>
        file.endsWith('.jpg') ||
        file.endsWith('.jpeg') ||
        file.endsWith('.png') ||
        file.endsWith('.webp'),
    )

    console.log(`Found ${imageFiles.length} image files to migrate`)

    // Get list of existing files from Cloudinary
    console.log('Checking existing files in Cloudinary...')
    const existingFiles = await cloudinaryService.listFiles(true)
    const existingFileNames = new Set(existingFiles.map((file: any) => file.public_id))

    for (const file of imageFiles) {
      const filePath = path.join(IMAGES_DIR, file)
      const publicId = `novels/images/${path.parse(file).name}`

      // Skip if file already exists
      if (existingFileNames.has(publicId)) {
        console.log(`Skipping ${file} - already uploaded`)
        continue
      }

      console.log(`Uploading ${file}...`)

      try {
        const result = await cloudinaryService.uploadFile(filePath, file, true)
        console.log(`Successfully uploaded ${file} with public_id: ${result.public_id}`)

        // Delete the local file after successful upload
        fs.unlinkSync(filePath)
        console.log(`Deleted local file: ${file}`)
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error)
      }
    }

    console.log('Image migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateImages()
