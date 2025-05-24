import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import { PrismaClient } from '@prisma/client'

interface NovelData {
  title: string
  author: string
  status: string
  chapters: number
  description?: string
  image: string
  synopsis: string[]
  filename?: string
  id?: number
}

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const novelData = JSON.parse(formData.get('novelData') as string)

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Ensure required directories exist
    const novelsDir = join(process.cwd(), 'public', 'novels')
    const imagesDir = join(novelsDir, 'images')
    const dataDir = join(process.cwd(), 'data')

    try {
      await fs.access(novelsDir)
    } catch {
      await mkdir(novelsDir, { recursive: true })
    }

    try {
      await fs.access(imagesDir)
    } catch {
      await mkdir(imagesDir, { recursive: true })
    }

    try {
      await fs.access(dataDir)
    } catch {
      await mkdir(dataDir, { recursive: true })
    }

    // Create a unique filename
    const filename = `${novelData.title
      .split(/[^a-z0-9]+/gi)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-')}.epub`

    // Create the novel in the database
    const novel = await prisma.novel.create({
      data: {
        title: novelData.title,
        author: novelData.author,
        filename: filename,
        image: novelData.image,
        description: novelData.description || 'No description available.',
        status: novelData.status,
        chapters: novelData.chapters,
        synopsis: {
          create: novelData.synopsis.map((content: string, index: number) => ({
            content,
            orderIndex: index,
          })),
        },
      },
      include: {
        synopsis: true,
      },
    })

    // Save the EPUB file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const epubPath = join(novelsDir, filename)
    await writeFile(epubPath, buffer)

    // Download and save the cover image
    if (novelData.image) {
      try {
        const imageResponse = await fetch(novelData.image)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
        }
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
        const imageExt = novelData.image.split('.').pop() || 'jpg'
        const imageFilename = `${novelData.title
          .split(/[^a-z0-9]+/gi)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('-')}.${imageExt}`
        const imagePath = join(imagesDir, imageFilename)
        await writeFile(imagePath, imageBuffer)
      } catch (error) {
        console.error('Error saving image:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Novel uploaded successfully',
      novel,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload novel',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
