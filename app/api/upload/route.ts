import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { promises as fs } from 'node:fs'
import { PrismaClient } from '@prisma/client'
import { CloudinaryService } from '@/lib/cloudinary'
import { toast } from 'sonner'

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
const cloudinaryService = new CloudinaryService()
const CLOUDINARY_MAX_SIZE = 10 * 1024 * 1024 // 10MB in bytes
const LOCAL_MAX_SIZE = 20 * 1024 * 1024 // 20MB in bytes

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const novelData = JSON.parse(formData.get('novelData') as string)

    if (!file) {
      toast.error('No file uploaded')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size
    const fileSize = file.size
    if (fileSize > LOCAL_MAX_SIZE) {
      const errorMessage = `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of 20MB`
      toast.error(errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 400 })
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

    // Handle image upload to Cloudinary
    let imageUrl = '/novels/images/default-cover.jpg'
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

        // Save image temporarily
        const tempImagePath = join(imagesDir, imageFilename)
        await writeFile(tempImagePath, imageBuffer)

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadFile(tempImagePath, imageFilename, true)
        imageUrl = cloudinaryService.getDownloadUrl(result.public_id, true)

        // Clean up temp image file
        await unlink(tempImagePath)
      } catch (error) {
        console.error('Error handling image:', error)
        toast.error('Failed to process cover image')
      }
    }

    // Handle EPUB file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const epubPath = join(novelsDir, filename)
    await writeFile(epubPath, buffer)

    let downloadUrl = `/novels/${filename}`
    // If file is under Cloudinary size limit, upload to Cloudinary
    if (fileSize <= CLOUDINARY_MAX_SIZE) {
      try {
        const result = await cloudinaryService.uploadFile(epubPath, filename)
        downloadUrl = cloudinaryService.getDownloadUrl(result.public_id)
        // Clean up local file after successful upload
        await unlink(epubPath)
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error)
        toast.error('Failed to upload to Cloudinary, keeping local file')
      }
    } else {
      console.log(
        `File size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds Cloudinary limit, storing locally`,
      )
    }

    // Create the novel in the database
    const novel = await prisma.novel.create({
      data: {
        title: novelData.title,
        author: novelData.author,
        filename: downloadUrl,
        image: imageUrl,
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

    return NextResponse.json({
      success: true,
      message: 'Novel uploaded successfully',
      novel,
    })
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Failed to upload novel')
    return NextResponse.json(
      {
        error: 'Failed to upload novel',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
