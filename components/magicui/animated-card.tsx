'use client'

import { AnimatedWrapper } from './animated-wrapper'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  index?: number
}

export function AnimatedCard({ children, className, delay = 0, index }: AnimatedCardProps) {
  return (
    <AnimatedWrapper
      animation='fadeInUp'
      delay={index !== undefined ? index * 0.1 + delay : delay}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 shadow-lg transition-all hover:shadow-xl',
        className,
      )}>
      {children}
      {/* Animated background gradient */}
      <div className='absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity' />
    </AnimatedWrapper>
  )
}
