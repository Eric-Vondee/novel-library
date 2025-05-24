import { CloudinaryService } from '../lib/cloudinary'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const NOVELS_DIR = path.join(process.cwd(), 'public', 'novels')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

async function migrateNovels() {
  const cloudinaryService = new CloudinaryService()

  try {
    console.log('Reading novels directory...')
    const files = fs.readdirSync(NOVELS_DIR)
    const epubFiles = files.filter((file: string) => file.endsWith('.epub'))

    console.log(`Found ${epubFiles.length} EPUB files to migrate`)

    // Get list of existing files from Cloudinary
    console.log('Checking existing files in Cloudinary...')
    const existingFiles = await cloudinaryService.listFiles()
    const existingFileNames = new Set(existingFiles.map((file: any) => file.public_id))

    for (const file of epubFiles) {
      const filePath = path.join(NOVELS_DIR, file)
      const fileSize = fs.statSync(filePath).size
      const publicId = `novels/${path.parse(file.trim()).name}`

      // Skip if file already exists
      if (existingFileNames.has(publicId)) {
        console.log(`Skipping ${file} - already uploaded`)
        continue
      }

      // Check file size
      if (fileSize > MAX_FILE_SIZE) {
        console.warn(
          `Warning: ${file} is too large (${(fileSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB. Skipping...`,
        )
        continue
      }

      console.log(`Uploading ${file}...`)

      try {
        const result = await cloudinaryService.uploadFile(filePath, file)
        console.log(`Successfully uploaded ${file} with public_id: ${result.public_id}`)
      } catch (error) {
        console.error(`Failed to upload ${file}:`, error)
      }
    }

    console.log('Migration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateNovels()
