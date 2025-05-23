import Footer from './footer'
import Header from './header'

export default function Layout({
  children,
  noFooter,
}: { children: React.ReactNode; noFooter?: boolean }) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow container px-4 mx-auto relative '>{children}</main>
      {!noFooter && <Footer />}
    </div>
  )
}
