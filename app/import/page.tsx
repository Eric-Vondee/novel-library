import type { Metadata } from 'next'
import NovelImportTool from '@/components/novel-import-tool'

export const metadata: Metadata = {
  title: 'Import Novel - Novel Library',
  description: 'Import novels from various sources and manage your library',
}

export default function ImportPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='max-w-4xl mx-auto'>
        <NovelImportTool />
      </div>
    </div>
  )
}
