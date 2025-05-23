'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { AnimatedContent } from './animated-content'
import Link from 'next/link'

interface NovelSynopsisDialogProps {
  title: string
  author: string
  synopsis: string[]
  filename: string
  image?: string
  trigger: React.ReactNode
}

export function NovelSynopsisDialog({
  title,
  author,
  synopsis,
  filename,
  image,
  trigger,
}: NovelSynopsisDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex gap-6'>
            <div className='w-1/3 flex-shrink-0'>
              {image ? (
                <div className='relative aspect-[2/3]'>
                  <img
                    src={image}
                    alt={title}
                    className='absolute inset-0 h-full w-full object-cover rounded-lg'
                  />
                </div>
              ) : (
                <div className='aspect-[2/3] flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg p-4'>
                  <h3 className='text-foreground text-center font-bold text-sm break-words'>
                    {title}
                  </h3>
                </div>
              )}
            </div>

            <div className='flex-1'>
              <DialogTitle className='text-2xl'>{title}</DialogTitle>
              <p className='text-muted-foreground'>{author}</p>
            </div>
          </div>
        </DialogHeader>

        <AnimatedContent>
          <div className='mt-6 space-y-4'>
            {synopsis.map((paragraph, i) => (
              <p key={i} className='text-muted-foreground'>
                {paragraph}
              </p>
            ))}
          </div>
        </AnimatedContent>

        <DialogFooter className='mt-6 flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
          <Button asChild variant='default' className='w-full sm:w-auto'>
            <Link href={`/reader/${filename}`}>Start Reading</Link>
          </Button>
          <Button asChild variant='outline' className='w-full sm:w-auto'>
            <a href={`/novels/${filename}`} download>
              <Download className='h-4 w-4 mr-2' />
              Download
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
