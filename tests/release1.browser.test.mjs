import test from 'node:test'
import assert from 'node:assert/strict'
import { chromium, webkit } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { jobId, fixtureOperativeId } from './fixtures/supabase.mjs'

const appURL = process.env.TEST_APP_URL || 'http://127.0.0.1:3100'
const fixtureURL = process.env.TEST_FIXTURE_URL || 'http://127.0.0.1:3101'
// Refuse to run mutation and login tests against an external application/database.
for (const value of [appURL, fixtureURL]) {
  const url = new URL(value)
  assert.equal(url.protocol, 'http:')
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname), 'Browser tests require loopback fixtures')
}
const shots = resolve(process.env.TEST_SCREENSHOT_DIR || '../release1-screenshots')
await mkdir(shots, { recursive: true })
const availableEngines = { chromium, webkit }
const engines = process.env.TEST_BROWSER
  ? { [process.env.TEST_BROWSER]: availableEngines[process.env.TEST_BROWSER] }
  : availableEngines
assert.ok(Object.values(engines).every(Boolean), 'Use chromium or webkit for TEST_BROWSER')

async function fixture(path, value = {}) {
  const response = await fetch(`${fixtureURL}/__fixture/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
  assert.equal(response.status, 200)
  return response.json()
}
// Let route prefetches settle before forced full-page navigation. WebKit reports
// aborted in-flight RSC fetches as access-control errors when a document is replaced.
async function navigate(page, url) {
  await page.waitForLoadState('networkidle')
  await page.goto(url)
}
async function login(page) {
  await navigate(page, `${appURL}/login`)
  await page.waitForLoadState('networkidle')
  await page.locator('input[type=email]').fill('preview@example.com')
  await page.locator('input[type=password]').fill('fixture-only')
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await page.waitForURL(appURL + '/')
  await page.getByRole('button', { name: 'Jobs', exact: true }).waitFor()
}
async function shot(page, name) {
  await page.screenshot({ path: resolve(shots, `${name}.png`), fullPage: false })
}

for (const [engineName, engine] of Object.entries(engines)) {
  test(`${engineName}: real JobCore components with disposable local data`, async (t) => {
    await fixture('reset')
    const browser = await engine.launch({ headless: true })
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' })
    const page = await context.newPage()
    page.setDefaultTimeout(20000)
    const errors = []
    const recordError = (error) => errors.push(error.message)
    page.on('pageerror', recordError)
    try {
      await login(page)

      await t.test('dark device preference keeps light controls readable and button colours intact', async () => {
        await navigate(page, `${appURL}/jobs?status=Allocated`)
        const input = page.getByPlaceholder('Search address, postcode, client, description...')
        await input.waitFor()
        const colours = await input.evaluate((element) => ({
          colour: getComputedStyle(element).color,
          background: getComputedStyle(element).backgroundColor,
          placeholder: getComputedStyle(element, '::placeholder').color,
          scheme: getComputedStyle(document.documentElement).colorScheme,
        }))
        assert.deepEqual(colours, { colour: 'rgb(15, 23, 42)', background: 'rgb(255, 255, 255)', placeholder: 'rgb(100, 116, 139)', scheme: 'light' })
        await input.fill('Preview Avenue')
        await input.fill('')
        assert.equal(await page.getByRole('button', { name: 'All', exact: true }).evaluate((element) => getComputedStyle(element).color), 'rgb(255, 255, 255)')
        await page.emulateMedia({ colorScheme: 'light' })
        assert.equal(await input.evaluate((element) => getComputedStyle(element).color), 'rgb(15, 23, 42)')
      })

      await t.test('keyboard navigation, workflow headings, matching dashboard URLs and empty queues', async () => {
        const trigger = page.getByRole('button', { name: 'Jobs', exact: true })
        await trigger.focus()
        await page.keyboard.press('Enter')
        const nav = page.getByRole('navigation', { name: 'Jobs destinations' })
        await nav.waitFor()
        // Safari's default macOS keyboard preference uses Option-Tab for links.
        await page.keyboard.press(engineName === 'webkit' ? 'Alt+Tab' : 'Tab')
        assert.equal(await page.evaluate(() => document.activeElement.textContent), 'All Jobs')
        assert.equal(await nav.getByRole('link', { name: 'Needs Review', exact: true }).getAttribute('href'), '/jobs/review')
        await page.keyboard.press('Escape')
        assert.equal(await nav.count(), 0)
        assert.equal(await trigger.evaluate((element) => document.activeElement === element), true)
        await trigger.click()
        await page.getByRole('heading', { name: 'Live Jobs' }).click()
        assert.equal(await nav.count(), 0)
        await navigate(page, appURL + '/')
        const scaffold = page.getByRole('link', { name: /Scaffold Up/, exact: false })
        const dashboardHref = await scaffold.getAttribute('href')
        await trigger.click()
        assert.equal(await nav.getByRole('link', { name: 'Scaffold Up', exact: true }).getAttribute('href'), dashboardHref)
        await nav.getByRole('link', { name: 'Scaffold Up', exact: true }).click()
        await page.getByRole('heading', { name: 'Scaffold Up', exact: true }).waitFor()
        assert.equal(await nav.count(), 0)
        assert.equal(await page.getByRole('link', { name: /4 Preview Avenue/ }).count(), 1)
        assert.equal(await page.getByRole('link', { name: /1 Preview Avenue,/ }).count(), 0)
        await page.goBack()
        await trigger.click()
        await nav.getByRole('link', { name: 'Asbestos Removed', exact: true }).click()
        await page.getByRole('heading', { name: 'Asbestos Removed', exact: true }).waitFor()
        assert.equal(await page.locator('input[type=checkbox]').count(), 1)
        await trigger.click()
        await shot(page, `${engineName}-jobs-menu`)
        await page.keyboard.press('Escape')
      })

      await t.test('130-job selection keeps actions below the header and applies exactly the selected IDs', async () => {
        await navigate(page, `${appURL}/jobs?status=Allocated`)
        const checkboxes = page.locator('input[type=checkbox]')
        await checkboxes.nth(1).check()
        const lastId = (await checkboxes.nth(130).locator('..').locator('a').getAttribute('href')).split('/').pop()
        await checkboxes.nth(130).check()
        const bar = page.getByRole('region', { name: 'Bulk job actions' })
        await bar.waitFor()
        assert.match(await bar.innerText(), /2 jobs Selected/)
        const box = await bar.boundingBox()
        assert.ok(box.y >= 63 && box.y <= 66, `Sticky bar at ${box.y}`)
        assert.equal(await page.getByRole('button', { name: 'Apply', exact: true }).isDisabled(), true)
        await page.getByLabel('Bulk action', { exact: true }).selectOption(`ASSIGN_TO:${fixtureOperativeId}`)
        await shot(page, `${engineName}-sticky-bulk`)
        const [request] = await Promise.all([
          page.waitForRequest((request) => request.url().endsWith('/api/bulk-assign-jobs')),
          page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame()),
          page.getByRole('button', { name: 'Apply', exact: true }).click(),
        ])
        assert.deepEqual(request.postDataJSON(), { job_ids: [jobId(1), lastId], assigned_user_id: fixtureOperativeId })
        await page.waitForLoadState('networkidle')
        const state = await fetch(`${fixtureURL}/__fixture/state`).then((response) => response.json())
        assert.equal(state.mutations.length, 1)
        assert.equal(state.mutations[0].table, 'jobs')
        assert.deepEqual(state.mutations[0].ids, [jobId(1), lastId])
        await fixture('reset')
        await page.waitForLoadState('networkidle')
        await page.reload()
      })

      await t.test('office viewer retains order, handles boundaries, Escape, focus and photo selection', async () => {
        await navigate(page, `${appURL}/jobs/${jobId(1)}`)
        const thumbnail = page.getByRole('button', { name: 'View photo: Evidence 2', exact: true })
        await thumbnail.focus()
        await page.keyboard.press('Enter')
        const dialog = page.getByRole('dialog', { name: 'Job photo', exact: true })
        await dialog.waitFor()
        assert.match(await dialog.innerText(), /2 of 3/)
        assert.match(await dialog.locator('img').getAttribute('src'), /\/2.svg$/)
        await page.keyboard.press('ArrowRight')
        assert.match(await dialog.innerText(), /3 of 3/)
        assert.equal(await dialog.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true)
        await page.keyboard.press('ArrowLeft')
        await dialog.getByRole('button', { name: 'Previous', exact: true }).click()
        assert.match(await dialog.innerText(), /1 of 3/)
        assert.equal(await dialog.getByRole('button', { name: 'Previous', exact: true }).isDisabled(), true)
        // In the office, newest-first thumbnail order is preserved.
        assert.match(await dialog.locator('img').getAttribute('src'), /\/3.svg$/)
        await dialog.locator('img').evaluate((image) => image.decode())
        await shot(page, `${engineName}-photo-viewer`)
        await page.keyboard.press('Tab')
        assert.equal(await page.evaluate(() => document.activeElement.closest('dialog') !== null), true)
        await page.keyboard.press('Escape')
        assert.equal(await dialog.count(), 0)
        assert.equal(await thumbnail.evaluate((element) => document.activeElement === element), true)
        await page.getByRole('button', { name: 'Select Photos', exact: true }).click()
        await thumbnail.click()
        assert.equal(await dialog.count(), 0)
        assert.match(await page.locator('body').innerText(), /1 photo selected/)
        await page.getByRole('button', { name: 'Cancel', exact: true }).click()
      })

      await t.test('one/zero photos, failed image, close button and backdrop remain navigable', async () => {
        await fixture('photos', { count: 1 })
        await page.waitForLoadState('networkidle')
        await page.reload()
        await page.getByRole('button', { name: 'View photo: Evidence 1', exact: true }).click()
        const dialog = page.getByRole('dialog', { name: 'Job photo', exact: true })
        await dialog.waitFor()
        assert.equal(await dialog.getByRole('button', { name: 'Previous', exact: true }).isDisabled(), true)
        assert.equal(await dialog.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true)
        await dialog.getByRole('button', { name: 'Close', exact: true }).click()
        await fixture('photos', { count: 0 })
        await page.waitForLoadState('networkidle')
        await page.reload()
        await page.getByText('No photos uploaded yet', { exact: true }).waitFor()
        assert.equal(await dialog.count(), 0)
        await fixture('photos', { count: 4 })
        await page.waitForLoadState('networkidle')
        await page.reload()
        await page.getByRole('button', { name: 'View photo: Evidence 4', exact: true }).click()
        await dialog.waitFor()
        assert.match(await dialog.innerText(), /1 of 4/)
        await dialog.getByRole('button', { name: 'Next', exact: true }).click()
        assert.match(await dialog.locator('img').getAttribute('src'), /\/3.svg$/)
        await page.mouse.click(2, 2)
        assert.equal(await dialog.count(), 0)
        await fixture('photos', { count: 3 })
      })

      await t.test('phone layout, touch navigation and fitter viewer keep existing access and oldest-first order', async () => {
        page.off('pageerror', recordError)
        await context.close()
        const phone = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, colorScheme: 'dark' })
        const mobilePage = await phone.newPage()
        mobilePage.setDefaultTimeout(20000)
        mobilePage.on('pageerror', recordError)
        await login(mobilePage)
        await navigate(mobilePage, `${appURL}/jobs?status=Allocated`)
        await mobilePage.locator('input[type=checkbox]').nth(1).check()
        await mobilePage.locator('input[type=checkbox]').nth(130).evaluate((element) => element.scrollIntoView({ block: 'end' }))
        await shot(mobilePage, `${engineName}-phone-bulk-before-last-selection`)
        assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth), 375)
        await mobilePage.locator('input[type=checkbox]').nth(130).check()
        const bar = mobilePage.getByRole('region', { name: 'Bulk job actions' })
        const box = await bar.boundingBox()
        assert.ok(box.y >= 63 && box.y <= 66)
        assert.ok(box.width <= 375)
        assert.ok(box.height < 200)
        await mobilePage.getByRole('button', { name: 'Jobs', exact: true }).tap()
        const nav = mobilePage.getByRole('navigation', { name: 'Jobs destinations' })
        await nav.waitFor()
        const navBox = await nav.boundingBox()
        assert.ok(navBox.x >= 0 && navBox.x + navBox.width <= 375)
        assert.ok(navBox.y + navBox.height <= 667)
        await shot(mobilePage, `${engineName}-phone-menu`)
        await nav.getByRole('link', { name: 'Scaffold Up', exact: true }).tap()
        await mobilePage.getByRole('heading', { name: 'Scaffold Up', exact: true }).waitFor()
        await fixture('role', { role: 'fitter' })
        await navigate(mobilePage, `${appURL}/jobs`)
        assert.equal(new URL(mobilePage.url()).pathname, '/my-jobs')
        await navigate(mobilePage, `${appURL}/my-jobs/${jobId(1)}`)
        const thumbnail = mobilePage.getByRole('button').filter({ has: mobilePage.getByRole('img', { name: 'Evidence 1', exact: true }) })
        await thumbnail.tap()
        const dialog = mobilePage.getByRole('dialog', { name: 'Job photo', exact: true })
        await dialog.waitFor()
        assert.match(await dialog.innerText(), /1 of 3/)
        assert.match(await dialog.locator('img').getAttribute('src'), /\/1.svg$/)
        await dialog.getByRole('button', { name: 'Next', exact: true }).tap()
        assert.match(await dialog.innerText(), /2 of 3/)
        const dialogBox = await dialog.boundingBox()
        assert.ok(dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= 375)
        assert.ok(dialogBox.y >= 0 && dialogBox.y + dialogBox.height <= 667)
        await shot(mobilePage, `${engineName}-phone-photo-viewer`)
        await dialog.getByRole('button', { name: 'Close', exact: true }).tap()
        assert.equal(await thumbnail.evaluate((element) => document.activeElement === element), true)
        mobilePage.off('pageerror', recordError)
        await phone.close()
      })
      assert.deepEqual(errors, [], 'No browser runtime errors')
    } finally {
      await browser.close()
      await fixture('reset')
    }
  })
}
