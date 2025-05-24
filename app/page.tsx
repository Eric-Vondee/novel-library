import type { Metadata } from 'next'
import { AnimatedHero } from '@/components/magicui/animated-hero'
import { AnimatedCard } from '@/components/magicui/animated-card'
import { BookOpen, Upload } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Welcome to your personal novel library. Browse your collection and discover new stories.',
}

export default function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <AnimatedHero
        title='Welcome to My Novel Bookshelf'
        description='A collection of my favorite novels, carefully curated and ready to be explored.'
        className='mb-12'
      />

      <div className='w-full max-w-4xl px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <AnimatedCard index={0}>
            <Link href='/novels' className='block p-6'>
              <BookOpen className='w-12 h-12 mx-auto mb-4 text-blue-600' />
              <h2 className='text-xl font-semibold mb-2 text-center'>Browse Novels</h2>
              <p className='text-gray-600 text-center'>
                View my collection of novels and start reading.
              </p>
            </Link>
          </AnimatedCard>

          <AnimatedCard index={1}>
            <Link href='/import' className='block p-6'>
              <Upload className='w-12 h-12 mx-auto mb-4 text-blue-600' />
              <h2 className='text-xl font-semibold mb-2 text-center'>Import Novels</h2>
              <p className='text-gray-600 text-center'>
                Help contribute to my library by importing novels from various sources.
              </p>
            </Link>
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
