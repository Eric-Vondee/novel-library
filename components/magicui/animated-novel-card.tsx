'use client'

import { motion } from 'framer-motion'
import { BookOpen, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { AnimatedCard } from './animated-card'
import { AnimatedContent } from './animated-content'
import { NovelSynopsisDialog } from './novel-synopsis-dialog'
import Link from 'next/link'

interface Novel {
  id: number
  title: string
  author: string
  filename: string
  image?: string
  description: string
  status: string
  chapters: number
  synopsis: string[]
}

interface AnimatedNovelCardProps {
  novel: Novel
  index: number
}

function NovelCover({ title, image }: { title: string; image?: string }) {
  const gradientAlt = (
    <div className='w-full aspect-[2/3] rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 p-4'>
      <h3 className='text-foreground text-center font-bold text-sm break-words'>{title}</h3>
    </div>
  )

  if (image) {
    return (
      <div className='w-full aspect-[2/3] relative group'>
        <img
          src={image}
          alt={title}
          className='w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallbackDiv = document.createElement('div')
            fallbackDiv.className =
              'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg p-4'
            fallbackDiv.innerHTML = `<h3 class="text-foreground text-center font-bold text-sm break-words">${title}</h3>`
            e.currentTarget.parentElement?.appendChild(fallbackDiv)
          }}
        />
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg' />
      </div>
    )
  }

  return gradientAlt
}

export function AnimatedNovelCard({ novel, index }: AnimatedNovelCardProps) {
  const truncatedSynopsis =
    novel.synopsis[0].slice(0, 100) + (novel.synopsis[0].length > 100 ? '...' : '')

  return (
    <AnimatedCard index={index}>
      <div className='flex gap-5'>
        {/* Cover Image */}
        <AnimatedContent animation='scale' delay={0.2}>
          <div className='w-[120px] flex-shrink-0'>
            <NovelCover title={novel.title} image={novel.image} />
          </div>
        </AnimatedContent>

        {/* Content - 3/4 width */}
        <div className='flex-1 min-w-0 space-y-2'>
          <AnimatedContent delay={0.3}>
            <div>
              <h2 className='text-lg font-bold group-hover:text-primary transition-colors truncate'>
                {novel.title}
              </h2>

              <p className='text-sm text-muted-foreground truncate'>{novel.author}</p>
            </div>
          </AnimatedContent>

          <AnimatedContent delay={0.5}>
            <div className='flex items-center gap-3 text-xs'>
              <span className='flex items-center gap-1'>
                <BookOpen className='h-3 w-3' />
                {novel.chapters} Chapters
              </span>
              <span
                className={`flex items-center gap-1 ${
                  novel.status === 'Completed' ? 'text-green-500' : 'text-red-500'
                }`}>
                {novel.status}
              </span>
            </div>
          </AnimatedContent>

          <div className='space-y-1'>
            <AnimatedContent delay={0.6}>
              <p className='text-sm text-muted-foreground line-clamp-2'>{truncatedSynopsis}</p>
            </AnimatedContent>

            <NovelSynopsisDialog
              title={novel.title}
              author={novel.author}
              synopsis={novel.synopsis}
              filename={novel.filename}
              image={novel.image}
              trigger={
                <Button
                  variant='link'
                  className='p-0 h-auto text-xs font-normal hover:text-primary'>
                  Read more
                </Button>
              }
            />
          </div>

          {/* Action Buttons */}
          <AnimatedContent delay={0.7}>
            <div className='flex gap-2 pt-1'>
              <Button asChild variant='default' size='sm' className='flex-1'>
                <Link href={`/reader/${novel.filename}`}>Read</Link>
              </Button>
              <Button asChild variant='outline' size='sm' className='flex-1'>
                <a href={`/novels/${novel.filename}`} download>
                  <Download className='h-3 w-3 mr-1' />
                  Download
                </a>
              </Button>
            </div>
          </AnimatedContent>
        </div>
      </div>

      {/* Animated background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
        className='absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity'
      />
    </AnimatedCard>
  )
}
