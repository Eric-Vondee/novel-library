import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/layout/header'
import Footer from '@/layout/footer'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | Novel Library',
    default: 'Novel Library - Your Personal Novel Collection',
  },
  description: 'A personal library for managing and reading your favorite novels',
  keywords: ['novels', 'library', 'ebooks', 'reading', 'collection'],
  authors: [{ name: 'Greg' }],
  creator: 'Greg',
  publisher: 'Greg',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          <div className='flex flex-col min-h-screen bg-white dark:bg-[#121212]'>
            <Header />
            <main className='flex-grow '>{children}</main>
            <Footer />
          </div>
          <Toaster richColors position='top-right' />
        </ThemeProvider>
      </body>
    </html>
  )
}
