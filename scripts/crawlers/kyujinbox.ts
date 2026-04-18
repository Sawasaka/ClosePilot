import { chromium, type Page, type Browser } from 'playwright'
import { parseRelativeDate } from './normalize'

const KYUJINBOX_BASE = 'https://xn--pckua2a7gp15o89zb.com'
const MAX_PAGES_DEFAULT = 10

export interface JobResult {
  title: string
  company: string
  location: string
  url: string
  postedDate: Date | null
  sourceName: string
}

export interface KyujinboxCrawlOptions {
  keywords: string[]
  maxPages?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const randomDelay = () => sleep(3000 + Math.random() * 4000)

async function extractJobsFromPage(page: Page): Promise<JobResult[]> {
  type RawJob = {
    title: string
    company: string
    location: string
    url: string
    dateText: string
    sourceName: string
  }

  const rawJobs = (await page.evaluate((base: string) => {
    const cards = document.querySelectorAll('.p-result_card, [class*="p-result_card"]')
    const jobs: {
      title: string
      company: string
      location: string
      url: string
      dateText: string
      sourceName: string
    }[] = []

    cards.forEach((card) => {
      const titleEl = card.querySelector('.p-result_title_link, .p-result_title a')
      const title = titleEl?.textContent?.trim() || ''

      const companyEl = card.querySelector('.p-result_company, .p-result_company a')
      const company = companyEl?.textContent?.trim() || ''

      const linkEl = card.querySelector('a.p-result_title_link, .p-result_title a')
      let url = ''
      if (linkEl) {
        const href = linkEl.getAttribute('href') || ''
        url = href.startsWith('http') ? href : `${base}${href}`
      }

      const locationEl = card.querySelector('.p-result_info, .p-result_area')
      const location = locationEl?.textContent?.trim()?.split('\n')[0] || ''

      const dateEl = card.querySelector(".p-result_updatedAt_hyphen, [class*='updatedAt']")
      const dateText = dateEl?.textContent?.trim() || ''

      if (title && company) {
        jobs.push({
          title,
          company,
          location: location.slice(0, 100),
          url,
          dateText,
          sourceName: '求人ボックス',
        })
      }
    })

    return jobs
  }, KYUJINBOX_BASE)) as RawJob[]

  return rawJobs.map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    url: j.url,
    sourceName: j.sourceName,
    postedDate: parseRelativeDate(j.dateText),
  }))
}

async function crawlForKeyword(page: Page, keyword: string, maxPages: number): Promise<JobResult[]> {
  const allJobs: JobResult[] = []
  const seenKeys = new Set<string>()

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const pageParam = pageNum > 1 ? `&p=${pageNum}` : ''
    const url = `${KYUJINBOX_BASE}/${encodeURIComponent(keyword + 'の仕事')}?${pageParam}`
    console.log(`   [p${pageNum}/${maxPages}] ${keyword}`)

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2000 + Math.random() * 2000)

      const jobs = await extractJobsFromPage(page)
      if (jobs.length === 0) {
        console.log('      → 0件（終了）')
        break
      }

      let newCount = 0
      for (const job of jobs) {
        const key = `${job.company}|${job.title}`
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          allJobs.push(job)
          newCount++
        }
      }
      console.log(`      → ${jobs.length}件取得（新規${newCount}件、累計${allJobs.length}件）`)
      await randomDelay()
    } catch (err) {
      console.error(`      → エラー: ${(err as Error).message}`)
      await sleep(5000)
    }
  }

  return allJobs
}

/**
 * 求人ボックスをクロールして求人情報を収集する。
 * ブラウザ起動〜終了までを内包。
 */
export async function crawlKyujinbox(opts: KyujinboxCrawlOptions): Promise<JobResult[]> {
  const { keywords, maxPages = MAX_PAGES_DEFAULT } = opts

  console.log('🔎 求人ボックス クロール開始')
  console.log(`   キーワード: ${keywords.join(', ')}`)
  console.log(`   最大ページ数/KW: ${maxPages}`)

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    viewport: { width: 1280, height: 720 },
  })
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false })
  })

  const page = await context.newPage()

  const allJobs: JobResult[] = []
  const seenKeys = new Set<string>()
  try {
    for (const kw of keywords) {
      console.log(`\n--- キーワード: 「${kw}」 ---`)
      const jobs = await crawlForKeyword(page, kw, maxPages)
      for (const job of jobs) {
        const key = `${job.company}|${job.title}`
        if (!seenKeys.has(key)) {
          seenKeys.add(key)
          allJobs.push(job)
        }
      }
      console.log(`   合計: ${jobs.length}件`)
      await randomDelay()
    }
  } finally {
    await browser.close()
  }

  console.log(`\n✅ クロール完了: 計${allJobs.length}件`)
  return allJobs
}
