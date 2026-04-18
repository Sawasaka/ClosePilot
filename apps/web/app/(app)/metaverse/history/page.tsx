'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HISTORY = [
  { id: 'h1', name: '営業研修 — 商談の基礎', category: '営業研修', date: '2026-03-26', host: '鈴木花子', duration: '45分', badge: 'コールマスター' },
  { id: 'h2', name: '業界知識 — SaaS市場', category: '業界知識', date: '2026-03-25', host: '佐藤次郎', duration: '30分', badge: null },
  { id: 'h3', name: '新人オンボーディング', category: 'オンボーディング', date: '2026-03-24', host: '鈴木花子', duration: '60分', badge: '新人賞' },
  { id: 'h4', name: 'CS基礎研修', category: 'CS研修', date: '2026-03-20', host: '田中太郎', duration: '40分', badge: null },
]

const CATEGORY_COLORS: Record<string, string> = {
  '営業研修': '#88BBFF',
  'CS研修': '#44FF88',
  'サービス理解': '#AA88FF',
  '業界知識': '#FFDD44',
  'オンボーディング': '#FF8888',
  '勉強会': '#FF88CC',
}

const CATEGORY_TABS = ['全て', '営業研修', 'CS研修', '業界知識', 'オンボーディング']

const cardStyle = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

function parseDuration(d: string): number {
  return parseInt(d.replace('分', ''), 10)
}

export default function HistoryPage() {
  const [categoryFilter, setCategoryFilter] = useState('全て')

  const filtered = HISTORY.filter(h => categoryFilter === '全て' || h.category === categoryFilter)

  const totalSessions = HISTORY.length
  const totalMinutes = HISTORY.reduce((sum, h) => sum + parseDuration(h.duration), 0)
  const totalBadges = HISTORY.filter(h => h.badge !== null).length

  return (
    <div style={{ minHeight: '100vh', background: '#07091a', color: '#EEEEFF', padding: '24px' }}>
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '24px' }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 16px', color: '#EEEEFF' }}>研修履歴</h1>

        {/* 統計カード */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '参加回数', value: `${totalSessions}回`, color: '#88BBFF', icon: '📚' },
            { label: '累計参加時間', value: `${totalMinutes}分`, color: '#44FF88', icon: '⏱' },
            { label: '獲得バッジ', value: `${totalBadges}個`, color: '#FFDD44', icon: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{
                ...cardStyle, borderRadius: '12px', padding: '16px 20px',
                flex: '1', minWidth: '140px', textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#CCDDF0', marginTop: '4px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* カテゴリフィルター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}
      >
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setCategoryFilter(tab)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              border: '1px solid', transition: 'all 0.2s',
              background: categoryFilter === tab ? '#2244AA' : 'rgba(136,187,255,0.06)',
              borderColor: categoryFilter === tab ? '#3355CC' : 'rgba(136,187,255,0.2)',
              color: categoryFilter === tab ? '#FFFFFF' : '#88BBFF',
            }}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* 履歴カード一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <AnimatePresence>
          {filtered.map((h, i) => {
            const catColor = CATEGORY_COLORS[h.category] || '#88BBFF'
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.005 }}
                style={{ ...cardStyle, borderRadius: '12px', padding: '18px 20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {/* バッジ & カテゴリ */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{
                        background: `${catColor}22`, color: catColor,
                        border: `1px solid ${catColor}55`,
                        padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600
                      }}>
                        {h.category}
                      </span>
                      {h.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 + i * 0.06 }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255,221,68,0.15)', color: '#FFDD44',
                            border: '1px solid rgba(255,221,68,0.4)',
                            padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700
                          }}
                        >
                          🏆 {h.badge}
                        </motion.span>
                      )}
                    </div>

                    <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 600, color: '#EEEEFF' }}>{h.name}</h3>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#CCDDF0', flexWrap: 'wrap' }}>
                      <span>📅 {h.date}</span>
                      <span>ホスト: {h.host}</span>
                    </div>
                  </div>

                  {/* 参加時間 */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#99AACC', marginBottom: '4px' }}>参加時間</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: '#88BBFF', lineHeight: 1 }}>{h.duration}</div>
                  </div>
                </div>

                {/* 時間バー */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(136,187,255,0.1)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((parseDuration(h.duration) / 60) * 100, 100)}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                      style={{ height: '100%', borderRadius: '2px', background: catColor }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...cardStyle, borderRadius: '12px', padding: '40px', textAlign: 'center' }}
          >
            <p style={{ color: '#99AACC', margin: 0 }}>このカテゴリの研修履歴はありません</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
