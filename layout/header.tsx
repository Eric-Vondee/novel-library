'use client'

import { ModeToggle } from '@/components/mode-toggler'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Upload, Home } from 'lucide-react'

export default function Header() {
  const { theme } = useTheme()
  const pathname = usePathname()
  const isDarkMode = theme === 'dark'

  const isActive = (path: string) => pathname === path

  return (
    <header className='bg-white dark:bg-[#121212] shadow-sm transition-colors'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>
            <Link
              href='/'
              className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
              Novel Library
            </Link>
          </h1>
          <nav className='flex items-center gap-4'>
            <div className='flex gap-4'>
              <Link
                href='/'
                className={`inline-flex items-center px-1  border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}>
                <Home className='mr-2' size={16} />
                Home
              </Link>
              <Link
                href='/novels'
                className={`inline-flex items-center px-1  border-b-2 text-sm font-medium ${
                  isActive('/novels')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}>
                <BookOpen className='mr-2' size={16} />
                Novels
              </Link>
              <Link
                href='/import'
                className={`inline-flex items-center px-1  border-b-2 text-sm font-medium ${
                  isActive('/import')
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}>
                <Upload className='mr-2' size={16} />
                Import
              </Link>
            </div>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
