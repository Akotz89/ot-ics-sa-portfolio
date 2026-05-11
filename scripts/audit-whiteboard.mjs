import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(process.cwd())
const port = Number(process.env.WHITEBOARD_AUDIT_PORT || 4187)
const viewports = [
  [2048, 900],
  [1600, 900],
  [1280, 720],
  [1024, 768],
  [760, 620],
]

const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${port}`)
    const pathname = decodeURIComponent(url.pathname)
    const filePath = await resolveStaticPath(pathname)
    response.writeHead(200, { 'Content-Type': mime[extname(filePath)] ?? 'application/octet-stream' })
    createReadStream(filePath).pipe(response)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  }
})

await new Promise((resolveListen) => server.listen(port, '127.0.0.1', resolveListen))

try {
  const browser = await chromium.launch({ headless: true })
  const results = []
  for (const [width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } })
    const consoleIssues = []
    page.on('console', (message) => {
      if (['error', 'warning', 'warn'].includes(message.type())) consoleIssues.push(`${message.type()}: ${message.text()}`)
    })

    await page.goto(`http://127.0.0.1:${port}/whiteboard/?qa=automated-audit-${width}x${height}-${Date.now()}`, { waitUntil: 'load' })
    const steps = []
    for (let index = 0; index < 24; index += 1) {
      const qa = await page.locator('.qa-failure-overlay').count()
      const overlay = qa ? await page.locator('.qa-failure-overlay').innerText() : ''
      const scroll = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth > window.innerWidth,
        y: document.documentElement.scrollHeight > window.innerHeight,
      }))
      steps.push({
        indicator: await page.locator('.step-indicator').innerText(),
        status: await page.locator('.wb-rule-status').innerText(),
        qa,
        overlay,
        svg: await page.locator('svg').count(),
        canvas: await page.locator('canvas.ot-route-canvas').count(),
        pulses: await page.locator('.packet-pulse').count(),
        scroll,
      })
      if (index < 23) await page.keyboard.press('ArrowRight')
    }
    await page.close()
    results.push({
      viewport: `${width}x${height}`,
      failures: steps.filter((step) => step.qa || step.svg !== 0 || step.canvas !== 1 || step.pulses !== 0 || step.scroll.x || step.scroll.y),
      final: steps.at(-1),
      consoleIssues,
    })
  }
  await browser.close()

  const failures = results.filter((result) => result.failures.length || result.consoleIssues.length)
  console.log(JSON.stringify(results, null, 2))
  if (failures.length) process.exitCode = 1
} finally {
  server.close()
}

async function resolveStaticPath(pathname) {
  const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname
  const candidate = normalize(join(root, requested))
  if (!candidate.startsWith(`${root}${sep}`) && candidate !== root) throw new Error('path escape')
  await readFile(candidate)
  return candidate
}
