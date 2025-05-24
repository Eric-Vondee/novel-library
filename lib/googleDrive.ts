import { google } from 'googleapis'
import { authenticate } from '@google-cloud/local-auth'
import path from 'node:path'
import fs from 'node:fs'

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

export class GoogleDriveService {
  private drive: any

  async initialize() {
    try {
      const auth = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
      })

      this.drive = google.drive({ version: 'v3', auth })
      return true
    } catch (error) {
      console.error('Error initializing Google Drive:', error)
      return false
    }
  }

  async uploadFile(filePath: string, fileName: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // You'll need to set this in your .env
      }

      const media = {
        mimeType: 'application/epub+zip',
        body: fs.createReadStream(filePath),
      }

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      })

      return response.data.id
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  async getFile(fileId: string) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, webViewLink, webContentLink',
      })
      return response.data
    } catch (error) {
      console.error('Error getting file:', error)
      throw error
    }
  }

  async downloadFile(fileId: string, destinationPath: string) {
    try {
      const response = await this.drive.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' },
      )

      const dest = fs.createWriteStream(destinationPath)
      return new Promise((resolve, reject) => {
        response.data
          .on('end', () => resolve(true))
          .on('error', (err: any) => reject(err))
          .pipe(dest)
      })
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  async listFiles() {
    try {
      const response = await this.drive.files.list({
        q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and mimeType='application/epub+zip'`,
        fields: 'files(id, name, webViewLink, webContentLink)',
      })
      return response.data.files
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }
}
