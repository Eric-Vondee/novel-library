'use client'

import { ModeToggle } from '@/components/mode-toggler'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export default function Header() {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <header className={` backdrop-blur-sm shadow-sm transition-colors`}>
      <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
        <h1 className={`text-3xl font-bold $font-heading transition-colors`}>
          <Link href='/'>Novel-Land</Link>
        </h1>
        <nav className='flex items-center space-x-4'>
          <ul className='flex space-x-4'>
            <li>
              <Link
                href='/'
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Home
              </Link>
            </li>
            <li>
              <Link
                href='/novels'
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Novels
              </Link>
            </li>
          </ul>
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
