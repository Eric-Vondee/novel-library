import type { Metadata } from 'next'
import { novels } from '@/data/novel-list'
import { AnimatedNovelCard } from '@/components/magicui/animated-novel-card'
import { AnimatedHero } from '@/components/magicui/animated-hero'

export const metadata: Metadata = {
  title: 'Novels',
  description: 'Browse your collection of novels. Find your next favorite story.',
}

export default function NovelsPage() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <AnimatedHero
        title='My Novel Collection'
        description='A collection of my favorite novels, carefully curated and ready to be explored.'
        className='mb-12'
      />

      <div className='w-full max-w-7xl px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {novels.map((novel, index) => (
            <AnimatedNovelCard key={novel.id} novel={novel} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
