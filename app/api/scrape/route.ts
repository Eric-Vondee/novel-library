import { NextResponse } from 'next/server'
import puppeteer, { type Browser } from 'puppeteer'
import * as cheerio from 'cheerio'
import { toast } from 'sonner'

interface ScrapedData {
  title: string
  author: string
  status: string
  chapters: number
  description: string
  image: string
  synopsis: string[]
  source: string
}

export async function POST(request: Request) {
  let browser: Browser | undefined
  try {
    const { url } = await request.json()
    console.log('Received scrape request for URL:', url)

    if (!url) {
      toast.error('URL is required')
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Remove any comment page or other parameters from the URL
    const cleanUrl = url.split('/comment-page-')[0].split('?')[0]
    console.log('Cleaned URL:', cleanUrl)

    try {
      console.log('Launching browser...')
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      const page = await browser.newPage()

      // Set a realistic viewport
      await page.setViewport({ width: 1280, height: 800 })

      // Set user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      )

      console.log('Navigating to page...')
      await page.goto(cleanUrl, { waitUntil: 'networkidle0', timeout: 30000 })

      // Wait for the content to load
      await page.waitForSelector('.seriestitlenu, .book-info h1', { timeout: 5000 })

      console.log('Getting page content...')
      const content = await page.content()
      const $ = cheerio.load(content)

      // Different scraping logic based on the website
      let scrapedData: ScrapedData = {
        title: '',
        author: '',
        status: '',
        chapters: 0,
        description: '',
        image: '',
        synopsis: [],
        source: '',
      }

      if (cleanUrl.includes('novelupdates')) {
        console.log('Scraping NovelUpdates page')
        const title = $('.seriestitlenu').text().trim()
        const author = $('#authtag')
          .text()
          .trim()
          .replace(/\s*,\s*/g, ' - ')
        const statusText = $('#editstatus').text().trim()
        const status = statusText.includes('Completed') ? 'Completed' : 'Ongoing'

        // Extract chapter count from status text (e.g., "1260 Chapters (Completed)" or "786 Chapters (Ongoing)")
        const chapterMatch = statusText.match(/(\d+)\s+Chapters/)
        const chapters = chapterMatch ? Number.parseInt(chapterMatch[1]) : 0

        const description = $('#editdescription').text().trim()
        const image = $('.seriesimg img').attr('src') || ''

        console.log('Scraped data:', { title, author, status, chapters, image, description })

        if (!title) {
          throw new Error(
            'Could not find novel title. The page structure might have changed or the URL might be incorrect.',
          )
        }

        scrapedData = {
          title,
          author,
          status,
          chapters,
          description,
          image,
          synopsis: [description], // Use the same text as description
          source: 'NovelUpdates',
        }
      } else if (cleanUrl.includes('webnovel')) {
        console.log('Scraping Webnovel page')
        const title = $('.book-info h1').text().trim()
        const author = $('.author-name').text().trim()
        const status = $('.book-status').text().trim()
        const chapters = Number.parseInt($('.chapter-count').text().trim()) || 0
        const description = $('.book-intro').text().trim()
        const image = $('.book-cover img').attr('src') || ''

        console.log('Scraped data:', { title, author, status, chapters, image })

        if (!title) {
          throw new Error(
            'Could not find novel title. The page structure might have changed or the URL might be incorrect.',
          )
        }

        scrapedData = {
          title,
          author,
          status,
          chapters,
          description,
          image,
          synopsis: description.split('\n').filter((line: string) => line.trim()),
          source: 'Webnovel',
        }
      } else {
        toast.error('Unsupported website')
        return NextResponse.json({ error: 'Unsupported website' }, { status: 400 })
      }

      toast.success('Successfully scraped novel data')
      return NextResponse.json(scrapedData)
    } catch (error: any) {
      console.error('Scraping error:', {
        message: error.message,
        stack: error.stack,
      })

      if (error.message.includes('net::ERR_ACCESS_DENIED') || error.message.includes('403')) {
        toast.error('Access denied by the website')
        return NextResponse.json(
          {
            error: 'Access denied by the website. The website may be blocking automated requests.',
            details: 'Try using a different URL or website.',
          },
          { status: 403 },
        )
      }

      toast.error('Failed to scrape data')
      return NextResponse.json(
        {
          error: 'Failed to scrape data',
          details: error.message,
        },
        { status: 500 },
      )
    } finally {
      if (browser) {
        console.log('Closing browser...')
        await browser.close()
      }
    }
  } catch (error: any) {
    console.error('General error:', error)
    toast.error('Failed to scrape data')
    return NextResponse.json(
      {
        error: 'Failed to scrape data',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
