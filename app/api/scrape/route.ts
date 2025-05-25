import { NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer, { type Browser } from 'puppeteer-core'
import * as cheerio from 'cheerio'

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

export const maxDuration = 8 // Reduced to 8 seconds to ensure we have time to clean up

export async function POST(request: Request) {
  let browser: Browser | null = null
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Remove any comment page or other parameters from the URL
    const cleanUrl = url.split('/comment-page-')[0].split('?')[0]

    // Launch browser with @sparticuz/chromium
    const executablePath = await chromium.executablePath()
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Set very aggressive timeouts
    page.setDefaultNavigationTimeout(8000)
    page.setDefaultTimeout(8000)

    // Block unnecessary resources
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      const resourceType = request.resourceType()
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort()
      } else {
        request.continue()
      }
    })

    try {
      await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 8000,
      })
    } catch (error: any) {
      throw new Error('Navigation timeout - the page took too long to load')
    }

    try {
      await page.waitForSelector('.seriestitlenu, .book-info h1', {
        timeout: 3000,
      })
    } catch (error: any) {
      throw new Error('Could not find novel title - page structure might have changed')
    }

    const content = await page.content()
    const $ = cheerio.load(content)

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
      const title = $('.seriestitlenu').text().trim()
      if (!title) {
        throw new Error('Could not find novel title')
      }

      const author = $('#authtag')
        .text()
        .trim()
        .replace(/\s*,\s*/g, ' - ')
      const statusText = $('#editstatus').text().trim()
      const status = statusText.includes('Completed') ? 'Completed' : 'Ongoing'
      const chapterMatch = statusText.match(/(\d+)\s+Chapters/)
      const chapters = chapterMatch ? Number.parseInt(chapterMatch[1]) : 0
      const description = $('#editdescription').text().trim()
      const image = $('.seriesimg img').attr('src') || ''

      scrapedData = {
        title,
        author,
        status,
        chapters,
        description,
        image,
        synopsis: [description],
        source: 'NovelUpdates',
      }
    } else if (cleanUrl.includes('webnovel')) {
      const title = $('.book-info h1').text().trim()
      if (!title) {
        throw new Error('Could not find novel title')
      }

      const author = $('.author-name').text().trim()
      const status = $('.book-status').text().trim()
      const chapters = Number.parseInt($('.chapter-count').text().trim()) || 0
      const description = $('.book-intro').text().trim()
      const image = $('.book-cover img').attr('src') || ''

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
      return NextResponse.json({ error: 'Unsupported website' }, { status: 400 })
    }

    await browser.close()
    return NextResponse.json(scrapedData)
  } catch (error: any) {
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    return NextResponse.json(
      {
        error: 'Failed to scrape data',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
