// Walks the day-of-class screens in a phone-sized browser and saves screenshots:
// a teacher changes a room, browses the week, sends a notice and checks it was
// sent; then a student of that section sees the change and opens the inbox.
//   node web-preview/screens-teacher.mjs <previewUrl> <apiLogFile> <teacherPhone> <studentPhone> <outDir>
// Phones are E.164 (+8801...). The API must run in Development (codes in its log).
import { createRequire } from 'node:module'
// The environment's Playwright is installed globally, which only require() resolves.
const { chromium, devices } = createRequire(import.meta.url)('playwright')
import fs from 'node:fs'
import path from 'node:path'

const [base, apiLog, teacherPhone, studentPhone, out] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const errors = []

const codeFor = async (e164, after) => {
  for (let i = 0; i < 50; i++) {
    const log = fs.readFileSync(apiLog, 'utf8').slice(after)
    const m = [...log.matchAll(new RegExp(`to \\${e164}: (\\d{6}) is your UniSync sign-in code`, 'g'))]
    if (m.length) return m.at(-1)[1]
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`no code for ${e164} in the API log`)
}

const browser = await chromium.launch()

async function phone(label) {
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push(`[${label}] ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`[${label}] ${m.text().slice(0, 300)}`))
  page.on('response', (r) => r.url().includes('/api/') && r.status() >= 400 && errors.push(`[${label}] ${r.status()} ${r.url()}`))
  return page
}

const shot = (page, name) => page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true })

async function step(page, name, run) {
  try {
    await run()
    await page.waitForTimeout(700)
    await shot(page, name)
  } catch (error) {
    await shot(page, `${name}-FAILED`)
    console.log(`FAILED at ${name}. URL: ${page.url()}`)
    console.log('Visible text:', (await page.locator('body').innerText()).slice(0, 800))
    console.log(errors.length ? `page errors:\n${errors.join('\n')}` : 'no page errors')
    await browser.close()
    throw error
  }
}

async function signIn(page, e164) {
  await page.goto(base)
  await page.evaluate(() => localStorage.setItem('@onboarding_completed', 'true'))
  await page.goto(`${base}/login`)
  await page.getByLabel('Mobile number, after plus eight eight zero').fill('0' + e164.slice(4))
  const logSize = fs.statSync(apiLog).size
  await page.getByText('Send code', { exact: true }).filter({ visible: true }).first().click()
  const codeInput = page.getByLabel('6-digit code from the SMS')
  await codeInput.waitFor()
  await codeInput.fill(await codeFor(e164, logSize)) // auto-submits at 6 digits
  await page.getByText('Today', { exact: true }).first().waitFor({ timeout: 20000 })
}

const tab = (page, title) => page.getByText(title, { exact: true }).filter({ visible: true }).first().click()
const classButton = (page, code) => page.getByRole('button', { name: new RegExp(`^${code} ·`) }).filter({ visible: true }).first()

// ---- Teacher -------------------------------------------------------------
const teacher = await phone('teacher')
await step(teacher, '10-teacher-my-day', async () => {
  await signIn(teacher, teacherPhone)
  await teacher.getByText('Tap a class to cancel it', { exact: false }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '11-class-sheet', async () => {
  await classButton(teacher, 'CSE103').click()
  await teacher.getByText('Change room', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '12-change-room-form', async () => {
  await teacher.getByText('Change room', { exact: true }).filter({ visible: true }).first().click()
  await teacher.getByText('Change room and notify', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '13-room-picker', async () => {
  await teacher.getByRole('button', { name: /^New room:/ }).click()
  await teacher.getByText("210, Academic Building", { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '14-change-room-filled', async () => {
  await teacher.getByText("210, Academic Building", { exact: true }).filter({ visible: true }).first().click()
  await teacher.getByLabel('Reason (students will see it)').fill('Lab 105 projector is broken')
})
await step(teacher, '15-room-changed', async () => {
  await teacher.getByText('Change room and notify', { exact: true }).filter({ visible: true }).first().click()
  await teacher.getByText('The section has been notified', { exact: false }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '16-sheet-offers-undo', async () => {
  await classButton(teacher, 'CSE103').click()
  await teacher.getByText('Undo the change', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '17-schedule', async () => {
  await teacher.getByLabel('Close').click()
  await tab(teacher, 'SCHEDULE')
  await teacher.getByText('Schedule', { exact: true }).filter({ visible: true }).first().waitFor()
  await teacher.getByText('Tap a class to cancel it', { exact: false }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '18-schedule-next-day', async () => {
  await teacher.getByRole('button', { name: /^Mon / }).filter({ visible: true }).first().click()
  await teacher.getByText('CSE102 · Discrete Mathematics', { exact: false }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '19-send-hub', async () => {
  await tab(teacher, 'SEND')
  await teacher.getByText('Send a notice', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '20-compose', async () => {
  await teacher.getByText('Send a notice', { exact: true }).filter({ visible: true }).first().click()
  await teacher.getByRole('radio').filter({ visible: true }).first().click()
  await teacher.getByLabel('Title').fill('Quiz on Thursday')
  await teacher.getByLabel('Message').fill('Short quiz on loops and arrays at the start of Thursday’s CSE101 class. Bring a pen.')
})
await step(teacher, '21-compose-sent', async () => {
  await teacher.getByRole('button', { name: 'Send', exact: true }).filter({ visible: true }).last().click()
  await teacher.getByText('See sent notices', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(teacher, '22-sent', async () => {
  await teacher.getByText('See sent notices', { exact: true }).filter({ visible: true }).first().click()
  await teacher.getByText('Quiz on Thursday', { exact: true }).filter({ visible: true }).first().waitFor()
})

// ---- Student of that section ---------------------------------------------
const student = await phone('student')
await step(student, '23-student-my-day', async () => {
  await signIn(student, studentPhone)
  await student.getByText('Room changed', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(student, '24-inbox', async () => {
  await tab(student, 'ALERTS')
  await student.getByText('Quiz on Thursday', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(student, '25-notice-open', async () => {
  await student.getByText('Quiz on Thursday', { exact: true }).filter({ visible: true }).first().click()
  await student.getByText('Notification', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(student, '26-inbox-after-read', async () => {
  await student.getByLabel('Back').click()
  await student.getByText('Notifications', { exact: true }).filter({ visible: true }).first().waitFor()
})
await step(student, '27-profile', async () => {
  await tab(student, 'ACCOUNT')
  await student.getByText('Profile', { exact: true }).filter({ visible: true }).first().click()
  await student.getByText('Delete my account', { exact: true }).filter({ visible: true }).first().waitFor()
})

console.log(errors.length ? `page errors:\n${errors.join('\n')}` : 'no page errors')
await browser.close()
