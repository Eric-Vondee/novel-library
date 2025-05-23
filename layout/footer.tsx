export default function Footer() {
  return (
    <footer className='bg-white dark:bg-transparent text-gray-800 dark:text-gray-200 py-6 mt-12'>
      <div className='container mx-auto'>
        <p className='text-center text-sm md:text-base'>
          📚 &copy; {new Date().getFullYear()} by{' '}
          <a
            href='/'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'>
            Greg 📖
          </a>
        </p>
      </div>
    </footer>
  )
}
