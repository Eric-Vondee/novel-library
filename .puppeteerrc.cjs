const { join } = require('node:path')

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Use a path that will be included in the deployment
  cacheDirectory: join(process.cwd(), 'public', '.cache', 'puppeteer'),
}
