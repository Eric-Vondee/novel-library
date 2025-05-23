import { AnimatedHero } from '@/components/magicui/animated-hero'
import { AnimatedCard } from '@/components/magicui/animated-card'
import Layout from '@/layout/layout'
import { Button } from '@/components/ui/button'
import { BookOpen, Share2, Clock, Heart } from 'lucide-react'
import { AnimatedContent } from '@/components/magicui/animated-content'
import Link from 'next/link'

export default function Root() {
  return (
    <Layout>
      <div className='max-w-5xl mx-auto py-16 px-4'>
        <AnimatedHero
          title='My Digital Bookshelf'
          description='Welcome to my personal corner of the internet! This is where I keep all my favorite novels in one convenient place.'
          className='mb-16'
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
          <AnimatedCard index={0}>
            <FeatureItem
              icon={<BookOpen className='h-8 w-8 mb-4' />}
              title='My Collection'
              description="This is where I store all the books I love. It's like having my own personal library, always at my fingertips."
            />
          </AnimatedCard>
          <AnimatedCard index={1}>
            <FeatureItem
              icon={<Clock className='h-8 w-8 mb-4' />}
              title='Read Anywhere'
              description="I can access my books anytime, anywhere. Perfect for when I'm traveling or just lounging at home."
            />
          </AnimatedCard>
          <AnimatedCard index={2}>
            <FeatureItem
              icon={<Share2 className='h-8 w-8 mb-4' />}
              title='Easy Sharing'
              description="When I find a book I really love, I can easily share it with my friends. It's a great way to spread the joy of reading."
            />
          </AnimatedCard>
          <AnimatedCard index={3}>
            <FeatureItem
              icon={<Heart className='h-8 w-8 mb-4' />}
              title='My Reading Journey'
              description='This bookshelf is a reflection of my reading journey. Each book here has a special place in my heart and mind.'
            />
          </AnimatedCard>
        </div>

        <AnimatedContent delay={0.8}>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-lg text-secondary-foreground mb-4 text-center max-w-2xl'>
              Feel free to browse through my collection. If you see something you'd like to read,
              just let me know!
            </p>
            <Button asChild size='lg' className='text-lg px-8'>
              <Link href='/novels'>Browse Collection</Link>
            </Button>
          </div>
        </AnimatedContent>
      </div>
    </Layout>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className='duration-300 rounded-xl p-8 shadow-lg hover:shadow-xl'>
      <div className='text-primary'>{icon}</div>
      <h2 className='text-2xl font-bold mb-3 font-heading'>{title}</h2>
      <p className='text-secondary-foreground'>{description}</p>
    </div>
  )
}
