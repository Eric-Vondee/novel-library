import { type NextRequest, NextResponse } from 'next/server'
import { GoogleDriveService } from '@/lib/googleDrive'
import formidable from 'formidable'
import fs from 'node:fs'
import path from 'node:path'

const driveService = new GoogleDriveService()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    const fileId = searchParams.get('fileId')

    if (!(await driveService.initialize())) {
      return NextResponse.json({ error: 'Failed to initialize Google Drive' }, { status: 500 })
    }

    switch (action) {
      case 'list': {
        const files = await driveService.listFiles()
        return NextResponse.json({ files })
      }

      case 'get': {
        if (!fileId) {
          return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
        }
        const file = await driveService.getFile(fileId)
        return NextResponse.json({ file })
      }

      case 'download': {
        if (!fileId) {
          return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
        }
        const tempDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir)
        }
        const fileName = `novel-${fileId}.epub`
        const filePath = path.join(tempDir, fileName)
        await driveService.downloadFile(fileId, filePath)
        const fileStream = fs.createReadStream(filePath)
        return new NextResponse(fileStream as any, {
          headers: {
            'Content-Type': 'application/epub+zip',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in drive API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await driveService.initialize())) {
      return NextResponse.json({ error: 'Failed to initialize Google Drive' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }
    const tempPath = path.join(tempDir, file.name)
    fs.writeFileSync(tempPath, buffer)

    const fileId = await driveService.uploadFile(tempPath, file.name)
    fs.unlinkSync(tempPath) // Clean up temp file

    return NextResponse.json({ fileId })
  } catch (error) {
    console.error('Error in drive API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
