const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

// Create the target directory
const targetDir = path.join(process.cwd(), 'public', '.cache', 'puppeteer')
fs.mkdirSync(targetDir, { recursive: true })

// If we're in the Vercel build environment, copy the Chrome binary
if (process.env.VERCEL) {
  const sourceDir = '/vercel/path0/.cache/puppeteer'
  if (fs.existsSync(sourceDir)) {
    console.log('Copying Chrome binary from build cache...')
    execSync(`cp -r ${sourceDir}/* ${targetDir}/`, { stdio: 'inherit' })
    console.log('Chrome binary copied successfully')
  } else {
    console.log('Chrome binary not found in build cache, installing...')
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' })
  }
} else {
  console.log('Installing Chrome binary...')
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' })
}
