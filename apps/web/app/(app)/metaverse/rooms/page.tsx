'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const ROOMS = [
  { id: 'room-1', name: '営業研修 — 商談の基礎', category: '営業研修', host: '鈴木花子', participants: 5, maxParticipants: 10, status: '開催中', startAt: '2026-03-26 14:00' },
  { id: 'room-2', name: 'CS基礎 — オンボーディング', category: 'CS研修', host: '田中太郎', participants: 3, maxParticipants: 8, status: '予定', startAt: '2026-03-27 10:00' },
  { id: 'room-3', name: '業界知識 — SaaS市場トレンド', category: '業界知識', host: '佐藤次郎', participants: 8, maxParticipants: 8, status: '終了', startAt: '2026-03-25 15:00' },
  { id: 'room-4', name: '新人オンボーディング Week2', category: 'オンボーディング', host: '鈴木花子', participants: 2, maxParticipants: 5, status: '開催中', startAt: '2026-03-26 10:00' },
]

const CATEGORY_COLORS: Record<string, string> = {
  '営業研修': '#88BBFF',
  'CS研修': '#44FF88',
  'サービス理解': '#AA88FF',
  '業界知識': '#FFDD44',
  'オンボーディング': '#FF8888',
  '勉強会': '#FF88CC',
}

const CATEGORY_TABS = ['全て', '営業研修', 'CS研修', 'サービス理解', '業界知識', 'オンボーディング', '勉強会']

const cardStyle = {
  background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
  border: '1px solid #2244AA',
  boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
}

const buttonStyle = {
  background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)',
  border: '1px solid #3355CC',
}

function StatusBadge({ status }: { status: string }) {
  if (status === '開催中') {
    return (
      <motion.span
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
          background: 'rgba(68,255,136,0.15)', border: '1px solid rgba(68,255,136,0.5)',
          color: '#44FF88', boxShadow: '0 0 8px rgba(68,255,136,0.3)',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#44FF88', display: 'inline-block' }} />
        開催中
      </motion.span>
    )
  }
  if (status === '予定') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
        background: 'rgba(136,187,255,0.15)', border: '1px solid rgba(136,187,255,0.4)',
        color: '#88BBFF',
      }}>
        予定
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '10px', fontSize: '12px',
      background: 'rgba(68,102,170,0.15)', border: '1px solid rgba(68,102,170,0.4)',
      color: '#99AACC',
    }}>
      終了
    </span>
  )
}

export default function RoomsPage() {
  const [categoryFilter, setCategoryFilter] = useState('全て')
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', category: '営業研修', maxParticipants: 10 })

  const liveRooms = ROOMS.filter(r => r.status === '開催中')
  const otherRooms = ROOMS.filter(r => r.status !== '開催中')

  const filterRooms = (rooms: typeof ROOMS) =>
    rooms.filter(r => categoryFilter === '全て' || r.category === categoryFilter)

  return (
    <div style={{ minHeight: '100vh', background: '#07091a', color: '#EEEEFF', padding: '24px' }}>
      {/* ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px', color: '#EEEEFF' }}>研修ルーム</h1>
          <p style={{ color: '#CCDDF0', fontSize: '14px', margin: 0 }}>
            開催中 {liveRooms.length} 件 / 全 {ROOMS.length} 件
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ ...buttonStyle, color: '#EEEEFF', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
        >
          + ルーム作成
        </button>
      </motion.div>

      {/* カテゴリフィルター */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}
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

      {/* 開催中ルームハイライト */}
      {filterRooms(liveRooms).length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44FF88', display: 'inline-block' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#44FF88' }}>開催中のルーム</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filterRooms(liveRooms).map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} highlight />
            ))}
          </div>
        </div>
      )}

      {/* その他ルーム */}
      <div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#CCDDF0', marginBottom: '12px' }}>その他のルーム</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filterRooms(otherRooms).map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} highlight={false} />
          ))}
        </div>
      </div>

      {/* ルーム作成モーダル */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px'
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ ...cardStyle, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}
            >
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#EEEEFF' }}>ルーム作成</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>ルーム名</label>
                  <input
                    value={newRoom.name}
                    onChange={e => setNewRoom(p => ({ ...p, name: e.target.value }))}
                    placeholder="研修タイトルを入力"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                      background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA', color: '#EEEEFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>カテゴリ</label>
                  <select
                    value={newRoom.category}
                    onChange={e => setNewRoom(p => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '14px',
                      background: 'rgba(16,16,40,0.6)', border: '1px solid #2244AA', color: '#EEEEFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    {['営業研修', 'CS研修', 'サービス理解', '業界知識', 'オンボーディング', '勉強会'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CCDDF0', marginBottom: '6px' }}>
                    最大参加人数: <span style={{ color: '#88BBFF', fontWeight: 700 }}>{newRoom.maxParticipants}名</span>
                  </label>
                  <input
                    type="range" min={2} max={20} step={1}
                    value={newRoom.maxParticipants}
                    onChange={e => setNewRoom(p => ({ ...p, maxParticipants: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: '#88BBFF', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', background: 'rgba(136,187,255,0.06)', border: '1px solid rgba(136,187,255,0.2)', color: '#88BBFF' }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ ...buttonStyle, color: '#EEEEFF', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                  >
                    作成
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RoomCard({ room, index, highlight }: { room: typeof ROOMS[0]; index: number; highlight: boolean }) {
  const router = useRouter()
  const catColor = CATEGORY_COLORS[room.category] || '#88BBFF'
  const isFull = room.participants >= room.maxParticipants

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ scale: 1.02 }}
      style={{
        background: 'linear-gradient(180deg, #101838 0%, #0c1028 100%)',
        border: highlight ? '1px solid rgba(68,255,136,0.4)' : '1px solid #2244AA',
        boxShadow: highlight
          ? '0 2px 16px rgba(68,255,136,0.1), inset 0 1px 0 rgba(68,255,136,0.05)'
          : '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(136,187,255,0.05)',
        borderRadius: '12px', padding: '18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{
          background: `${catColor}22`, color: catColor,
          border: `1px solid ${catColor}55`,
          padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600
        }}>
          {room.category}
        </span>
        <StatusBadge status={room.status} />
      </div>

      <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#EEEEFF', lineHeight: 1.4 }}>{room.name}</h3>

      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#CCDDF0', marginBottom: '14px' }}>
        <span>ホスト: {room.host}</span>
        <span>{room.startAt}</span>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#CCDDF0', marginBottom: '4px' }}>
          <span>参加者</span>
          <span style={{ color: isFull ? '#FF8888' : '#EEEEFF' }}>
            {room.participants} / {room.maxParticipants}
          </span>
        </div>
        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(136,187,255,0.1)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(room.participants / room.maxParticipants) * 100}%` }}
            transition={{ duration: 0.6, delay: index * 0.06 + 0.2 }}
            style={{
              height: '100%', borderRadius: '2px',
              background: isFull ? '#FF8888' : '#88BBFF',
            }}
          />
        </div>
      </div>

      {room.status === '開催中' && !isFull && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/metaverse/rooms/${room.id}`)}
          style={{
            width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            background: 'linear-gradient(180deg, #2244AA 0%, #1a3388 100%)', border: '1px solid #3355CC', color: '#EEEEFF'
          }}
        >
          参加する
        </motion.button>
      )}
      {room.status === '開催中' && isFull && (
        <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#FF8888' }}>満員です</div>
      )}
    </motion.div>
  )
}
