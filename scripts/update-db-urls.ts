import { CloudinaryService } from '../lib/cloudinary'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'node:path'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()
const cloudinaryService = new CloudinaryService()

interface DbNovel {
  id: number
  title: string
  author: string
  filename: string
  image: string
  description: string
  status: string
  chapters: number
}

async function updateDatabase() {
  try {
    console.log('Fetching files from Cloudinary...')

    // Get all novels and images from Cloudinary
    const [novels, images] = await Promise.all([
      cloudinaryService.listFiles(false), // false for novels
      cloudinaryService.listFiles(true), // true for images
    ])

    console.log(`Found ${novels.length} novels and ${images.length} images`)

    // Create a map of image names to their URLs
    const imageMap = new Map(
      images.map((img: any) => [
        path.parse(img.public_id).name,
        cloudinaryService.getDownloadUrl(img.public_id, true),
      ]),
    )

    // Get all novels from the database
    const dbNovels = await prisma.novel.findMany()
    console.log(`Found ${dbNovels.length} novels in database`)

    // Create a map of filenames to novel objects
    const dbNovelMap = new Map(
      dbNovels.map((novel: DbNovel) => [
        path.parse(novel.filename).name, // Use filename without extension
        novel,
      ]),
    )

    // Update each novel in the database
    for (const novel of novels) {
      const novelName = path.parse(novel.public_id).name
      const downloadUrl = cloudinaryService.getDownloadUrl(novel.public_id)
      const imageUrl = imageMap.get(novelName)

      // Find matching novel in database using filename
      const dbNovel = dbNovelMap.get(novelName) as DbNovel | undefined
      if (!dbNovel) {
        console.warn(`No matching novel found in database for: ${novelName}`)
        continue
      }

      try {
        await prisma.novel.update({
          where: {
            id: dbNovel.id,
          },
          data: {
            filename: downloadUrl,
            image: imageUrl || '/novels/images/default-cover.jpg',
          },
        })
        console.log(`Updated database for: ${dbNovel.title} (${novelName})`)
      } catch (error) {
        console.error(`Failed to update database for ${dbNovel.title}:`, error)
      }
    }

    console.log('Database update completed!')
  } catch (error) {
    console.error('Database update failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateDatabase()
