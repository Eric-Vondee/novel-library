import { GoogleDriveService } from '../lib/googleDrive'
import fs from 'node:fs'
import path from 'node:path'

const NOVELS_DIR = path.join(process.cwd(), 'public', 'novels')

async function migrateNovels() {
  const driveService = new GoogleDriveService()

  try {
    console.log('Initializing Google Drive service...')
    if (!(await driveService.initialize())) {
      throw new Error('Failed to initialize Google Drive service')
    }

    console.log('Reading novels directory...')
    const files = fs.readdirSync(NOVELS_DIR)
    const epubFiles = files.filter((file) => file.endsWith('.epub'))

    console.log(`Found ${epubFiles.length} EPUB files to migrate`)

    for (const file of epubFiles) {
      const filePath = path.join(NOVELS_DIR, file)
      console.log(`Uploading ${file}...`)

      try {
        const fileId = await driveService.uploadFile(filePath, file)
        console.log(`Successfully uploaded ${file} with ID: ${fileId}`)
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
