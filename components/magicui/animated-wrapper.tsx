'use client'

import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scale' | 'fadeInUp'
  whileHover?: boolean
  whileTap?: boolean
}

const animations: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: { scale: 1.02 },
  },
}

export function AnimatedWrapper({
  children,
  className,
  delay = 0,
  animation = 'fadeIn',
  whileHover,
  whileTap,
}: AnimatedWrapperProps) {
  return (
    <motion.div
      initial='initial'
      animate='animate'
      whileHover={whileHover ? 'whileHover' : undefined}
      whileTap={whileTap ? 'whileTap' : undefined}
      variants={animations[animation]}
      transition={{ duration: 0.5, delay }}
      className={cn(className)}>
      {children}
    </motion.div>
  )
}
