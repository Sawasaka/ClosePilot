'use client'

/**
 * file-attach — チャット入力欄のローカルファイル添付ユーティリティ
 *
 * - useFileAttachments(): files state と picker 操作系を返す hook
 * - <HiddenFileInput />:  hidden な <input type="file"> を render
 * - <AttachmentChip />:   選択済みファイルを表示する小さなピル (×ボタン付き)
 *
 * フェーズ1ではアップロード未配線。送信時に添付内容をどう RAG / API に渡すかは別実装。
 */

import { useRef, useState, type ChangeEvent, type RefObject } from 'react'
import {
  X,
  FileText,
  Image as ImageIcon,
  FileAudio,
  FileVideo,
  File as FileIcon,
} from 'lucide-react'

export function useFileAttachments() {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const openPicker = () => inputRef.current?.click()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list || list.length === 0) return
    setFiles((prev) => [...prev, ...Array.from(list)])
    // 同じファイルを再選択可能にするため値をクリア
    e.target.value = ''
  }

  const remove = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  const clear = () => setFiles([])

  return { files, inputRef, openPicker, handleChange, remove, clear }
}

function pickIcon(file: File) {
  const t = file.type
  if (t.startsWith('image/')) return ImageIcon
  if (t.startsWith('audio/')) return FileAudio
  if (t.startsWith('video/')) return FileVideo
  if (t === 'application/pdf' || t.startsWith('text/')) return FileText
  return FileIcon
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function HiddenFileInput({
  inputRef,
  onChange,
  accept,
}: {
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  accept?: string
}) {
  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      className="hidden"
      onChange={onChange}
      accept={accept}
      aria-hidden="true"
    />
  )
}

export function AttachmentChip({
  file,
  onRemove,
}: {
  file: File
  onRemove: () => void
}) {
  const Icon = pickIcon(file)
  return (
    <div
      className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1 rounded-full text-[11.5px] font-medium"
      style={{
        backgroundColor: 'var(--color-obs-surface-highest)',
        color: 'var(--color-obs-text)',
      }}
    >
      <Icon size={12} style={{ color: 'var(--color-obs-primary)' }} />
      <span className="max-w-[180px] truncate">{file.name}</span>
      <span
        className="text-[10.5px] tabular-nums"
        style={{ color: 'var(--color-obs-text-muted)' }}
      >
        {formatSize(file.size)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${file.name} を削除`}
        className="w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-100"
        style={{ color: 'var(--color-obs-text-muted)' }}
        onMouseOver={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
            'var(--color-obs-surface-high)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text)'
        }}
        onMouseOut={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-obs-text-muted)'
        }}
      >
        <X size={10} />
      </button>
    </div>
  )
}
