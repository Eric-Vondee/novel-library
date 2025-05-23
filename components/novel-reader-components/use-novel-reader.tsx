/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react'
import { updateTheme } from '@/components/novel-reader-components/theme'
import type { FontSize } from '@/components/novel-reader-components/theme'
import type { IReactReaderStyle } from 'react-reader'
import { ReactReaderStyle } from 'react-reader'
import type { Rendition } from 'epubjs'
import { useTheme } from 'next-themes'
import type { Theme } from '@/components/theme-provider'

export function useNovelReader(filename: string | undefined) {
  const { theme } = useTheme()
  const currentTheme: Theme = theme === 'dark' ? 'dark' : 'light'
  const [location, setLocation] = useState<string | number>(0)
  const renditionRef = useRef<any>(null)
  const [toc, setToc] = useState<any[]>([])
  const [customRendition, setCustomRendition] = useState<Rendition | null>(null)
  const [currentChapter, setCurrentChapter] = useState<string>('')
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fontSize') as FontSize) || '100%'
    }
    return '100%'
  })

  useEffect(() => {
    if (filename) {
      const savedLocation = localStorage.getItem(`bookLocation_${filename}`)
      if (savedLocation) {
        setLocation(savedLocation)
      }
    }
  }, [filename, toc])

  const getCurrentLocation = useCallback(() => {
    if (renditionRef.current && !isLoading) {
      return renditionRef.current.location?.start?.href || null
    }
    return null
  }, [isLoading])

  useEffect(() => {
    if (renditionRef.current) {
      updateTheme(renditionRef.current, currentTheme, fontSize)
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', fontSize)
    }
  }, [currentTheme, fontSize])

  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(fontSize)
    }
  }, [fontSize])

  const handleLocationChanged = useCallback(
    (newLocation: string) => {
      setLocation(newLocation)
      if (filename) {
        localStorage.setItem(`bookLocation_${filename}`, newLocation)
      }
    },
    [filename],
  )

  const handleTocChange = useCallback((newToc: any[]) => {
    setToc(newToc)
  }, [])

  const handleChapterChange = useCallback((href: string) => {
    setLocation(href)
    setCurrentChapter(href)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuExpanded((prev) => !prev)
    setCurrentChapter(getCurrentLocation())
  }, [getCurrentLocation])

  const speak = useCallback(() => {
    setIsSpeaking((prev) => !prev)
  }, [])

  const handlePageChange = useCallback((direction: 'prev' | 'next') => {
    if (renditionRef.current) {
      if (direction === 'prev') {
        renditionRef.current.prev()
      } else {
        renditionRef.current.next()
      }
    }
  }, [])

  const readerStyles: IReactReaderStyle = {
    ...ReactReaderStyle,
    readerArea: {
      ...ReactReaderStyle.readerArea,
      backgroundColor: currentTheme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: currentTheme === 'dark' ? '#ffffff' : '#000000',
    },
  }

  const handleFontSizeChange = useCallback((newSize: FontSize) => {
    setFontSize(newSize)
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', newSize)
    }
  }, [])

  const setRendition = useCallback(
    (rendition: any) => {
      updateTheme(rendition, currentTheme, fontSize)
      renditionRef.current = rendition
      setCustomRendition(rendition)
      setIsLoading(false)
    },
    [currentTheme, fontSize],
  )

  return {
    location,
    toc,
    currentChapter,
    isMenuExpanded,
    isLoading,
    isSpeaking,
    fontSize,
    readerStyles,
    handleLocationChanged,
    handleTocChange,
    handleChapterChange,
    toggleMenu,
    speak,
    handlePageChange,
    handleFontSizeChange,
    setRendition,
    setIsLoading,
    customRendition,
    renditionRef,
  }
}
