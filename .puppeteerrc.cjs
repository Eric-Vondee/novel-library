const { join } = require('node:path')

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be within the project directory
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
}
