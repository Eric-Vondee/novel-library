'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface AnimatedFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
  className?: string
}

export function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  index,
  className,
}: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-lg transition-all hover:shadow-xl',
        className,
      )}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
        className='mb-4 text-primary'>
        <Icon className='h-8 w-8' />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        className='text-xl font-bold mb-2'>
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
        className='text-muted-foreground'>
        {description}
      </motion.p>

      {/* Animated background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
        className='absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity'
      />
    </motion.div>
  )
}
