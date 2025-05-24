'use client'

import { useParams } from 'next/navigation'
import { ReactReader } from 'react-reader'
import { useTheme } from 'next-themes'
import { Loading } from './novel-reader-components/loader'
import ControlPanel from '@/components/novel-reader-components/control-panel'
import Navigation from '@/components/novel-reader-components/navigation'
import { useNovelReader } from './novel-reader-components/use-novel-reader'
import { useTts } from 'tts-react'
import { useEffect, useState, useCallback } from 'react'
import { ErrorBoundary } from './error-boundary'
import { BookLoadError } from '@/lib/epub-helper'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { PrismaClient } from '@prisma/client'

function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='text-center p-6 bg-background rounded-lg shadow-lg max-w-md'>
        <AlertCircle className='h-12 w-12 text-destructive mx-auto mb-4' />
        <h2 className='text-xl font-semibold mb-2'>Error Loading Book</h2>
        <p className='text-muted-foreground mb-4'>
          {error instanceof BookLoadError
            ? error.message
            : 'Failed to load the book. Please try again.'}
        </p>
        <Button onClick={reset} variant='default'>
          Try again
        </Button>
      </div>
    </div>
  )
}

export default function NovelReader() {
  const { filename } = useParams()
  const filenameString = Array.isArray(filename) ? filename[0] : filename
  const { theme } = useTheme()
  const [epubUrl, setEpubUrl] = useState<string>('')
  const [isLoadingUrl, setIsLoadingUrl] = useState(true)

  useEffect(() => {
    async function fetchEpubUrl() {
      try {
        const prisma = new PrismaClient()
        const novel = await prisma.novel.findFirst({
          where: {
            filename: {
              contains: filenameString,
            },
          },
        })
        await prisma.$disconnect()

        if (novel?.filename) {
          setEpubUrl(novel.filename)
        } else {
          throw new Error('Novel not found')
        }
      } catch (error) {
        console.error('Error fetching novel URL:', error)
      } finally {
        setIsLoadingUrl(false)
      }
    }

    fetchEpubUrl()
  }, [filenameString])

  const {
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
    handlePageChange,
    handleFontSizeChange,
    setRendition,
    customRendition,
  } = useNovelReader(filenameString)

  const getTextContent = () => {
    if (!customRendition) return ''
    const contents = customRendition.getContents()
    // @ts-expect-error ignore
    if (!contents || contents.length === 0) return ''
    // @ts-expect-error ignore
    const content = contents[0]
    return content.documentElement?.textContent || ''
  }

  const text = getTextContent()

  let voices: SpeechSynthesisVoice[] = []

  if (window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices()

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices()
      }
    }
  }

  const [lang, setLang] = useState<string | undefined>()
  const [rate, setRate] = useState(1)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>()

  useEffect(() => {
    if (!voices.length) {
      voices = window.speechSynthesis.getVoices()
    }
  }, [])

  const { state, play, stop, pause, playOrPause } = useTts({
    children: text || '',
    markTextAsSpoken: true,
    markBackgroundColor: '#55AD66',
    markColor: 'white',
    lang,
    voice,
    rate,
    onRateChange: (newRate: number) => {
      setRate(newRate)
    },
  })

  const handleRateChange = useCallback((newRate: number) => {
    setRate(newRate)
  }, [])

  const handleVoiceChange = useCallback((newVoice: SpeechSynthesisVoice) => {
    setVoice(newVoice)
    setLang(newVoice.lang)
  }, [])

  const handleToggleTTS = useCallback(() => {
    playOrPause()
  }, [playOrPause])

  if (isLoadingUrl) {
    return <Loading />
  }

  if (!epubUrl) {
    return (
      <div className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'>
        <div className='text-center p-6 bg-background rounded-lg shadow-lg max-w-md'>
          <AlertCircle className='h-12 w-12 text-destructive mx-auto mb-4' />
          <h2 className='text-xl font-semibold mb-2'>Error Loading Book</h2>
          <p className='text-muted-foreground mb-4'>Novel not found</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      {isLoading && <Loading />}
      <div className={`flex flex-col ${theme}`}>
        <div className='flex-grow md:container md:mx-auto max-w-7xl sm:px-6 lg:px-8 pt-8 pb-16 h-[calc(100vh - 60px)]'>
          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={handleLocationChanged}
            loadingView={<Loading />}
            styles={readerStyles}
            tocChanged={handleTocChange}
            showToc={false}
            epubInitOptions={{
              openAs: 'epub',
            }}
            epubOptions={{
              flow: 'scrolled-doc',
              resizeOnOrientationChange: true,
              allowPopups: true,
            }}
            // @ts-expect-error ignore
            readerStyles={{
              next: { display: 'none' },
              prev: { display: 'none' },
            }}
            getRendition={setRendition}
          />
          <Navigation handlePageChange={handlePageChange} />

          <ControlPanel
            isMenuExpanded={isMenuExpanded}
            toc={toc}
            currentChapter={currentChapter}
            onChapterChange={handleChapterChange}
            onToggleMenu={toggleMenu}
            onToggleTTS={handleToggleTTS}
            isSpeaking={isSpeaking}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            ttsState={state}
            ttsPlay={play}
            ttsPause={pause}
            ttsStop={stop}
            onRateChange={handleRateChange}
            onVoiceChange={handleVoiceChange}
            rate={rate}
            voice={voice}
            voices={voices}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}
