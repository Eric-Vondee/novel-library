import type { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'
import { AnimatedNovelCard } from '@/components/magicui/animated-novel-card'
import { AnimatedHero } from '@/components/magicui/animated-hero'

export const metadata: Metadata = {
  title: 'Novels',
  description: 'Browse your collection of novels. Find your next favorite story.',
}

interface Novel {
  id: number
  title: string
  author: string
  filename: string
  image: string
  description: string
  status: string
  chapters: number
  synopsis: string[]
}

interface DbNovel {
  id: number
  title: string
  author: string
  filename: string
  image: string
  description: string
  status: string
  chapters: number
  synopsis: Array<{
    content: string
  }>
}

async function getNovels(): Promise<Novel[]> {
  const prisma = new PrismaClient()
  try {
    const novels = await prisma.novel.findMany({
      include: {
        synopsis: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    // Transform the data to match the expected format
    return novels.map((novel: DbNovel) => ({
      ...novel,
      synopsis: novel.synopsis.map((s: { content: string }) => s.content),
    }))
  } catch (error) {
    console.error('Error fetching novels:', error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}

export default async function NovelsPage() {
  const novels = await getNovels()

  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <AnimatedHero
        title='My Novel Collection'
        description='A collection of my favorite novels, carefully curated and ready to be explored.'
        className='mb-12'
      />

      <div className='w-full max-w-7xl px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {novels.map((novel: Novel, index: number) => (
            <AnimatedNovelCard key={novel.id} novel={novel} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
