'use client'

import { AnimatedWrapper } from './animated-wrapper'
import { cn } from '@/lib/utils'

interface AnimatedContentProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scale' | 'fadeInUp'
}

export function AnimatedContent({
  children,
  className,
  delay = 0,
  animation = 'slideIn',
}: AnimatedContentProps) {
  return (
    <AnimatedWrapper animation={animation} delay={delay} className={cn('min-w-0', className)}>
      {children}
    </AnimatedWrapper>
  )
}
