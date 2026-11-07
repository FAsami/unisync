// Walks the sign-in flow and "My day" in a phone-sized browser and saves screenshots.
//   node web-preview/screens.mjs <previewUrl> <apiLogFile> <rosteredPhone> <outDir>
import { createRequire } from 'node:module'
// The environment's Playwright is installed globally, which only require() resolves.
const { chromium, devices } = createRequire(import.meta.url)('playwright')
import fs from 'node:fs'
import path from 'node:path'

const [base, apiLog, phone, out] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const shot = (page, name) => page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true })
const codeFor = async (e164) => {
  for (let i = 0; i < 50; i++) {
    const m = [...fs.readFileSync(apiLog, 'utf8').matchAll(new RegExp(`to \\${e164}: (\\d{6}) is your UniSync sign-in code`, 'g'))]
    if (m.length) return m.at(-1)[1]
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('no code in API log')
}

const browser = await chromium.launch()
const context = await browser.newContext({ ...devices['iPhone 13'] })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)))
page.on('response', (r) => r.url().includes('/api/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`))

await page.goto(base)
await page.waitForTimeout(2500)
await shot(page, '01-first-launch')

await page.evaluate(() => localStorage.setItem('@onboarding_completed', 'true'))
await page.goto(`${base}/login`)
const phoneInput = page.getByLabel('Mobile number, after plus eight eight zero')
await phoneInput.waitFor()
await shot(page, '02-sign-in')

await phoneInput.fill('1912345678')
await page.getByText('Send code', { exact: true }).click()
await page.getByText("isn't on your department's list", { exact: false }).waitFor()
await shot(page, '03-not-on-the-list')

await page.getByText('Request access', { exact: true }).first().click()
await page.getByText('Your department checks these details', { exact: false }).waitFor()
await page.waitForTimeout(1000)
await shot(page, '04-request-access')

await page.goto(`${base}/login`)
await page.getByLabel('Mobile number, after plus eight eight zero').fill('0' + phone.slice(4))
await page.getByText('Send code', { exact: true }).click()
const codeInput = page.getByLabel('6-digit code from the SMS')
await codeInput.waitFor()
await shot(page, '05-enter-code')

await codeInput.fill(await codeFor(phone)) // auto-submits at 6 digits
try {
  await page.getByText('All of today', { exact: false }).waitFor({ timeout: 20000 })
} catch (error) {
  await shot(page, '06-FAILED')
  console.log('URL:', page.url())
  console.log('Visible text:', (await page.locator('body').innerText()).slice(0, 600))
  console.log(errors.length ? `page errors:\n${errors.join('\n')}` : 'no page errors')
  throw error
}
await page.waitForTimeout(1500)
await shot(page, '06-my-day')

// The day list lives in a ScrollView (its own scroll area), so scroll it to see the rest.
for (const [i, name] of ['07-my-day-scrolled', '08-my-day-end'].entries()) {
  await page.mouse.move(195, 500)
  await page.mouse.wheel(0, 650)
  await page.waitForTimeout(600 + i * 100)
  await shot(page, name)
}

console.log(errors.length ? `page errors:\n${errors.join('\n')}` : 'no page errors')
await browser.close()
