import fs from 'node:fs'
import path from 'node:path'

const NOVELS_DIR = path.join(process.cwd(), 'public', 'novels')

async function cleanupLocal() {
  try {
    console.log('Reading novels directory...')
    const files = fs.readdirSync(NOVELS_DIR)
    const epubFiles = files.filter(
      (file: string) => file.endsWith('.epub') && file !== 'Reverend-Insanity.epub', // Keep this file
    )

    console.log(`Found ${epubFiles.length} EPUB files to clean up`)

    for (const file of epubFiles) {
      const filePath = path.join(NOVELS_DIR, file)
      try {
        fs.unlinkSync(filePath)
        console.log(`Deleted: ${file}`)
      } catch (error) {
        console.error(`Failed to delete ${file}:`, error)
      }
    }

    // Clean up images directory if it's empty
    const imagesDir = path.join(NOVELS_DIR, 'images')
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir)
      if (imageFiles.length === 0) {
        fs.rmdirSync(imagesDir)
        console.log('Removed empty images directory')
      }
    }

    console.log('Cleanup completed!')
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

cleanupLocal()
