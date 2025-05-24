const { PrismaClient } = require('@prisma/client')
import { novels } from '../data/novel-list'

const prisma = new PrismaClient()

async function migrateNovels() {
  console.log('Starting novel migration...')

  for (const novel of novels) {
    try {
      // Create the novel
      await prisma.novel.create({
        data: {
          title: novel.title,
          author: novel.author,
          filename: novel.filename,
          image: novel.image,
          description: novel.description,
          status: novel.status,
          chapters: novel.chapters,
          synopsis: {
            create: novel.synopsis.map((content: string, index: number) => ({
              content,
              orderIndex: index,
            })),
          },
        },
      })
      console.log(`Successfully migrated novel: ${novel.title}`)
    } catch (error) {
      console.error(`Failed to migrate novel ${novel.title}:`, error)
    }
  }

  console.log('Novel migration completed!')
}

migrateNovels()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
