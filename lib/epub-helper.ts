import ePub, { type Book, type Rendition } from 'epubjs'

interface Metadata {
  title: string
  creator: string
  description: string
  publisher: string
  isbn: string
}

interface TocItem {
  id: string
  href: string
  label: string
  subitems?: TocItem[]
}

export class BookLoadError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public type: 'NETWORK' | 'TIMEOUT' | 'FORMAT' | 'UNKNOWN' = 'UNKNOWN',
  ) {
    super(message)
    this.name = 'BookLoadError'
  }
}

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> => {
  let retries = 0
  let delay = initialDelay

  while (true) {
    try {
      return await fn()
    } catch (error) {
      retries++
      if (retries >= maxRetries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
}

export const loadBook = async (url: string): Promise<Book> => {
  try {
    const book = ePub(url)

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new BookLoadError('Book loading timed out after 30 seconds', undefined, 'TIMEOUT'))
      }, 30000) // 30 second timeout
    })

    // Race between book loading and timeout with retry logic
    await retryWithBackoff(async () => {
      try {
        await Promise.race([book.ready, timeoutPromise])
        return book
      } catch (error) {
        if (error instanceof BookLoadError) {
          throw error
        }
        // Check for network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new BookLoadError('Network error while loading book', error, 'NETWORK')
        }
        // Check for format errors
        if (error instanceof Error && error.message.includes('EPUB')) {
          throw new BookLoadError('Invalid EPUB format', error, 'FORMAT')
        }
        throw new BookLoadError('Failed to load book', error, 'UNKNOWN')
      }
    })

    return book
  } catch (error) {
    if (error instanceof BookLoadError) {
      throw error
    }
    throw new BookLoadError('Failed to load book', error, 'UNKNOWN')
  }
}

export const getMetadata = async (book: Book): Promise<Metadata> => {
  const metadata = await book.loaded.metadata
  return {
    title: metadata.title,
    creator: metadata.creator,
    description: metadata.description,
    publisher: metadata.publisher,
    // @ts-expect-error: isbn is not defined in the type
    isbn: metadata.isbn,
  }
}

export const getTableOfContents = async (book: Book): Promise<TocItem[]> => {
  const toc = await book.loaded.navigation
  return toc.toc
}

export const getCurrentLocation = (rendition: Rendition): string => {
  const location = rendition.currentLocation()
  // @ts-expect-error: start is not defined in the type
  return location.start.cfi
}

export const setCurrentLocation = (rendition: Rendition, cfi: string): void => {
  rendition.display(cfi)
}

export const saveBookmark = (bookId: string, cfi: string): void => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  if (!bookmarks[bookId]) {
    bookmarks[bookId] = []
  }
  bookmarks[bookId].push(cfi)
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
}

export const getBookmarks = (bookId: string): string[] => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  return bookmarks[bookId] || []
}

export const removeBookmark = (bookId: string, cfi: string): void => {
  const bookmarks: Record<string, string[]> = JSON.parse(localStorage.getItem('bookmarks') || '{}')
  if (bookmarks[bookId]) {
    bookmarks[bookId] = bookmarks[bookId].filter((bookmark) => bookmark !== cfi)
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }
}

export const search = async (book: Book, query: string): Promise<unknown[]> => {
  // @ts-expect-error: search is not defined in the type
  const results = await book.search(query)
  return results
}

export const getChapter = async (book: Book, chapterId: string): Promise<unknown> => {
  const chapter = await book.spine.get(chapterId)
  return chapter
}

export const extractTextContent = async (book: Book, cfi: string): Promise<string> => {
  const range = await book.getRange(cfi)
  return range.toString()
}
