import Layout from '@/layout/layout'
import { AnimatedHero } from '@/components/magicui/animated-hero'
import { AnimatedNovelCard } from '@/components/magicui/animated-novel-card'
import { novels } from '@/data/novel-list'

export default function Novels() {
  return (
    <Layout>
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
    </Layout>
  )
}
