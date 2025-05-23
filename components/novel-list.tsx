import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { BookOpen } from 'lucide-react'
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

interface NovelListProps {
  novels: Novel[]
}

function NovelList({ novels }: NovelListProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
      {novels.map(renderNovelCard)}
    </div>
  )
}

function NovelCover({ title, image }: { title: string; image?: string }) {
  const gradientAlt = (
    <div className='w-full aspect-[3/4] rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 p-4'>
      <h3 className='text-foreground text-center font-bold text-lg break-words'>{title}</h3>
    </div>
  )

  if (image) {
    return (
      <div className='w-full aspect-[3/4] relative group'>
        <img
          src={image}
          alt={title}
          className='rounded-lg object-cover w-full h-full absolute inset-0 transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallbackDiv = document.createElement('div')
            fallbackDiv.className =
              'w-full aspect-[3/4] rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 p-4'
            fallbackDiv.innerHTML = `<h3 class="text-foreground text-center font-bold text-lg break-words">${title}</h3>`
            e.currentTarget.parentElement?.appendChild(fallbackDiv)
          }}
        />
        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg' />
      </div>
    )
  }

  return gradientAlt
}

function renderNovelCard(novel: Novel) {
  const truncatedSynopsis =
    novel.synopsis[0].slice(0, 100) + (novel.synopsis[0].length > 100 ? '...' : '')

  return (
    <div
      key={novel.id}
      className='group border rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-6 bg-card hover:bg-accent/50'>
      <div>
        <div className='mb-6 w-full overflow-hidden rounded-lg'>
          <NovelCover title={novel.title} image={novel.image} />
        </div>
        <h2 className='text-xl font-bold mb-2 font-heading group-hover:text-primary transition-colors'>
          {novel.title}
        </h2>
        <p className='text-muted-foreground mb-2'>{novel.author}</p>
        <div className='flex items-center gap-4 text-sm mb-4'>
          <span className='flex items-center gap-1'>
            <BookOpen className='h-4 w-4' />
            {novel.chapters} Chapters
          </span>
          <span
            className={`flex items-center gap-1 ${
              novel.status === 'Completed' ? 'text-green-500' : 'text-red-500'
            }`}>
            {novel.status}
          </span>
        </div>
        <p className='text-sm mb-4 text-muted-foreground'>
          {truncatedSynopsis}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='link' className='p-0 h-auto font-normal underline italic'>
                Read more
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle className='text-2xl'>{novel.title}</DialogTitle>
                <p className='text-muted-foreground'>{novel.author}</p>
              </DialogHeader>
              <div className='mt-4 space-y-4'>
                {novel.synopsis.map((paragraph, index) => (
                  <p key={index} className='text-muted-foreground'>
                    {paragraph}
                  </p>
                ))}
              </div>
              <DialogFooter className='mt-6 flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
                <Button asChild variant='default' className='w-full sm:w-auto'>
                  <Link href={`/reader/${novel.filename}`}>Start Reading</Link>
                </Button>
                <Button asChild variant='outline' className='w-full sm:w-auto'>
                  <a href={`/novels/${novel.filename}`} download>
                    Download
                  </a>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </p>
      </div>
      <div className='flex justify-between gap-4 items-end'>
        <Button asChild variant='default' className='w-full'>
          <Link href={`/reader/${novel.filename}`}>Read</Link>
        </Button>
        <Button asChild variant='outline' className='w-full'>
          <a href={`/novels/${novel.filename}`} download>
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}

export default NovelList
