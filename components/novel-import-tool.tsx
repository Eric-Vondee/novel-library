'use client'

import type React from 'react'
import { useState } from 'react'
import { Upload, Download, BookOpen, Loader2, Plus, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

interface ScrapedData {
  title: string
  author: string
  status: string
  chapters: number
  image: string
  synopsis: string[]
  source: string
}

interface CustomData {
  title: string
  author: string
  status: string
  chapters: string
  synopsis: string[]
}

const NovelImportTool: React.FC = () => {
  const { theme } = useTheme()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [epubFile, setEpubFile] = useState<File | null>(null)
  const [customData, setCustomData] = useState<CustomData>({
    title: '',
    author: '',
    status: 'Ongoing',
    chapters: '',
    synopsis: [''],
  })

  const scrapeNovelData = async (novelUrl: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: novelUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape data')
      }

      const data = await response.json()
      setScrapedData(data)
      setCustomData({
        title: data.title,
        author: data.author,
        status: data.status,
        chapters: data.chapters.toString(),
        synopsis: data.synopsis,
      })
    } catch (error) {
      toast.error('Failed to scrape data. Please try again or enter the details manually.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (url.trim()) {
      scrapeNovelData(url)
    }
  }

  const handleEpubUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.name.endsWith('.epub')) {
      setEpubFile(file)
    } else {
      toast.error('Please upload a valid .epub file')
    }
  }

  const addSynopsisLine = () => {
    setCustomData((prev) => ({
      ...prev,
      synopsis: [...prev.synopsis, ''],
    }))
  }

  const removeSynopsisLine = (index: number) => {
    setCustomData((prev) => ({
      ...prev,
      synopsis: prev.synopsis.filter((_, i) => i !== index),
    }))
  }

  const updateSynopsisLine = (index: number, value: string) => {
    setCustomData((prev) => ({
      ...prev,
      synopsis: prev.synopsis.map((line, i) => (i === index ? value : line)),
    }))
  }

  const generateNovelObject = () => {
    return {
      title: customData.title,
      author: customData.author,
      status: customData.status,
      chapters: Number.parseInt(customData.chapters) || 0,
      image: scrapedData?.image || '/novels/images/default-cover.jpg',
      synopsis: customData.synopsis.filter((line) => line.trim() !== ''),
    }
  }

  const handleSaveNovel = async () => {
    const novelObject = generateNovelObject()

    if (!epubFile) {
      toast.error('Please upload an EPUB file')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', epubFile)
      formData.append('novelData', JSON.stringify(novelObject))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload novel')
      }

      await response.json()
      toast.success('Novel uploaded successfully!')

      // Reset the component
      setUrl('')
      setScrapedData(null)
      setEpubFile(null)
      setCustomData({
        title: '',
        author: '',
        status: 'Ongoing',
        chapters: '',
        synopsis: [''],
      })
    } catch (error) {
      toast.error('Failed to upload novel. Please try again.')
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 bg-card rounded-lg shadow-lg'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-2'>Novel Import Tool</h1>
        <p className='text-muted-foreground'>
          Scrape novel data from popular sites and upload your epub files
        </p>
      </div>

      {/* URL Input Section */}
      <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-muted/50 rounded-lg'>
        <h2 className='text-lg sm:text-xl font-semibold mb-4 flex items-center text-foreground'>
          <Download className='mr-2' size={20} />
          Scrape Novel Data
        </h2>
        <div className='flex flex-col sm:flex-row gap-4'>
          <input
            type='url'
            id='novel-url'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='Enter novel URL (NovelUpdates, Webnovel, etc.)'
            className='flex-1 px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground'
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <button
            type='button'
            onClick={handleUrlSubmit}
            disabled={isLoading || !url.trim()}
            className='px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'>
            {isLoading ? (
              <Loader2 className='animate-spin mr-2' size={16} />
            ) : (
              <Download className='mr-2' size={16} />
            )}
            {isLoading ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
        <div className='mt-2 text-sm text-muted-foreground'>
          Supported sites: NovelUpdates for now
        </div>
      </div>

      {/* EPUB Upload Section */}
      <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-muted/50 rounded-lg'>
        <h2 className='text-lg sm:text-xl font-semibold mb-4 flex items-center text-foreground'>
          <Upload className='mr-2' size={20} />
          Upload EPUB File
        </h2>
        <div className='flex items-center gap-4'>
          <label htmlFor='epub-upload' className='flex-1'>
            <input
              id='epub-upload'
              type='file'
              accept='.epub'
              onChange={handleEpubUpload}
              className='hidden'
            />
            <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 sm:p-6 text-center hover:border-primary cursor-pointer transition-colors'>
              {epubFile ? (
                <div className='flex items-center justify-center text-primary'>
                  <BookOpen className='mr-2' size={20} />
                  <span className='truncate'>{epubFile.name}</span>
                </div>
              ) : (
                <div className='text-muted-foreground'>
                  <Upload className='mx-auto mb-2' size={24} />
                  Click to upload .epub file
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Manual/Edit Data Section */}
      {(scrapedData || customData.title) && (
        <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-muted/50 rounded-lg'>
          <h2 className='text-lg sm:text-xl font-semibold mb-4 text-foreground'>
            Edit Novel Information
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
            <div>
              <label
                htmlFor='novel-title'
                className='block text-sm font-medium text-foreground mb-1'>
                Title
              </label>
              <input
                id='novel-title'
                type='text'
                value={customData.title}
                onChange={(e) => setCustomData((prev) => ({ ...prev, title: e.target.value }))}
                className='w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground'
              />
            </div>
            <div>
              <label
                htmlFor='novel-author'
                className='block text-sm font-medium text-foreground mb-1'>
                Author
              </label>
              <input
                id='novel-author'
                type='text'
                value={customData.author}
                onChange={(e) => setCustomData((prev) => ({ ...prev, author: e.target.value }))}
                className='w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground'
              />
            </div>
            <div>
              <label
                htmlFor='novel-status'
                className='block text-sm font-medium text-foreground mb-1'>
                Status
              </label>
              <select
                id='novel-status'
                value={customData.status}
                onChange={(e) => setCustomData((prev) => ({ ...prev, status: e.target.value }))}
                className='w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground'>
                <option value='Ongoing'>Ongoing</option>
                <option value='Completed'>Completed</option>
                <option value='Dropped'>Dropped</option>
                <option value='Hiatus'>Hiatus</option>
              </select>
            </div>
            <div>
              <label
                htmlFor='novel-chapters'
                className='block text-sm font-medium text-foreground mb-1'>
                Chapters
              </label>
              <input
                id='novel-chapters'
                type='number'
                value={customData.chapters}
                onChange={(e) => setCustomData((prev) => ({ ...prev, chapters: e.target.value }))}
                className='w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground'
              />
            </div>
          </div>

          <div className='mb-4'>
            <label
              htmlFor='synopsis-section'
              className='block text-sm font-medium text-foreground mb-2'>
              Synopsis
            </label>
            {customData.synopsis.map((line, index) => (
              <div key={`synopsis-${index}-${line.substring(0, 10)}`} className='flex gap-2 mb-2'>
                <textarea
                  id={`synopsis-${index}`}
                  value={line}
                  onChange={(e) => updateSynopsisLine(index, e.target.value)}
                  placeholder='Enter synopsis paragraph...'
                  rows={4}
                  className='flex-1 px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground'
                />
                {customData.synopsis.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeSynopsisLine(index)}
                    className='px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg'>
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={addSynopsisLine}
              className='flex items-center text-primary hover:text-primary/90'>
              <Plus size={16} className='mr-1' />
              Add Synopsis Line
            </button>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {scrapedData && (
        <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-primary/5 rounded-lg'>
          <h2 className='text-lg sm:text-xl font-semibold mb-4 text-foreground'>Preview</h2>
          <div className='flex flex-col sm:flex-row gap-4'>
            {scrapedData.image && (
              <img
                src={scrapedData.image}
                alt={customData.title}
                className='w-24 h-32 object-cover rounded-lg mx-auto sm:mx-0'
              />
            )}
            <div className='flex-1 text-center sm:text-left'>
              <h3 className='text-lg font-bold text-foreground'>{customData.title}</h3>
              <p className='text-muted-foreground'>by {customData.author}</p>
              <p className='text-sm text-muted-foreground'>
                {customData.status} • {customData.chapters} chapters
              </p>
              <p className='text-sm mt-2 text-foreground'>{customData.synopsis[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {(scrapedData || customData.title) && (
        <div className='flex justify-center sm:justify-end'>
          <button
            type='button'
            onClick={handleSaveNovel}
            className='w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center text-lg font-medium'>
            <BookOpen className='mr-2' size={20} />
            Save Novel
          </button>
        </div>
      )}
    </div>
  )
}

export default NovelImportTool
