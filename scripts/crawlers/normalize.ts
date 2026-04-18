/**
 * 企業名正規化・求人日付パーサ（abm-toolから移植）
 */

export function normalizeName(name: string): string {
  return name
    .replace(/株式会社/g, '')
    .replace(/有限会社/g, '')
    .replace(/合同会社/g, '')
    .replace(/\s+/g, '')
    .replace(/\u3000/g, '')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim()
    .toLowerCase()
}

/**
 * 求人ボックスの「3日前」「2週間前」「1ヶ月前」等の相対表記を日付に変換
 */
export function parseRelativeDate(text: string): Date | null {
  if (!text) return null
  const cleaned = text.replace(/[+＋]/g, '').trim()
  const now = new Date()

  if (cleaned.includes('今日') || cleaned.includes('たった今') || cleaned === '新着') {
    return now
  }
  const daysMatch = cleaned.match(/(\d+)\s*日前/)
  if (daysMatch) {
    const d = new Date(now)
    d.setDate(d.getDate() - parseInt(daysMatch[1], 10))
    return d
  }
  const hoursMatch = cleaned.match(/(\d+)\s*時間前/)
  if (hoursMatch) return now

  const weeksMatch = cleaned.match(/(\d+)\s*週間前/)
  if (weeksMatch) {
    const d = new Date(now)
    d.setDate(d.getDate() - parseInt(weeksMatch[1], 10) * 7)
    return d
  }
  const monthsMatch = cleaned.match(/(\d+)\s*(?:か|ヶ|ケ|カ)月前/)
  if (monthsMatch) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - parseInt(monthsMatch[1], 10))
    return d
  }
  return null
}
