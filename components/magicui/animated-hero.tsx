'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedHeroProps {
  title: string
  description: string
  className?: string
}

export function AnimatedHero({ title, description, className }: AnimatedHeroProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative z-10'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='text-4xl md:text-7xl font-bold tracking-tight text-center mb-6'>
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='text-xl text-muted-foreground text-center max-w-2xl mx-auto'>
          {description}
        </motion.p>
      </motion.div>

      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent' />
      </motion.div>
    </div>
  )
}
