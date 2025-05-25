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

export const maxDuration = 10 // Set max duration to 10 seconds

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
      args: [...chromium.args, '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    )

    // Set shorter timeouts
    page.setDefaultNavigationTimeout(15000)
    page.setDefaultTimeout(15000)

    try {
      await page.goto(cleanUrl, {
        waitUntil: 'domcontentloaded', // Changed from networkidle0 to domcontentloaded
        timeout: 15000,
      })
    } catch (error: any) {
      console.log('[Scrape] Navigation error:', error.message)
      throw new Error('Navigation timeout - the page took too long to load')
    }

    try {
      await page.waitForSelector('.seriestitlenu, .book-info h1', {
        timeout: 5000,
      })
    } catch (error: any) {
      console.log('[Scrape] Selector timeout:', error.message)
      throw new Error(
        'Could not find novel title. The page might be taking too long to load or the structure has changed.',
      )
    }

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
      console.log('[Scrape] Processing NovelUpdates page...')
      const title = $('.seriestitlenu').text().trim()
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
        synopsis: [description],
        source: 'NovelUpdates',
      }
    } else if (cleanUrl.includes('webnovel')) {
      console.log('[Scrape] Processing Webnovel page...')
      const title = $('.book-info h1').text().trim()
      const author = $('.author-name').text().trim()
      const status = $('.book-status').text().trim()
      const chapters = Number.parseInt($('.chapter-count').text().trim()) || 0
      const description = $('.book-intro').text().trim()
      const image = $('.book-cover img').attr('src') || ''

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
      return NextResponse.json({ error: 'Unsupported website' }, { status: 400 })
    }

    await browser.close()
    return NextResponse.json(scrapedData)
  } catch (error: any) {
    if (browser) await browser.close()
    console.log('[Scrape] Fatal error:', error.message)
    return NextResponse.json(
      {
        error: 'Failed to scrape data',
        details: error.message,
      },
      { status: 500 },
    )
  }
}
