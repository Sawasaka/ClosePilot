'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Phone,
  Building2,
  User,
  Target,
  Calendar,
  TrendingUp,
  Zap,
  BookOpen,
  CheckCircle2,
  PhoneCall,
  Mail,
  MessageSquare,
  Clock,
  Star,
  Plus,
  Pencil,
  X,
  Briefcase,
  Trash2,
  FileText,
  Layers,
  Users,
  Flame,
  ArrowRight,
  Activity,
  History,
  StickyNote,
  Cpu,
  Headphones,
  ChevronDown,
} from 'lucide-react'
import { useCallStore } from '@/lib/stores/callStore'
import { ObsPageShell } from '@/components/obsidian'
import { GoogleTimeline } from '@/components/google/google-timeline'

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type DealStage =
  | 'NEW_LEAD' | 'QUALIFIED' | 'FIRST_MEETING' | 'SOLUTION_FIT'
  | 'PROPOSAL' | 'NEGOTIATION' | 'VERBAL_COMMIT' | 'CLOSED_WON' | 'CLOSED_LOST'

type DealStatus = 'アクティブ' | '優先対応' | '保留'

type ISContactStatus = '未着手' | '不通' | '不在' | '接続済み' | 'コール不可' | 'アポ獲得' | 'Next Action'

interface ISContact {
  id: string
  name: string
  title: string
  status: ISContactStatus
  callAttempts: number
  isDecisionMaker: boolean
}

type ConfidenceLevel = 'High' | 'Medium' | 'Low'

type ActivityType = 'call' | 'email' | 'note' | 'deal_advance'

// ISフィールドキー（電話・メールから自動抽出される項目）
type ISFieldKey =
  | '検討フェーズ'
  | 'サービス認知度'
  | '興味の対象'
  | '求めているもの'
  | '次の進め方'
  | '担当部署・役割'
  | '興味度'
  | '依頼済みタスク'
  | '電話可否'
  | 'IS所見メモ'

// IS段階の選択値（チップで表示する系）
type ISConsiderationPhase = '情報収集' | '検討中' | '比較検討' | '導入決定間近' | '未確認'
type ISServiceAwareness = '未認知' | '名前は知っている' | '内容を理解' | '導入経験あり' | '未確認'
type ISInterestLevel = '高（前向き）' | '中（要育成）' | '低（情報収集のみ）' | '未測定'
type ISCallability = '可' | '時間帯指定あり' | '不可' | '未確認'
type ISRequestedItem = '資料' | 'お見積もり' | 'デモ' | 'トライアル' | '事例紹介' | '個別相談'
type ISTaskItem = '資料請求' | 'デモ依頼' | '見積依頼' | '事例提供' | '社内共有' | '稟議用情報'

interface ISField {
  key: ISFieldKey
  label: string
  value: string | null
  // チップ表示用の構造化データ（任意）
  chipValue?: ISConsiderationPhase | ISServiceAwareness | ISInterestLevel | ISCallability
  chipList?: (ISRequestedItem | ISTaskItem)[]
}

// 営業フィールドキー（議事録から自動抽出される項目）
type SalesFieldKey =
  | '課題'
  | '予算'
  | '希望サービス'
  | 'タイムライン'
  | '決裁者'
  | '稟議プロセス'
  | '競合'
  | '障壁'
  | 'その他'
  | '現状システム'
  | '理想システム'
  | 'ニーズ'
  | '要望機能'
  | '出席者'

// プロダクトフィールドキー（開発・PDM 視点で扱う項目）
type ProductFieldKey =
  | '機能要件サマリ'
  | '優先度'
  | '想定利用シーン'
  | '想定ユーザー'
  | '統合・連携要件'
  | 'セキュリティ要件'
  | 'パフォーマンス要件'
  | 'カスタマイズ範囲'
  | '段階導入計画'
  | '技術スタック制約'
  | 'KPI／成果指標'
  | 'リスク・懸念'

// 出席者：職種・任務・成し遂げたいこと の3軸でいい感じにまとめる
interface Participant {
  name: string
  role: string         // 職種や担当範囲
  mission: string      // 任務
  vision: string       // 成し遂げたいこと / 目指していること
}

interface SalesField {
  key: SalesFieldKey
  label: string
  value: string | null
  confidence?: ConfidenceLevel   // ※UI表示は廃止、データは互換のため残置
  participants?: Participant[]   // '出席者' のときに使用
}

interface ProductField {
  key: ProductFieldKey
  label: string
  value: string | null
}

interface DealDetail {
  id: string
  name: string
  company: string
  companyId: string
  contact: string
  contactId: string
  contactPhone: string
  owner: string
  stage: DealStage
  status: DealStatus
  amount: number
  probability: number
  expectedCloseAt: string | null
  updatedAt: string
  // 進捗管理（フリーテキスト）— パイプラインカードと連動想定
  progressStatus: string
  nextAction: string
  nextActionDate: string | null
  memo: string
}

interface StageHistoryItem {
  stage: DealStage
  date: string
  daysAgo: number
  isCurrent: boolean
}

interface ActivityItem {
  id: string
  type: ActivityType
  timestamp: string
  title: string
  result?: string
  durationSec?: number
  description?: string
}

// 議事録（個別）
interface MeetingRecord {
  id: string
  date: string
  sequence: number
  title: string
  participants: string[]
  durationMin: number
  summary: string
  keyPoints: string[]
}

// 議事録 集約サマリー（過去の流れ / 現在 の2軸）
interface MeetingAggregation {
  history: string
  current: string
}

// 取引タスク
type DealTaskType = 'call' | 'email' | 'meeting' | 'proposal' | 'followup' | 'other'

interface DealTask {
  id: string
  type: DealTaskType
  title: string
  dueAt: string | null
  memo: string
  done: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_DEALS: Record<string, DealDetail> = {
  'd1': {
    id: 'd1', name: '株式会社テクノリード - 2026/01/15',
    company: '株式会社テクノリード', companyId: '1',
    contact: '田中 誠', contactId: '1', contactPhone: '090-1234-5678',
    owner: '田中太郎', stage: 'NEGOTIATION', status: 'アクティブ',
    amount: 4800000, probability: 80, expectedCloseAt: '2026-03-31', updatedAt: '2026-03-22',
    progressStatus: '提案フェーズ / 最終見積回答待ち',
    nextAction: '決裁者(CTO鈴木氏)同席の最終デモ',
    nextActionDate: '2026-04-25',
    memo: 'CTO鈴木氏はSlack連携を最重視。初期サポートの厚みを強調すると刺さる傾向。社内稟議のタイミングに合わせて4/1までに最終見積回答予定。',
  },
  'd2': {
    id: 'd2', name: '株式会社イノベーション - 大型案件',
    company: '株式会社イノベーション', companyId: '3',
    contact: '佐々木 拓也', contactId: '3', contactPhone: '090-3456-7890',
    owner: '田中太郎', stage: 'VERBAL_COMMIT', status: '優先対応',
    amount: 6000000, probability: 90, expectedCloseAt: '2026-03-28', updatedAt: '2026-03-21',
    progressStatus: '口頭合意済 / 契約書ドラフト確認中',
    nextAction: '契約書の最終レビューと押印手配',
    nextActionDate: '2026-04-26',
    memo: '代表者直々の商談で即決型。契約書レビューは法務経由で通常3営業日。押印はクラウドサイン利用予定。',
  },
  'd3': {
    id: 'd3', name: '合同会社フューチャー - 2026/02/01',
    company: '合同会社フューチャー', companyId: '2',
    contact: '山本 佳子', contactId: '2', contactPhone: '090-2345-6789',
    owner: '鈴木花子', stage: 'QUALIFIED', status: 'アクティブ',
    amount: 2400000, probability: 40, expectedCloseAt: '2026-04-15', updatedAt: '2026-03-19',
    progressStatus: 'ヒアリング継続 / 予算確認中',
    nextAction: '2回目商談で要件整理',
    nextActionDate: '2026-04-30',
    memo: '山本氏は現場マネージャーで決裁権限なし。決裁者は別途特定が必要。Zoho CRM との比較軸をこちらから提示すると有利。',
  },
  'd4': {
    id: 'd4', name: '株式会社グロース - HR導入',
    company: '株式会社グロース', companyId: '4',
    contact: '中村 理恵', contactId: '4', contactPhone: '090-4567-8901',
    owner: '佐藤次郎', stage: 'QUALIFIED', status: 'アクティブ',
    amount: 900000, probability: 30, expectedCloseAt: '2026-04-30', updatedAt: '2026-03-10',
    progressStatus: '初期ヒアリング完了 / 費用感共有待ち',
    nextAction: '比較資料を送付後フォローコール',
    nextActionDate: '2026-05-05',
    memo: '予算と優先度の両面で社内調整が必要な状況。人事部長を巻き込むタイミングを見極めたい。',
  },
}

const DEAL_CONTACTS: Record<string, ISContact[]> = {
  'd1': [
    { id: '1', name: '田中 誠',   title: '営業部長', status: 'アポ獲得', callAttempts: 3, isDecisionMaker: false },
    { id: '9', name: '鈴木 一郎', title: 'CTO',      status: '未着手',   callAttempts: 0, isDecisionMaker: true  },
  ],
  'd2': [
    { id: '3', name: '佐々木 拓也', title: '代表取締役', status: 'Next Action', callAttempts: 2, isDecisionMaker: true },
  ],
  'd3': [
    { id: '2', name: '山本 佳子', title: 'マネージャー', status: '接続済み', callAttempts: 5, isDecisionMaker: false },
  ],
  'd4': [
    { id: '4', name: '中村 理恵', title: '購買担当', status: '不在', callAttempts: 4, isDecisionMaker: false },
  ],
}

// ─── ISフィールド（電話・メールから自動抽出される項目） ──────────────────
// IS段階のヒアリング情報。電話の文字起こし＋メールの本文・件名から AI が抽出
const MOCK_IS_FIELDS: Record<string, ISField[]> = {
  'd1': [
    { key: '検討フェーズ', label: '検討フェーズ', value: '検討中', chipValue: '検討中' },
    { key: 'サービス認知度', label: 'サービス認知度', value: '内容を理解', chipValue: '内容を理解' },
    { key: '興味の対象', label: '興味の対象', value: 'AI議事録要約 / Slackリアルタイム連携 / 営業マネージャ向けKPIダッシュボード' },
    {
      key: '求めているもの', label: '求めているもの', value: 'デモ / お見積もり / 事例紹介',
      chipList: ['デモ', 'お見積もり', '事例紹介'],
    },
    { key: '次の進め方', label: '次の進め方', value: '4/25にCTO同席で最終デモ → 4/末までに見積回答 → 5月導入判定' },
    { key: '担当部署・役割', label: '担当部署・役割', value: '営業部 部長（実務推進担当） / 決裁関与あり（最終決裁は社長）' },
    { key: '興味度', label: '興味度', value: '高（前向き）', chipValue: '高（前向き）' },
    {
      key: '依頼済みタスク', label: '依頼済みタスク', value: '資料請求 / デモ依頼 / 稟議用情報',
      chipList: ['資料請求', 'デモ依頼', '稟議用情報'],
    },
    { key: '電話可否', label: '電話可否', value: '可（平日10-12時優先）', chipValue: '時間帯指定あり' },
    { key: 'IS所見メモ', label: 'IS所見メモ', value: '初期コール時はSlack連携の可否を最重視。CTO鈴木氏は技術的な深い質問が多く、営業ツール導入経験あり。資料は技術観点で訴求するとフィット。' },
  ],
  'd2': [
    { key: '検討フェーズ', label: '検討フェーズ', value: '導入決定間近', chipValue: '導入決定間近' },
    { key: 'サービス認知度', label: 'サービス認知度', value: '内容を理解', chipValue: '内容を理解' },
    { key: '興味の対象', label: '興味の対象', value: '契約管理機能 / 役員向けダッシュボード' },
    { key: '求めているもの', label: '求めているもの', value: 'お見積もり / 事例紹介', chipList: ['お見積もり', '事例紹介'] },
    { key: '次の進め方', label: '次の進め方', value: '契約書ドラフトを4/26に確認 → 即押印 → 5月導入' },
    { key: '担当部署・役割', label: '担当部署・役割', value: '代表取締役 / 決裁権限あり（即決可）' },
    { key: '興味度', label: '興味度', value: '高（前向き）', chipValue: '高（前向き）' },
    { key: '依頼済みタスク', label: '依頼済みタスク', value: '見積依頼 / 事例提供', chipList: ['見積依頼', '事例提供'] },
    { key: '電話可否', label: '電話可否', value: '可', chipValue: '可' },
    { key: 'IS所見メモ', label: 'IS所見メモ', value: '即決型の代表者。技術的な細部より導入後の効果と実績を重視。事例3件 + ROI試算で押すと刺さる。' },
  ],
  'd3': [
    { key: '検討フェーズ', label: '検討フェーズ', value: '比較検討', chipValue: '比較検討' },
    { key: 'サービス認知度', label: 'サービス認知度', value: '名前は知っている', chipValue: '名前は知っている' },
    { key: '興味の対象', label: '興味の対象', value: '問い合わせキュー機能 / SLAアラート' },
    { key: '求めているもの', label: '求めているもの', value: '資料 / お見積もり', chipList: ['資料', 'お見積もり'] },
    { key: '次の進め方', label: '次の進め方', value: 'Zoho比較表を4/末に提示 → 上長同席で再ヒアリング' },
    { key: '担当部署・役割', label: '担当部署・役割', value: '現場マネージャー / 決裁権限なし（決裁者は別途特定が必要）' },
    { key: '興味度', label: '興味度', value: '中（要育成）', chipValue: '中（要育成）' },
    { key: '依頼済みタスク', label: '依頼済みタスク', value: '資料請求 / 見積依頼', chipList: ['資料請求', '見積依頼'] },
    { key: '電話可否', label: '電話可否', value: '可（火・木のみ）', chipValue: '時間帯指定あり' },
    { key: 'IS所見メモ', label: 'IS所見メモ', value: '現場の問題意識は明確だが決裁者の特定が課題。次回上長同席アポを取り付ける必要あり。' },
  ],
  'd4': [
    { key: '検討フェーズ', label: '検討フェーズ', value: '情報収集', chipValue: '情報収集' },
    { key: 'サービス認知度', label: 'サービス認知度', value: '名前は知っている', chipValue: '名前は知っている' },
    { key: '興味の対象', label: '興味の対象', value: '採用ファネル管理 / 部長向けKPIレポート' },
    { key: '求めているもの', label: '求めているもの', value: '資料 / 個別相談', chipList: ['資料', '個別相談'] },
    { key: '次の進め方', label: '次の進め方', value: '比較資料送付 → フォローコール → 人事部長を巻き込めるか打診' },
    { key: '担当部署・役割', label: '担当部署・役割', value: '購買担当 / 最終決裁は人事部長' },
    { key: '興味度', label: '興味度', value: '低（情報収集のみ）', chipValue: '低（情報収集のみ）' },
    { key: '依頼済みタスク', label: '依頼済みタスク', value: '資料請求', chipList: ['資料請求'] },
    { key: '電話可否', label: '電話可否', value: '可', chipValue: '可' },
    { key: 'IS所見メモ', label: 'IS所見メモ', value: '購買担当起点のため決裁者プロセスが長い見込み。100万円予算の制約をクリアする機能絞り込み案を提示する必要あり。' },
  ],
}

// ─── 営業フィールド（議事録から自動抽出される基本8項目 + 現状システム + ニーズ + 要望機能） ─
const MOCK_SALES_FIELDS: Record<string, SalesField[]> = {
  'd1': [
    { key: '課題',         label: '課題',         value: 'CRM未導入による商談管理の属人化。週次の数字集約で営業マネージャが深夜労働。' },
    { key: 'ニーズ',       label: 'ニーズ',       value: '営業組織全体で商談進捗を即時可視化し、マネージャ負担ゼロで週次数字を確定させたい' },
    { key: '予算',         label: '予算',         value: '初年度500万円以内 / 追加機能は段階的に検討' },
    { key: '希望サービス', label: '希望サービス', value: 'CRM基本機能 + AI商談サポート(議事録自動要約)' },
    { key: '要望機能',     label: '要望機能',     value: '議事録AI要約 / Slackリアルタイム通知 / パイプラインKPIダッシュボード / 商談録音→文字起こし' },
    { key: 'タイムライン', label: 'タイムライン', value: '2026年4月導入 → 5月全社展開' },
    { key: '決裁者',       label: '決裁者',       value: '鈴木 一郎(CTO) / 最終稟議は社長決裁' },
    { key: '稟議プロセス', label: '稟議プロセス', value: '部門責任者 → CTO技術承認 → 経営会議 → 社長最終決裁。社内ワークフローはGaroon。3/27 起票 → 4/1 完了予定。' },
    { key: '競合',         label: '競合',         value: 'Salesforce / HubSpot の2社を比較中' },
    { key: '障壁',         label: '障壁',         value: '既存スプレッドシート運用からの移行コスト / Slack連携要件' },
    { key: 'その他',       label: 'その他',       value: '導入後はIS/FS両チームに同時展開を希望' },
    { key: '現状システム', label: '現状システム', value: 'Google Sheets(商談管理) + Slack(連絡) + Notion(ナレッジ)' },
    { key: '理想システム', label: '理想システム', value: 'CRM(商談・案件管理) + Slack双方向連携 + AI議事録要約 + KPIダッシュボード（属人ツールを統合）' },
    {
      key: '出席者', label: '出席者', value: null,
      participants: [
        {
          name: '鈴木 一郎（CTO）',
          role: 'CTO / 技術評価・基盤選定の最終承認者',
          mission: '今期内に開発・営業横断のデータ基盤を整え、Slackをハブにした業務オペを実現する',
          vision: '属人化を排除し、技術組織が経営にスピードで貢献できる状態を作る',
        },
        {
          name: '田中 誠（営業部長）',
          role: '営業統括 / 商談プロセス改善の推進担当',
          mission: '週次の数字集約コストをゼロにし、マネージャがコーチングに集中できる体制を作る',
          vision: '受注予測精度を高め、半期計画の達成確度を経営に対して説明できるようになる',
        },
        {
          name: '佐藤 由香（情シス）',
          role: '情シス / セキュリティ・既存システム統合担当',
          mission: 'Slack/Google/Notionの既存資産を壊さず、移行リスクを最小化する',
          vision: 'シャドウITをなくし、社内SaaS全体の運用負担を半減させる',
        },
      ],
    },
  ],
  'd2': [
    { key: '課題',         label: '課題',         value: '契約管理が属人化しており、役員レポートに2日かかる',                                      confidence: 'High'   },
    { key: 'ニーズ',       label: 'ニーズ',       value: '契約状況を役員がリアルタイムに把握でき、レポート作業をゼロにしたい',                     confidence: 'High'   },
    { key: '予算',         label: '予算',         value: '600万円程度を想定',                                                                      confidence: 'High'   },
    { key: '希望サービス', label: '希望サービス', value: 'CRM + 契約管理連携',                                                                     confidence: 'Medium' },
    { key: '要望機能',     label: '要望機能',     value: '契約書バージョン管理 / 役員向けダッシュボード / 電子契約連携(クラウドサイン)',             confidence: 'High'   },
    { key: 'タイムライン', label: 'タイムライン', value: '4月末までに契約締結希望',                                                                confidence: 'High'   },
    { key: '決裁者',       label: '決裁者',       value: '佐々木 拓也(代表取締役)',                                                                confidence: 'High'   },
    { key: '競合',         label: '競合',         value: '検討済 / 当社で決定方向',                                                                confidence: 'High'   },
    { key: '障壁',         label: '障壁',         value: '特になし',                                                                                confidence: 'Medium' },
    { key: 'その他',       label: 'その他',       value: '— AI未収集',                                                                              confidence: 'Low'    },
    { key: '現状システム', label: '現状システム', value: '紙+Excel',                                                                                 confidence: 'Medium' },
  ],
  'd3': [
    { key: '課題',         label: '課題',         value: '問い合わせ管理の抜け漏れ',                                                                confidence: 'Medium' },
    { key: 'ニーズ',       label: 'ニーズ',       value: '問い合わせごとの対応状況をチーム内で一元化し取りこぼしを防ぎたい',                         confidence: 'Medium' },
    { key: '予算',         label: '予算',         value: '200〜300万円',                                                                             confidence: 'Low'    },
    { key: '希望サービス', label: '希望サービス', value: 'CRM基本機能のみ',                                                                          confidence: 'Medium' },
    { key: '要望機能',     label: '要望機能',     value: '問い合わせキュー / 担当アサイン自動化 / SLAアラート',                                      confidence: 'Medium' },
    { key: 'タイムライン', label: 'タイムライン', value: '4月中旬〜',                                                                                confidence: 'Medium' },
    { key: '決裁者',       label: '決裁者',       value: '— AI未収集',                                                                                confidence: 'Low'    },
    { key: '競合',         label: '競合',         value: 'ZohoCRMを比較中',                                                                           confidence: 'Medium' },
    { key: '障壁',         label: '障壁',         value: '— AI未収集',                                                                                confidence: 'Low'    },
    { key: 'その他',       label: 'その他',       value: '— AI未収集',                                                                                confidence: 'Low'    },
    { key: '現状システム', label: '現状システム', value: 'スプレッドシート',                                                                          confidence: 'High'   },
  ],
  'd4': [
    { key: '課題',         label: '課題',         value: '採用管理がチーム横断で分散',                                                                confidence: 'Medium' },
    { key: 'ニーズ',       label: 'ニーズ',       value: '採用ファネル全体を一元管理し、人事部長向けのKPI報告を自動化したい',                         confidence: 'Medium' },
    { key: '予算',         label: '予算',         value: '100万円以下を希望',                                                                          confidence: 'Medium' },
    { key: '希望サービス', label: '希望サービス', value: 'HR向け簡易CRM',                                                                               confidence: 'Medium' },
    { key: '要望機能',     label: '要望機能',     value: '候補者ステージ管理 / 面接予約リマインド / 部長向けKPIレポート',                               confidence: 'Medium' },
    { key: 'タイムライン', label: 'タイムライン', value: '検討継続',                                                                                    confidence: 'Low'    },
    { key: '決裁者',       label: '決裁者',       value: '中村 理恵(購買担当) / 最終は人事部長',                                                       confidence: 'Medium' },
    { key: '競合',         label: '競合',         value: '未検討',                                                                                       confidence: 'Low'    },
    { key: '障壁',         label: '障壁',         value: '予算と優先度',                                                                                 confidence: 'Medium' },
    { key: 'その他',       label: 'その他',       value: '— AI未収集',                                                                                   confidence: 'Low'    },
    { key: '現状システム', label: '現状システム', value: 'Excel + メール',                                                                               confidence: 'Medium' },
  ],
}

// ─── プロダクトフィールド（開発・PDM 視点で扱う項目） ─────────────────────
const MOCK_PRODUCT_FIELDS: Record<string, ProductField[]> = {
  'd1': [
    { key: '機能要件サマリ',     label: '機能要件サマリ',     value: '商談管理 + AI 自動議事録要約 + パイプライン KPI ダッシュボード' },
    { key: '優先度',             label: '優先度',             value: '商談管理 高 / KPI ダッシュボード 中 / AI 議事録 高' },
    { key: '想定利用シーン',     label: '想定利用シーン',     value: '営業1日5商談 × 4チーム同時利用、議事録は商談直後に確認' },
    { key: '想定ユーザー',       label: '想定ユーザー',       value: '営業20名・マネ4名・経営2名 (合計26名)' },
    { key: '統合・連携要件',     label: '統合・連携要件',     value: 'Salesforce読み取り同期、Slack通知、SAP顧客マスタ連携' },
    { key: 'セキュリティ要件',   label: 'セキュリティ要件',   value: 'SAML SSO (Okta) 必須、IP制限、監査ログCSV出力' },
    { key: 'パフォーマンス要件', label: 'パフォーマンス要件', value: 'ダッシュボード初期表示3秒以内、100名同時アクセス' },
    { key: 'カスタマイズ範囲',   label: 'カスタマイズ範囲',   value: 'ステージ・項目のカスタマイズ可、レポートテンプレ独自定義' },
    { key: '段階導入計画',       label: '段階導入計画',       value: 'フェーズ1: 商談管理 (4月) → フェーズ2: AI議事録 (5月) → フェーズ3: BI連携 (Q3)' },
    { key: '技術スタック制約',   label: '技術スタック制約',   value: 'VPC内デプロイ希望なし、SaaS可、データ保管 東京リージョン' },
    { key: 'KPI／成果指標',      label: 'KPI／成果指標',      value: '商談入力工数50%削減、月次レポ作成3時間→30分、解約率改善' },
    { key: 'リスク・懸念',       label: 'リスク・懸念',       value: '現場の入力負荷、既存Salesforce資産との二重管理リスク' },
  ],
  'd2': [
    { key: '機能要件サマリ',     label: '機能要件サマリ',     value: '契約管理 + 役員ダッシュボード + 電子契約(クラウドサイン)連携' },
    { key: '優先度',             label: '優先度',             value: '契約バージョン管理 高 / 役員レポート 高 / 電子契約連携 中' },
    { key: '想定利用シーン',     label: '想定利用シーン',     value: '代表+法務2名が日次で契約状況を確認、役員レポートは月初に自動生成' },
    { key: '想定ユーザー',       label: '想定ユーザー',       value: '代表1名・法務2名・役員3名 (合計6名)' },
    { key: '統合・連携要件',     label: '統合・連携要件',     value: 'クラウドサインAPI連携、freee会計連携(将来検討)' },
    { key: 'セキュリティ要件',   label: 'セキュリティ要件',   value: 'IPアドレス制限、契約書アクセスログ必須' },
    { key: 'パフォーマンス要件', label: 'パフォーマンス要件', value: '契約一覧100件未満想定、レスポンス重視ではない' },
    { key: 'カスタマイズ範囲',   label: 'カスタマイズ範囲',   value: '標準フォームでOK、最低限のカテゴリ追加のみ' },
    { key: '段階導入計画',       label: '段階導入計画',       value: 'フェーズ1: 契約管理 (5月) → フェーズ2: 役員ダッシュボード (6月)' },
    { key: '技術スタック制約',   label: '技術スタック制約',   value: 'SaaS可、特になし' },
    { key: 'KPI／成果指標',      label: 'KPI／成果指標',      value: '役員レポート作成2日→0日、契約書差戻し率20%改善' },
    { key: 'リスク・懸念',       label: 'リスク・懸念',       value: '法務レビューの社内プロセスとの整合、押印フローの社内浸透' },
  ],
  'd3': [
    { key: '機能要件サマリ',     label: '機能要件サマリ',     value: '問い合わせキュー + 担当自動アサイン + SLAアラート' },
    { key: '優先度',             label: '優先度',             value: 'SLAアラート 高 / 担当自動アサイン 高 / レポート 中' },
    { key: '想定利用シーン',     label: '想定利用シーン',     value: 'CSチーム5名がリアルタイムに問い合わせ対応、SLA超過は即Slack通知' },
    { key: '想定ユーザー',       label: '想定ユーザー',       value: 'CS担当5名・上長1名 (合計6名)' },
    { key: '統合・連携要件',     label: '統合・連携要件',     value: 'メール取り込み(IMAP)、Slack通知' },
    { key: 'セキュリティ要件',   label: 'セキュリティ要件',   value: '一般的なSaaS水準で問題なし' },
    { key: 'パフォーマンス要件', label: 'パフォーマンス要件', value: '' },
    { key: 'カスタマイズ範囲',   label: 'カスタマイズ範囲',   value: 'SLA時間閾値・問い合わせカテゴリのカスタマイズが必要' },
    { key: '段階導入計画',       label: '段階導入計画',       value: 'フェーズ1: 基本キュー (5月) → フェーズ2: SLAアラート (6月)' },
    { key: '技術スタック制約',   label: '技術スタック制約',   value: '' },
    { key: 'KPI／成果指標',      label: 'KPI／成果指標',      value: '問い合わせ取りこぼしゼロ、SLA遵守率95%以上' },
    { key: 'リスク・懸念',       label: 'リスク・懸念',       value: '' },
  ],
  'd4': [
    { key: '機能要件サマリ',     label: '機能要件サマリ',     value: '候補者ステージ管理 + 面接リマインド + 人事部長KPIレポート' },
    { key: '優先度',             label: '優先度',             value: '候補者ステージ管理 高 / 面接リマインド 中 / レポート 中' },
    { key: '想定利用シーン',     label: '想定利用シーン',     value: '人事3名が候補者管理、月次で部長向けKPIレポート提出' },
    { key: '想定ユーザー',       label: '想定ユーザー',       value: '人事3名・人事部長1名 (合計4名)' },
    { key: '統合・連携要件',     label: '統合・連携要件',     value: 'Googleカレンダー連携(面接予約)' },
    { key: 'セキュリティ要件',   label: 'セキュリティ要件',   value: '個人情報管理に準拠、アクセスログ取得' },
    { key: 'パフォーマンス要件', label: 'パフォーマンス要件', value: '' },
    { key: 'カスタマイズ範囲',   label: 'カスタマイズ範囲',   value: '採用フェーズの自由設定が必須' },
    { key: '段階導入計画',       label: '段階導入計画',       value: '一括導入想定、フェーズ分けなし' },
    { key: '技術スタック制約',   label: '技術スタック制約',   value: '' },
    { key: 'KPI／成果指標',      label: 'KPI／成果指標',      value: '採用ファネル可視化、KPIレポ作成工数80%削減' },
    { key: 'リスク・懸念',       label: 'リスク・懸念',       value: '予算100万円制約下で機能絞り込み調整が必要' },
  ],
}

// ─── 議事録 一覧（全取引 3件ずつ） ────────────────────────────────────────
const MOCK_MEETINGS: Record<string, MeetingRecord[]> = {
  'd1': [
    {
      id: 'm-d1-1', date: '2026-02-03', sequence: 1, title: '初回商談',
      participants: ['田中 誠(顧客)', '田中太郎(当社)'],
      durationMin: 45,
      summary: '課題ヒアリング中心。CRM未導入で属人化、週次数字集約に時間を要するとの共通認識形成。',
      keyPoints: [
        '営業10名規模、月間商談50件程度',
        '現状: スプレッドシート + Slack で管理',
        '競合としてSalesforce/HubSpotを想定',
        'CTO鈴木氏の承認が必須との言及',
      ],
    },
    {
      id: 'm-d1-2', date: '2026-02-20', sequence: 2, title: '提案レビュー',
      participants: ['田中 誠(顧客)', '鈴木 一郎(顧客/CTO)', '田中太郎(当社)'],
      durationMin: 60,
      summary: 'CTO鈴木氏初回参加。技術面の質問多数。既存Slackワークフローとの統合要件が具体化。',
      keyPoints: [
        'Slack連携は必須要件',
        '初年度予算は500万円以内で確定',
        'Salesforceとの機能比較資料を要請',
        '4月導入 → 5月全社展開のスケジュール合意',
      ],
    },
    {
      id: 'm-d1-3', date: '2026-03-15', sequence: 3, title: '最終交渉',
      participants: ['田中 誠(顧客)', '鈴木 一郎(顧客/CTO)', '田中太郎(当社)', '佐藤(当社/CS)'],
      durationMin: 75,
      summary: 'CTO鈴木氏が「技術的懸念は解消」と発言。導入時期・サポート体制を具体化。最終見積の承認待ち状態へ。',
      keyPoints: [
        'CTO鈴木氏の温度感が明確に前向きに変化',
        '導入時期: 2026年4月15日で合意',
        'サポート: 初期3ヶ月は週次定例でフォロー',
        '最終見積は社内稟議を経て4/1に回答予定',
      ],
    },
  ],
  'd2': [
    {
      id: 'm-d2-1', date: '2026-02-10', sequence: 1, title: '初回アプローチ',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)'],
      durationMin: 30,
      summary: '代表者との顔合わせ。契約管理のペイン(役員レポート2日)を共有。概算予算600万円の示唆。',
      keyPoints: [
        '契約管理の属人化が最大課題',
        '役員レポート作業に2日かかる',
        '予算感: 600万円前後',
        '4月末までに締結したい意向',
      ],
    },
    {
      id: 'm-d2-2', date: '2026-03-10', sequence: 2, title: '代表者商談',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)'],
      durationMin: 60,
      summary: '代表者直々の商談。契約管理の課題共有、当社ソリューションで決定方向との意向表明。',
      keyPoints: [
        '予算600万円即決',
        '4月末までに契約締結希望',
        '導入は段階的でOK',
      ],
    },
    {
      id: 'm-d2-3', date: '2026-04-05', sequence: 3, title: '契約条件最終確認',
      participants: ['佐々木 拓也(顧客/代表)', '田中太郎(当社)', '法務担当(顧客)'],
      durationMin: 45,
      summary: '口頭合意後の最終詰め。契約書ドラフトのレビュー方針・押印スケジュールを確定。',
      keyPoints: [
        '契約書ドラフト: 4/15 までに法務レビュー完了',
        '押印はクラウドサインで4/25実施予定',
        'キックオフミーティングは5月第1週で調整',
      ],
    },
  ],
  'd3': [
    {
      id: 'm-d3-1', date: '2026-02-18', sequence: 1, title: '資料説明コール',
      participants: ['山本 佳子(顧客)', '鈴木花子(当社)'],
      durationMin: 20,
      summary: '短時間の資料説明コール。問い合わせ管理の課題を共有、次回詳細ヒアリングに合意。',
      keyPoints: [
        '問い合わせ管理に課題感あり',
        '「まず一度詳しく話を聞きたい」との発言',
        '現状はスプレッドシートで管理',
      ],
    },
    {
      id: 'm-d3-2', date: '2026-03-05', sequence: 2, title: '初回ヒアリング',
      participants: ['山本 佳子(顧客)', '鈴木花子(当社)'],
      durationMin: 30,
      summary: '問い合わせ管理の課題ヒアリング。ZohoCRMと比較検討中。',
      keyPoints: [
        '予算200〜300万円想定',
        'Zoho CRMを比較',
        '決裁者は別途確認必要',
      ],
    },
    {
      id: 'm-d3-3', date: '2026-04-02', sequence: 3, title: '要件整理ミーティング',
      participants: ['山本 佳子(顧客)', '山本 佳子 上長(顧客)', '鈴木花子(当社)'],
      durationMin: 45,
      summary: '上長同席で要件整理。SLAアラート機能への関心が高まり、Zohoとの機能差分を具体的に質問された。',
      keyPoints: [
        'SLAアラート / 担当自動アサインが最優先要件',
        '上長が登場、決裁者候補として浮上',
        'Zohoとの比較表を5月上旬までに提示要請',
      ],
    },
  ],
  'd4': [
    {
      id: 'm-d4-1', date: '2026-02-10', sequence: 1, title: '資料請求対応コール',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 20,
      summary: '資料請求に対する初回コール。購買担当として情報収集段階であることを確認。',
      keyPoints: [
        '中村氏は購買担当、情報収集フェーズ',
        '人事部長が最終決裁者',
        '複数ツール比較を実施予定',
      ],
    },
    {
      id: 'm-d4-2', date: '2026-02-28', sequence: 2, title: '初回商談',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 40,
      summary: '採用管理の分散課題を共有。予算と優先度が課題。',
      keyPoints: [
        '予算100万円以下希望',
        '最終決裁は人事部長',
        '優先度は現状中程度',
      ],
    },
    {
      id: 'm-d4-3', date: '2026-03-22', sequence: 3, title: '費用感すり合わせ',
      participants: ['中村 理恵(顧客)', '佐藤次郎(当社)'],
      durationMin: 35,
      summary: '比較資料を元に費用感のすり合わせ。現予算では機能絞り込みが必要と判明、人事部長巻き込みのタイミングを協議。',
      keyPoints: [
        '100万円予算だと候補者管理機能のみに絞る必要',
        '人事部長巻き込みは4月後半を目処',
        '他社比較は現時点では未着手',
      ],
    },
  ],
}

// ─── 議事録 集約サマリー（過去の流れ / 現在） ─────────────────────────────
const MOCK_AGGREGATIONS: Record<string, MeetingAggregation> = {
  'd1': {
    history:
      '2/3 初回ヒアリングで属人化の課題を共有 → 2/20 CTO鈴木氏が初登場し技術要件を深掘り、Slack連携と予算500万円で合意 → 3/15 最終交渉で技術的懸念の解消が確認され、導入時期とサポート体制まで具体化。',
    current:
      '最終見積を社内稟議にかけ、4/1回答予定の段階。決裁者CTOの温度感は明確に前向き。残件は4/25の最終デモと役員稟議のみ。',
  },
  'd2': {
    history:
      '2/10 代表者との初回アプローチで契約管理の課題と600万円予算を確認 → 3/10 代表直商談で当社決定の方針を口頭表明 → 4/5 法務同席で契約書・押印スケジュールを確定。',
    current:
      '契約書ドラフトの法務レビューが進行中(4/15完了予定)。4/25 にクラウドサインで押印、5月第1週キックオフの流れで動いており、受注はほぼ確実。',
  },
  'd3': {
    history:
      '2/18 短時間コールで課題感を確認 → 3/5 初回ヒアリングで予算200〜300万円想定とZoho比較中の状況把握 → 4/2 上長同席で要件整理、SLAアラートへの高い関心が判明。',
    current:
      '上長が決裁者候補として浮上し、意思決定プロセスが具体化しつつある段階。5月上旬にZoho比較表を提示することで次フェーズへ進む見込み。',
  },
  'd4': {
    history:
      '2/10 資料請求コールで購買担当の役割と人事部長決裁の構造を把握 → 2/28 初回商談で100万円予算と優先度の課題を共有 → 3/22 費用感すり合わせで機能絞り込み方針を協議。',
    current:
      '予算制約が明確になり、候補者管理機能に絞った提案で再アプローチが必要。人事部長の巻き込みタイミングを4月後半に設定、現状の受注確度は低め。',
  },
}

const MOCK_STAGE_HISTORY: StageHistoryItem[] = [
  { stage: 'NEW_LEAD',      date: '2026-01-15', daysAgo: 67, isCurrent: false },
  { stage: 'QUALIFIED',     date: '2026-01-22', daysAgo: 60, isCurrent: false },
  { stage: 'FIRST_MEETING', date: '2026-02-03', daysAgo: 48, isCurrent: false },
  { stage: 'SOLUTION_FIT',  date: '2026-02-20', daysAgo: 31, isCurrent: false },
  { stage: 'PROPOSAL',      date: '2026-03-05', daysAgo: 18, isCurrent: false },
  { stage: 'NEGOTIATION',   date: '2026-03-15', daysAgo:  8, isCurrent: true  },
]

// ─── タスク初期モックデータ ───────────────────────────────────────────────
const INITIAL_DEAL_TASKS: Record<string, DealTask[]> = {
  'd1': [
    { id: 't-d1-1', type: 'meeting',  title: 'デモ商談実施',         dueAt: '2026-04-15', memo: '製品デモと質疑応答',          done: false },
    { id: 't-d1-2', type: 'proposal', title: '提案書送付',           dueAt: '2026-04-18', memo: '比較表と見積書を含める',      done: false },
    { id: 't-d1-3', type: 'followup', title: '導入後フォロー設計',   dueAt: '2026-04-25', memo: '初期サポート計画を準備',      done: false },
  ],
  'd2': [
    { id: 't-d2-1', type: 'call', title: '最終確認コール', dueAt: '2026-04-14', memo: '契約書ドラフト確認', done: false },
  ],
  'd3': [],
  'd4': [],
}

interface DealTaskTypeStyle {
  Icon: React.ElementType
  label: string
  // フラットな単色 background + アイコン色 (Liquid Obsidian)
  bg: string
  iconColor: string
}

const DEAL_TASK_TYPE_STYLES: Record<DealTaskType, DealTaskTypeStyle> = {
  call:     { Icon: Phone,        label: 'コール',   bg: 'rgba(126,198,255,0.14)', iconColor: 'var(--color-obs-low)' },
  email:    { Icon: Mail,         label: 'メール',   bg: 'rgba(171,199,255,0.14)', iconColor: 'var(--color-obs-primary)' },
  meeting:  { Icon: Briefcase,    label: '商談',     bg: 'rgba(74,217,138,0.14)',  iconColor: '#4ad98a' },
  proposal: { Icon: BookOpen,     label: '提案書',   bg: 'rgba(255,184,107,0.14)', iconColor: 'var(--color-obs-middle)' },
  followup: { Icon: TrendingUp,   label: 'フォロー', bg: 'rgba(171,199,255,0.10)', iconColor: 'var(--color-obs-primary)' },
  other:    { Icon: CheckCircle2, label: 'その他',   bg: 'rgba(143,140,144,0.14)', iconColor: 'var(--color-obs-text-muted)' },
}

const ALL_DEAL_TASK_TYPES: DealTaskType[] = ['call', 'email', 'meeting', 'proposal', 'followup', 'other']

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'call',  timestamp: '2026-03-20T14:32', title: 'コール — アポ獲得', result: 'アポ獲得', durationSec: 154, description: '3/28 14:00 デモ商談を設定' },
  { id: '2', type: 'deal_advance', timestamp: '2026-03-20T14:33', title: 'PROPOSAL → NEGOTIATION に進行' },
  { id: '3', type: 'email', timestamp: '2026-03-17T09:00', title: 'メール送信', description: '会社紹介資料・比較表を添付' },
  { id: '4', type: 'call',  timestamp: '2026-03-15T11:15', title: 'コール — 不在', result: '不在', durationSec: 0 },
  { id: '5', type: 'note',  timestamp: '2026-03-10T16:00', title: 'メモ', description: 'CTOが4月以降のロードマップを検討中との情報あり' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Style Config (Liquid Obsidian)
// ═══════════════════════════════════════════════════════════════════════════════

// IS フィールドのチップトーン（電話/メール抽出値の色分け）
type ChipTone = 'primary' | 'low' | 'middle' | 'hot' | 'neutral'

const IS_CHIP_TONE: Record<string, ChipTone> = {
  // 検討フェーズ
  '情報収集': 'neutral',
  '検討中': 'low',
  '比較検討': 'middle',
  '導入決定間近': 'primary',
  // サービス認知度
  '未認知': 'neutral',
  '名前は知っている': 'low',
  '内容を理解': 'primary',
  '導入経験あり': 'primary',
  // 興味度
  '高（前向き）': 'primary',
  '中（要育成）': 'middle',
  '低（情報収集のみ）': 'neutral',
  // 電話可否
  '可': 'primary',
  '時間帯指定あり': 'middle',
  '不可': 'hot',
  // 共通
  '未確認': 'neutral',
  '未測定': 'neutral',
}

const CHIP_TONE_STYLE: Record<ChipTone, React.CSSProperties> = {
  primary: { background: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  low:     { background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)'     },
  middle:  { background: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)'  },
  hot:     { background: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)'     },
  neutral: { background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' },
}

// ステージごとの chip（Obsidian 準拠）— 色は tone で吸収
const STAGE_CONFIG: Record<DealStage, { label: string; tone: 'primary' | 'hot' | 'middle' | 'low' | 'neutral' }> = {
  NEW_LEAD:      { label: '新規リード', tone: 'neutral' },
  QUALIFIED:     { label: '有資格',     tone: 'low'     },
  FIRST_MEETING: { label: '初回商談',   tone: 'primary' },
  SOLUTION_FIT:  { label: '課題適合',   tone: 'primary' },
  PROPOSAL:      { label: '提案',       tone: 'middle'  },
  NEGOTIATION:   { label: '交渉',       tone: 'hot'     },
  VERBAL_COMMIT: { label: '口頭合意',   tone: 'primary' },
  CLOSED_WON:    { label: '受注',       tone: 'primary' },
  CLOSED_LOST:   { label: '失注',       tone: 'neutral' },
}

// 取引パイプラインの全ステージ順序（前進/後退の判定にも使用）
const ALL_STAGES: DealStage[] = [
  'NEW_LEAD', 'QUALIFIED', 'FIRST_MEETING', 'SOLUTION_FIT',
  'PROPOSAL', 'NEGOTIATION', 'VERBAL_COMMIT', 'CLOSED_WON', 'CLOSED_LOST',
]

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 今日と対象日の差分（日数）。正=未来、負=過去、0=今日。
function daysFromToday(dateStr: string): number {
  const ms = 1000 * 60 * 60 * 24
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  const today = new Date(`${todayISO()}T00:00:00`).getTime()
  return Math.round((target - today) / ms)
}

// DealStatus
const DEAL_STATUS_TONE: Record<DealStatus, { bg: string; color: string; dot: string }> = {
  'アクティブ': { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)',     dot: 'var(--color-obs-low)'     },
  '優先対応':   { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',     dot: 'var(--color-obs-hot)'     },
  '保留':       { bg: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)', dot: 'var(--color-obs-text-muted)' },
}

const IS_STATUS_TONE: Record<ISContactStatus, { bg: string; color: string; dot: string }> = {
  '未着手':      { bg: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)', dot: 'var(--color-obs-text-muted)' },
  '不通':        { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',        dot: 'var(--color-obs-hot)'     },
  '不在':        { bg: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)',     dot: 'var(--color-obs-middle)'  },
  '接続済み':    { bg: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)',        dot: 'var(--color-obs-low)'     },
  'コール不可':  { bg: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)',        dot: 'var(--color-obs-hot)'     },
  'アポ獲得':    { bg: 'rgba(126,198,255,0.18)', color: '#7ec6ff',                     dot: 'var(--color-obs-low)'     },
  'Next Action': { bg: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)',    dot: 'var(--color-obs-primary)' },
}

const ACTIVITY_ICON: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  call:         { icon: PhoneCall,     color: 'var(--color-obs-low)',     bg: 'rgba(126,198,255,0.14)' },
  email:        { icon: Mail,          color: 'var(--color-obs-primary)', bg: 'rgba(171,199,255,0.14)' },
  note:         { icon: MessageSquare, color: 'var(--color-obs-text-muted)', bg: 'rgba(143,140,144,0.14)' },
  deal_advance: { icon: TrendingUp,    color: 'var(--color-obs-middle)',  bg: 'rgba(255,184,107,0.14)' },
}

// 共通カードスタイル（No-Line Rule: surface shift + ゴーストアウトライン）
const OBS_CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-obs-surface-high)',
  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12), 0 2px 12px rgba(0,0,0,0.35)',
}

const OBS_CARD_DIVIDER: React.CSSProperties = {
  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.12)',
}

const OBS_ROW_DIVIDER: React.CSSProperties = {
  boxShadow: 'inset 0 -1px 0 rgba(109,106,111,0.10)',
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: DealStatus }) {
  const s = DEAL_STATUS_TONE[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  )
}

function StageBadge({ stage }: { stage: DealStage }) {
  const cfg = STAGE_CONFIG[stage]
  const toneStyle: Record<string, React.CSSProperties> = {
    neutral: { background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' },
    hot:     { background: 'rgba(255,107,107,0.14)', color: 'var(--color-obs-hot)'     },
    middle:  { background: 'rgba(255,184,107,0.14)', color: 'var(--color-obs-middle)'  },
    low:     { background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)'     },
    primary: { background: 'rgba(171,199,255,0.14)', color: 'var(--color-obs-primary)' },
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold" style={toneStyle[cfg.tone]}>
      {cfg.label}
    </span>
  )
}

// 出席者：職種・任務・成し遂げたいことを縦積みカードで表示
function ParticipantsList({ participants }: { participants: Participant[] }) {
  return (
    <div className="flex flex-col gap-2">
      {participants.map((p, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-obs-md)] p-3"
          style={{
            background: 'var(--color-obs-surface-low)',
            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.10)',
          }}
        >
          <div className="text-[13px] font-semibold mb-2" style={{ color: 'var(--color-obs-text)' }}>
            {p.name}
          </div>
          <div className="grid grid-cols-[68px_1fr] gap-x-3 gap-y-1.5 text-[12px] leading-relaxed">
            <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              職種
            </span>
            <span style={{ color: 'var(--color-obs-text-muted)' }}>{p.role}</span>

            <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              任務
            </span>
            <span style={{ color: 'var(--color-obs-text-muted)' }}>{p.mission}</span>

            <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase pt-0.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
              目指す姿
            </span>
            <span style={{ color: 'var(--color-obs-text-muted)' }}>{p.vision}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3" style={OBS_ROW_DIVIDER}>
      <span className="text-[12px] font-medium w-28 shrink-0" style={{ color: 'var(--color-obs-text-subtle)' }}>{label}</span>
      <div className="flex-1 text-right text-[13px]" style={{ color: 'var(--color-obs-text)' }}>{children}</div>
    </div>
  )
}

// カードヘッダ
function CardHeader({ icon: Icon, title, right, iconTint = 'primary' }: {
  icon: React.ElementType
  title: string
  right?: React.ReactNode
  iconTint?: 'primary' | 'low' | 'middle' | 'hot'
}) {
  const tintMap = {
    primary: 'var(--color-obs-primary)',
    low: 'var(--color-obs-low)',
    middle: 'var(--color-obs-middle)',
    hot: 'var(--color-obs-hot)',
  }
  return (
    <div className="flex items-center gap-2.5 px-5 py-3.5" style={OBS_CARD_DIVIDER}>
      <Icon size={14} style={{ color: tintMap[iconTint] }} className="shrink-0" />
      <h3 className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>{title}</h3>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  )
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

function formatDateShort(s: string): string {
  const d = new Date(s)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDuration(sec: number): string {
  if (sec === 0) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// Deal Task Modal
// ═══════════════════════════════════════════════════════════════════════════════

function DealTaskModal({ task, onClose, onSave }: {
  task: DealTask | null
  onClose: () => void
  onSave: (t: DealTask) => void
}) {
  const isEdit = !!task
  const [form, setForm] = useState<DealTask>(task ?? {
    id: `t-${Date.now()}`,
    type: 'call',
    title: '',
    dueAt: null,
    memo: '',
    done: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), memo: form.memo.trim() })
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] overflow-hidden"
        style={{
          background: 'var(--color-obs-surface-highest)',
          borderRadius: 'var(--radius-obs-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(109,106,111,0.18)',
        }}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={OBS_CARD_DIVIDER}>
          <h2 className="text-[16px] font-bold" style={{ color: 'var(--color-obs-text)' }}>
            {isEdit ? 'タスク編集' : 'タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-[rgba(171,199,255,0.08)]"
          >
            <X size={16} style={{ color: 'var(--color-obs-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            {/* タスク種別 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>タスク種別</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DEAL_TASK_TYPES.map(t => {
                  const s = DEAL_TASK_TYPE_STYLES[t]
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="inline-flex items-center gap-1.5 px-3 h-[32px] rounded-[8px] text-[11px] font-medium transition-all"
                      style={active ? {
                        backgroundColor: s.bg,
                        color: s.iconColor,
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      } : {
                        background: 'var(--color-obs-surface)',
                        color: 'var(--color-obs-text-muted)',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      }}
                    >
                      <s.Icon size={11} strokeWidth={2.2} style={{ color: active ? s.iconColor : 'var(--color-obs-text-muted)' }} />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>
                タイトル <span style={{ color: 'var(--color-obs-hot)' }}>*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="例: デモ商談実施"
                required
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            {/* 期日 */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between" style={{ color: 'var(--color-obs-text-subtle)' }}>
                <span>期日</span>
                {form.dueAt && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, dueAt: null }))}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold transition-colors normal-case tracking-normal"
                    style={{ color: 'var(--color-obs-text-muted)' }}
                  >
                    <X size={10} />
                    クリア
                  </button>
                )}
              </label>
              <input
                type="date"
                value={form.dueAt ?? ''}
                onChange={e => setForm(f => ({ ...f, dueAt: e.target.value || null }))}
                className="w-full h-[36px] px-3 text-[14px] rounded-[8px] outline-none cursor-pointer"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  colorScheme: 'dark',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>

            {/* メモ */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block" style={{ color: 'var(--color-obs-text-subtle)' }}>メモ</label>
              <textarea
                value={form.memo}
                onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                placeholder="タスクに関するメモを入力..."
                rows={3}
                className="w-full px-3 py-2 text-[13px] outline-none rounded-[8px] resize-none"
                style={{
                  background: 'var(--color-obs-surface-lowest)',
                  color: 'var(--color-obs-text)',
                  boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4" style={OBS_CARD_DIVIDER}>
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 text-[13px] font-medium rounded-[8px] transition-colors hover:bg-[rgba(171,199,255,0.06)]"
              style={{ color: 'var(--color-obs-text-muted)' }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="h-[36px] px-5 text-[13px] font-semibold rounded-[8px] transition-all hover:brightness-106"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
              }}
            >
              {isEdit ? '保存' : '作成'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════════

type TabType = 'all' | 'call' | 'email' | 'note'

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const { startCall } = useCallStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const rawDeal = (MOCK_DEALS[id] ?? MOCK_DEALS['d1'])!

  // 進捗管理（state で管理、保存はstateのみ）
  const [progressStatus, setProgressStatus] = useState<string>(rawDeal.progressStatus)
  const [nextAction, setNextAction] = useState<string>(rawDeal.nextAction)
  const [nextActionDate, setNextActionDate] = useState<string | null>(rawDeal.nextActionDate)
  const [memo, setMemo] = useState<string>(rawDeal.memo)

  const deal: DealDetail = {
    ...rawDeal,
    progressStatus,
    nextAction,
    nextActionDate,
    memo,
  }

  // タスクの state
  const [tasks, setTasks] = useState<DealTask[]>(INITIAL_DEAL_TASKS[id] ?? [])
  const [taskModal, setTaskModal] = useState<DealTask | null | 'new'>(null)

  // ステージ履歴の state（編集可能）
  const [stageHistory, setStageHistory] = useState<StageHistoryItem[]>(MOCK_STAGE_HISTORY)
  const [isStagePickerOpen, setIsStagePickerOpen] = useState(false)
  const currentStage: DealStage = stageHistory.find(h => h.isCurrent)?.stage ?? rawDeal.stage

  function handleChangeStage(next: DealStage) {
    if (next === currentStage) {
      setIsStagePickerOpen(false)
      return
    }
    setStageHistory(prev => {
      const cleared = prev.map(h => ({ ...h, isCurrent: false }))
      return [
        ...cleared,
        { stage: next, date: todayISO(), daysAgo: 0, isCurrent: true },
      ]
    })
    setIsStagePickerOpen(false)
  }

  function handleTaskSave(t: DealTask) {
    setTasks(prev => {
      const exists = prev.find(x => x.id === t.id)
      if (exists) return prev.map(x => x.id === t.id ? t : x)
      return [t, ...prev]
    })
  }
  function handleTaskDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }
  function handleTaskToggle(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const filteredActivities = activeTab === 'all'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.type === activeTab)

  const probPct = deal.probability

  // 取引に紐づく IS / 営業 / プロダクト フィールド / 議事録 / 集約
  const isFields = MOCK_IS_FIELDS[id] ?? MOCK_IS_FIELDS['d1']!
  const salesFields = MOCK_SALES_FIELDS[id] ?? MOCK_SALES_FIELDS['d1']!
  const productFields = MOCK_PRODUCT_FIELDS[id] ?? MOCK_PRODUCT_FIELDS['d1']!
  const meetings = MOCK_MEETINGS[id] ?? []
  const aggregation = MOCK_AGGREGATIONS[id] ?? null

  // 議事録タブ: デフォルト最新
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(
    meetings.length > 0 ? meetings[meetings.length - 1]!.id : null
  )
  // id が変わった時(取引切替時)には最新を選択し直す
  React.useEffect(() => {
    if (meetings.length === 0) {
      setActiveMeetingId(null)
      return
    }
    const exists = meetings.some(m => m.id === activeMeetingId)
    if (!exists) {
      setActiveMeetingId(meetings[meetings.length - 1]!.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) ?? null

  return (
    <ObsPageShell>
      <div className="w-full px-6 xl:px-10 2xl:px-14 pb-16 pt-6">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 text-[12px] transition-colors mb-2 hover:text-[var(--color-obs-text)]"
            style={{ color: 'var(--color-obs-text-muted)' }}
          >
            <ChevronLeft size={13} />
            取引一覧
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1
                  className="text-[22px] font-semibold tracking-[-0.03em] truncate font-[family-name:var(--font-display)]"
                  style={{ color: 'var(--color-obs-text)' }}
                >
                  {deal.name}
                </h1>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <StageBadge stage={currentStage} />
                <StatusBadge status={deal.status} />
                <span className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--color-obs-text)' }}>
                  ¥{(deal.amount / 1000000).toFixed(1)}M
                </span>
                <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                  確度 {deal.probability}%
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ filter: 'brightness(1.06)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={() => startCall({
                contactId: deal.contactId,
                contactName: deal.contact,
                company: deal.company,
                phone: deal.contactPhone,
              })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-obs-md)] text-[13px] font-semibold shrink-0"
              style={{
                background: 'var(--color-obs-primary-container)',
                color: 'var(--color-obs-on-primary)',
                boxShadow: '0 8px 24px rgba(0,113,227,0.20)',
              }}
            >
              <Phone size={13} strokeWidth={2.4} />
              コールする
            </motion.button>
          </div>
        </div>

        {/* ── 2-Column Layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── Main Column ── */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* ─── 基本情報 ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader icon={Target} title="基本情報" iconTint="primary" />
              <div className="px-5">
                <InfoRow label="会社">
                  <span
                    className="cursor-pointer transition-colors hover:text-[var(--color-obs-primary)]"
                    onClick={() => router.push(`/companies/${deal.companyId}`)}
                  >
                    <Building2 size={11} className="inline mr-1" style={{ color: 'var(--color-obs-text-muted)' }} />
                    {deal.company}
                  </span>
                </InfoRow>
                <InfoRow label="担当者">
                  <span
                    className="cursor-pointer transition-colors hover:text-[var(--color-obs-primary)]"
                    onClick={() => router.push(`/contacts/${deal.contactId}`)}
                  >
                    <User size={11} className="inline mr-1" style={{ color: 'var(--color-obs-text-muted)' }} />
                    {deal.contact}
                  </span>
                </InfoRow>
                <InfoRow label="担当営業">
                  <span className="flex items-center justify-end gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                        color: 'var(--color-obs-on-primary)',
                      }}
                    >
                      {deal.owner[0]}
                    </div>
                    {deal.owner}
                  </span>
                </InfoRow>
                <InfoRow label="金額">
                  <span className="font-semibold">¥{deal.amount.toLocaleString()}</span>
                </InfoRow>
                <InfoRow label="確度">
                  <div className="flex items-center justify-end gap-2">
                    <div
                      className="w-20 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--color-obs-surface-lowest)' }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${probPct}%` }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="font-semibold tabular-nums">{deal.probability}%</span>
                  </div>
                </InfoRow>
                <InfoRow label="想定クローズ">
                  <span className="flex items-center justify-end gap-1">
                    <Calendar size={11} style={{ color: 'var(--color-obs-text-muted)' }} />
                    {formatDate(deal.expectedCloseAt)}
                  </span>
                </InfoRow>
                <InfoRow label="ステータス">
                  <div className="flex justify-end">
                    <StatusBadge status={deal.status} />
                  </div>
                </InfoRow>
              </div>
            </motion.div>

            {/* ─── ISフィールド（電話・メールから自動抽出） ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Headphones}
                title="ISフィールド"
                iconTint="low"
                right={
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(126,198,255,0.12)', color: 'var(--color-obs-low)' }}
                  >
                    <Headphones size={9} />
                    電話・メールから自動抽出
                  </span>
                }
              />

              {/* 初回商談までの IS 活動 の境界線（カレンダー連携で取得） */}
              {(() => {
                const firstMeeting = stageHistory.find(h => h.stage === 'FIRST_MEETING')
                if (!firstMeeting) {
                  return (
                    <div
                      className="flex items-center gap-2.5 px-5 py-2.5"
                      style={OBS_ROW_DIVIDER}
                    >
                      <Calendar size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        初回商談 <span style={{ color: 'var(--color-obs-text-muted)' }}>未設定</span>
                        <span className="ml-1.5 text-[10px]">（カレンダー連携で自動取得）</span>
                      </span>
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        初回商談までのIS活動を可視化
                      </span>
                    </div>
                  )
                }
                const diff = daysFromToday(firstMeeting.date)
                const isPast = diff < 0
                const isToday = diff === 0
                const labelTone: ChipTone = isPast ? 'neutral' : isToday ? 'middle' : 'low'
                const labelText = isToday
                  ? '本日 実施'
                  : isPast
                    ? `${Math.abs(diff)}日前 実施済`
                    : `${diff}日後 実施予定`
                return (
                  <div
                    className="flex items-center gap-2.5 px-5 py-2.5"
                    style={OBS_ROW_DIVIDER}
                  >
                    <Calendar size={11} style={{ color: 'var(--color-obs-text-subtle)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      初回商談{' '}
                      <span className="tabular-nums font-medium" style={{ color: 'var(--color-obs-text)' }}>
                        {firstMeeting.date.replace(/-/g, '/')}
                      </span>
                    </span>
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={CHIP_TONE_STYLE[labelTone]}
                    >
                      {labelText}
                    </span>
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      初回商談までのIS活動を可視化
                    </span>
                  </div>
                )
              })()}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {isFields.map((field, i) => {
                  const chipTone: ChipTone | null = field.chipValue ? (IS_CHIP_TONE[field.chipValue] ?? 'neutral') : null
                  return (
                    <motion.div
                      key={field.key}
                      variants={{
                        hidden: { opacity: 0, y: 5 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="flex items-start gap-3 px-5 py-3"
                      style={i < isFields.length - 1 ? OBS_ROW_DIVIDER : undefined}
                    >
                      <span className="text-[12px] w-[110px] shrink-0 pt-0.5 leading-tight font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        {field.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        {field.chipList && field.chipList.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {field.chipList.map((c) => (
                              <span
                                key={c}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={CHIP_TONE_STYLE.primary}
                              >
                                {c}
                              </span>
                            ))}
                            {field.value && (
                              <span className="text-[12px] ml-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                                {/* チップ集合の補足は表示しない（chipList が主） */}
                              </span>
                            )}
                          </div>
                        ) : chipTone ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                              style={CHIP_TONE_STYLE[chipTone]}
                            >
                              {field.chipValue}
                            </span>
                            {field.value && field.value !== field.chipValue && (
                              <span className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {field.value}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[13px] leading-relaxed block" style={{ color: 'var(--color-obs-text)' }}>
                            {field.value ?? <span style={{ color: 'var(--color-obs-text-subtle)' }}>— AI未収集</span>}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>

            {/* ─── 営業フィールド（議事録から自動抽出） ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Zap}
                title="営業フィールド"
                iconTint="primary"
                right={
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                  >
                    <Zap size={9} />
                    議事録から自動抽出
                  </span>
                }
              />

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {salesFields.map((field, i) => (
                  <motion.div
                    key={field.key}
                    variants={{
                      hidden: { opacity: 0, y: 5 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-start gap-3 px-5 py-3"
                    style={i < salesFields.length - 1 ? OBS_ROW_DIVIDER : undefined}
                  >
                    <span className="text-[12px] w-[100px] shrink-0 pt-0.5 leading-tight font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {field.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      {field.key === '出席者' && field.participants ? (
                        <ParticipantsList participants={field.participants} />
                      ) : (
                        <span className="text-[13px] leading-relaxed block" style={{ color: 'var(--color-obs-text)' }}>
                          {field.value ?? <span style={{ color: 'var(--color-obs-text-subtle)' }}>— AI未収集</span>}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* ─── プロダクトフィールド（議事録から自動抽出 / 開発・PDM 視点） ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Cpu}
                title="プロダクトフィールド"
                iconTint="low"
                right={
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                  >
                    <Zap size={9} />
                    議事録から自動抽出
                  </span>
                }
              />

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              >
                {productFields.map((field, i) => (
                  <motion.div
                    key={field.key}
                    variants={{
                      hidden: { opacity: 0, y: 5 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="flex items-start gap-3 px-5 py-3"
                    style={i < productFields.length - 1 ? OBS_ROW_DIVIDER : undefined}
                  >
                    <span className="text-[12px] w-[100px] shrink-0 pt-0.5 leading-tight font-medium" style={{ color: 'var(--color-obs-text-subtle)' }}>
                      {field.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] leading-relaxed block" style={{ color: 'var(--color-obs-text)' }}>
                        {field.value
                          ? field.value
                          : <span style={{ color: 'var(--color-obs-text-subtle)' }}>— AI未収集</span>}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* ─── 議事録 (タブ切替型) ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={FileText}
                title="議事録"
                iconTint="low"
                right={
                  <span
                    className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(126,198,255,0.14)', color: 'var(--color-obs-low)' }}
                  >
                    {meetings.length}件
                  </span>
                }
              />

              {/* 集約サマリー（最上部に常時表示、コンパクト） */}
              {aggregation && (
                <div
                  className="p-4"
                  style={{
                    background: 'var(--color-obs-surface-low)',
                    ...OBS_ROW_DIVIDER,
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={12} style={{ color: 'var(--color-obs-primary)' }} />
                    <h4
                      className="text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: 'var(--color-obs-primary)' }}
                    >
                      集約サマリー
                    </h4>
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--color-obs-text-subtle)' }}
                    >
                      (全{meetings.length}件を横串整理)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* 過去の流れ */}
                    <div
                      className="p-3 rounded-[var(--radius-obs-md)]"
                      style={{ background: 'var(--color-obs-surface-lowest)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        <History size={10} style={{ color: 'var(--color-obs-middle)' }} />
                        過去の流れ
                      </p>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-obs-text)' }}>
                        {aggregation.history}
                      </p>
                    </div>

                    {/* 現在 */}
                    <div
                      className="p-3 rounded-[var(--radius-obs-md)]"
                      style={{ background: 'rgba(171,199,255,0.06)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-obs-primary)' }}>
                        <Flame size={10} style={{ color: 'var(--color-obs-primary)' }} />
                        現在
                      </p>
                      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--color-obs-text)' }}>
                        {aggregation.current}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 議事録: タブ切替 */}
              {meetings.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    議事録がまだありません
                  </p>
                </div>
              ) : (
                <div>
                  {/* タブボタン */}
                  <div
                    className="flex items-center gap-1.5 px-5 py-3 flex-wrap"
                    style={OBS_ROW_DIVIDER}
                  >
                    {meetings.map(m => {
                      const active = m.id === activeMeetingId
                      return (
                        <button
                          key={m.id}
                          onClick={() => setActiveMeetingId(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-[8px] text-[11.5px] font-medium transition-all"
                          style={active ? {
                            backgroundColor: 'rgba(171,199,255,0.14)',
                            color: 'var(--color-obs-primary)',
                          } : {
                            background: 'var(--color-obs-surface-lowest)',
                            color: 'var(--color-obs-text-muted)',
                            boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                          }}
                        >
                          <span className="tabular-nums">第{m.sequence}回</span>
                          <span
                            className="text-[10px] tabular-nums"
                            style={{ opacity: active ? 0.85 : 0.7 }}
                          >
                            ({formatDateShort(m.date)})
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* 選択中の1件を表示 */}
                  {activeMeeting && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeMeeting.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="p-5"
                      >
                        {/* Header row */}
                        <div className="flex items-start gap-3 mb-2">
                          {/* Sequence badge — flat primary tone */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold"
                            style={{
                              backgroundColor: 'rgba(171,199,255,0.14)',
                              color: 'var(--color-obs-primary)',
                            }}
                          >
                            {activeMeeting.sequence}
                          </div>

                          {/* Title area */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-[13.5px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                                {activeMeeting.sequence}回目 — {activeMeeting.title}
                              </h4>
                              <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {formatDate(activeMeeting.date)}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ background: 'rgba(143,140,144,0.14)', color: 'var(--color-obs-text-muted)' }}
                              >
                                <Clock size={9} />
                                {activeMeeting.durationMin}分
                              </span>
                            </div>

                            {/* Participants */}
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <Users size={10} style={{ color: 'var(--color-obs-text-subtle)' }} />
                              <span className="text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {activeMeeting.participants.join('、')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        <p className="text-[12.5px] leading-relaxed mb-3 pl-12" style={{ color: 'var(--color-obs-text)' }}>
                          {activeMeeting.summary}
                        </p>

                        {/* Key points */}
                        <div className="pl-12">
                          <p className="text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--color-obs-text-subtle)' }}>
                            キーポイント
                          </p>
                          <ul className="space-y-1">
                            {activeMeeting.keyPoints.map((kp, j) => (
                              <li key={j} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: 'var(--color-obs-text-muted)' }}>
                                <span className="shrink-0 font-bold" style={{ color: 'var(--color-obs-low)' }}>▸</span>
                                <span>{kp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              )}
            </motion.div>

            {/* ─── IS Contact List ─────────────────────────────── */}
            {(DEAL_CONTACTS[id] ?? []).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[var(--radius-obs-xl)] overflow-hidden"
                style={OBS_CARD_STYLE}
              >
                <CardHeader
                  icon={Phone}
                  title="コンタクト(IS)"
                  iconTint="primary"
                  right={
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                    >
                      {(DEAL_CONTACTS[id] ?? []).length}
                    </span>
                  }
                />

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                >
                  {(DEAL_CONTACTS[id] ?? []).map((contact, i) => {
                    const ss = IS_STATUS_TONE[contact.status]
                    return (
                      <motion.div
                        key={contact.id}
                        variants={{
                          hidden: { opacity: 0, y: 5 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                        }}
                        className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-[rgba(171,199,255,0.04)]"
                        style={i < (DEAL_CONTACTS[id] ?? []).length - 1 ? OBS_ROW_DIVIDER : undefined}
                        onClick={() => router.push(`/contacts/${contact.id}`)}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-obs-primary) 0%, var(--color-obs-primary-container) 100%)',
                            color: 'var(--color-obs-on-primary)',
                          }}
                        >
                          {contact.name[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                              {contact.name}
                            </span>
                            {contact.isDecisionMaker && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold"
                                style={{ background: 'rgba(255,184,107,0.16)', color: 'var(--color-obs-middle)' }}
                              >
                                <Star size={8} strokeWidth={2.5} />
                                決裁者
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                            {contact.title}
                          </p>
                        </div>

                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                          style={{ background: ss.bg, color: ss.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ss.dot }} />
                          {contact.status}
                        </span>

                        <span className="flex items-center gap-1 text-[11px] shrink-0" style={{ color: 'var(--color-obs-text-muted)' }}>
                          <Phone size={10} />
                          {contact.callAttempts}回
                        </span>
                      </motion.div>
                    )
                  })}
                </motion.div>

                <div className="px-5 py-3" style={OBS_ROW_DIVIDER}>
                  <button
                    className="flex items-center gap-1.5 text-[12px] transition-colors font-medium hover:text-[var(--color-obs-text)]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    コンタクトを追加
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── Activity Timeline ──────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <div className="flex items-center gap-0 px-5" style={OBS_CARD_DIVIDER}>
                <Activity size={14} style={{ color: 'var(--color-obs-primary)' }} />
                <h3 className="text-[13px] font-semibold ml-2 mr-4 tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                  アクティビティ
                </h3>
                {([
                  { key: 'all', label: '全件' },
                  { key: 'call', label: 'コール' },
                  { key: 'email', label: 'メール' },
                  { key: 'note', label: 'ノート' },
                ] as { key: TabType; label: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="relative px-3 py-3 text-[13px] font-medium transition-colors duration-100"
                    style={{ color: activeTab === tab.key ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)' }}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="deal-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                        style={{ background: 'var(--color-obs-primary)' }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {filteredActivities.length === 0 ? (
                  <p className="text-center text-[13px] py-6" style={{ color: 'var(--color-obs-text-muted)' }}>
                    活動記録がありません
                  </p>
                ) : (
                  <motion.div
                    className="relative"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                  >
                    <div
                      className="absolute left-[14px] top-4 bottom-4 w-px"
                      style={{ background: 'var(--color-obs-outline-variant)', opacity: 0.5 }}
                    />

                    <div className="space-y-4">
                      {filteredActivities.map((activity) => {
                        const cfg = ACTIVITY_ICON[activity.type]
                        const Icon = cfg.icon
                        return (
                          <motion.div
                            key={activity.id}
                            variants={{
                              hidden: { opacity: 0, x: -8 },
                              visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
                            }}
                            className="flex gap-3 pl-1"
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 relative z-10"
                              style={{ background: cfg.bg }}
                            >
                              <Icon size={13} style={{ color: cfg.color }} />
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[13px] font-medium tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                                  {activity.title}
                                </span>
                                {activity.result && (
                                  <span
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                                    style={{ background: 'rgba(171,199,255,0.10)', color: 'var(--color-obs-primary)' }}
                                  >
                                    {activity.result}
                                  </span>
                                )}
                                {activity.durationSec !== undefined && activity.durationSec > 0 && (
                                  <span className="flex items-center gap-0.5 text-[11px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                                    <Clock size={10} />
                                    {formatDuration(activity.durationSec)}
                                  </span>
                                )}
                              </div>
                              {activity.description && (
                                <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-obs-text-muted)' }}>
                                  {activity.description}
                                </p>
                              )}
                              <p className="text-[11px] mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                                {formatTimestamp(activity.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ─── Google 連携タイムライン（メール/会議/議事録） ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <div className="flex items-center gap-2 px-5 py-4" style={OBS_CARD_DIVIDER}>
                <Mail size={14} style={{ color: 'var(--color-obs-primary)' }} />
                <h3 className="text-[13px] font-semibold tracking-[-0.01em]" style={{ color: 'var(--color-obs-text)' }}>
                  Gmail / Meet 履歴
                </h3>
              </div>
              <div className="p-5">
                <GoogleTimeline scope="deal" id={id} />
              </div>
            </motion.div>
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="flex flex-col gap-6 min-w-0">

            {/* ─── 進捗管理 (右カラムへ移動) ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Flame}
                title="進捗管理"
                iconTint="middle"
                right={
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(171,199,255,0.10)',
                      color: 'var(--color-obs-primary)',
                    }}
                  >
                    パイプライン連動
                  </span>
                }
              />

              <div className="p-4 space-y-3.5">
                {/* Status */}
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 block"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    ステータス
                  </label>
                  <textarea
                    value={progressStatus}
                    onChange={e => setProgressStatus(e.target.value)}
                    placeholder="現在の進行状態を入力..."
                    rows={2}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>

                {/* Next Action */}
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center justify-between"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <span>Next Action</span>
                    <input
                      type="date"
                      value={nextActionDate ?? ''}
                      onChange={e => setNextActionDate(e.target.value || null)}
                      className="h-[22px] px-1.5 text-[10.5px] rounded-[6px] outline-none cursor-pointer normal-case tracking-normal"
                      style={{
                        background: 'var(--color-obs-surface-lowest)',
                        color: 'var(--color-obs-text)',
                        colorScheme: 'dark',
                        boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                      }}
                    />
                  </label>
                  <textarea
                    value={nextAction}
                    onChange={e => setNextAction(e.target.value)}
                    placeholder="次の一手を入力..."
                    rows={2}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>

                {/* Memo (新規) */}
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.06em] mb-1.5 flex items-center gap-1.5"
                    style={{ color: 'var(--color-obs-text-subtle)' }}
                  >
                    <StickyNote size={10} style={{ color: 'var(--color-obs-middle)' }} />
                    メモ
                  </label>
                  <textarea
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="自由記述のメモ..."
                    rows={4}
                    className="w-full px-3 py-2 text-[12.5px] rounded-[var(--radius-obs-md)] outline-none resize-none leading-relaxed"
                    style={{
                      background: 'var(--color-obs-surface-lowest)',
                      color: 'var(--color-obs-text)',
                      boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.12)',
                    }}
                  />
                </div>
              </div>

            </motion.div>

            {/* ─── タスク管理 (右カラムへ移動) ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={CheckCircle2}
                title="タスク"
                iconTint="primary"
                right={
                  <>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(171,199,255,0.12)', color: 'var(--color-obs-primary)' }}
                    >
                      {tasks.length}
                    </span>
                    <button
                      onClick={() => setTaskModal('new')}
                      className="inline-flex items-center gap-1 px-2.5 h-[26px] rounded-[7px] text-[10.5px] font-semibold transition-all hover:brightness-106"
                      style={{
                        background: 'var(--color-obs-primary-container)',
                        color: 'var(--color-obs-on-primary)',
                      }}
                    >
                      <Plus size={10} strokeWidth={2.4} />
                      作成
                    </button>
                  </>
                }
              />

              {tasks.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11.5px]" style={{ color: 'var(--color-obs-text-muted)' }}>
                    タスクが登録されていません
                  </p>
                  <button
                    onClick={() => setTaskModal('new')}
                    className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold transition-colors hover:text-[var(--color-obs-text)]"
                    style={{ color: 'var(--color-obs-primary)' }}
                  >
                    <Plus size={10} strokeWidth={2.5} />
                    最初のタスクを作成
                  </button>
                </div>
              ) : (
                <div>
                  {tasks.map((task, i) => {
                    const cfg = DEAL_TASK_TYPE_STYLES[task.type]
                    const Icon = cfg.Icon
                    const dueDate = task.dueAt ? new Date(task.dueAt) : null
                    const isOverdue = dueDate && !task.done && dueDate < new Date('2026-04-21')
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 px-3.5 py-2.5 transition-colors hover:bg-[rgba(171,199,255,0.04)] group"
                        style={i < tasks.length - 1 ? OBS_ROW_DIVIDER : undefined}
                      >
                        <button
                          onClick={() => handleTaskToggle(task.id)}
                          className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
                          style={{
                            backgroundColor: task.done ? 'var(--color-obs-primary-container)' : 'var(--color-obs-surface-lowest)',
                            boxShadow: task.done
                              ? 'none'
                              : 'inset 0 0 0 1px rgba(109,106,111,0.25)',
                          }}
                        >
                          {task.done && <CheckCircle2 size={10} style={{ color: 'var(--color-obs-on-primary)' }} strokeWidth={2.5} />}
                        </button>

                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: cfg.bg,
                            opacity: task.done ? 0.5 : 1,
                          }}
                        >
                          <Icon size={12} style={{ color: cfg.iconColor }} strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className="text-[12px] font-medium truncate"
                              style={{
                                color: task.done ? 'var(--color-obs-text-subtle)' : 'var(--color-obs-text)',
                                textDecoration: task.done ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {task.dueAt && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[4px] text-[9.5px] font-bold tabular-nums whitespace-nowrap shrink-0"
                                style={{
                                  background: isOverdue ? 'rgba(255,107,107,0.14)' : 'rgba(171,199,255,0.10)',
                                  color: isOverdue ? 'var(--color-obs-hot)' : 'var(--color-obs-primary)',
                                }}
                              >
                                <Calendar size={8} strokeWidth={2.5} />
                                {formatDateShort(task.dueAt)}
                              </span>
                            )}
                            {task.memo && (
                              <p className="text-[10.5px] truncate" style={{ color: 'var(--color-obs-text-muted)' }}>
                                {task.memo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setTaskModal(task)}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[rgba(171,199,255,0.10)]"
                            title="編集"
                          >
                            <Pencil size={10} style={{ color: 'var(--color-obs-primary)' }} />
                          </button>
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-[5px] transition-colors hover:bg-[rgba(255,107,107,0.12)]"
                            title="削除"
                          >
                            <Trash2 size={10} style={{ color: 'var(--color-obs-hot)' }} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* Stage History */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[var(--radius-obs-xl)] overflow-hidden"
              style={OBS_CARD_STYLE}
            >
              <CardHeader
                icon={Target}
                title="ステージ履歴"
                iconTint="primary"
                right={
                  <button
                    type="button"
                    onClick={() => setIsStagePickerOpen(v => !v)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
                    style={{
                      background: isStagePickerOpen
                        ? 'rgba(171,199,255,0.18)'
                        : 'rgba(171,199,255,0.10)',
                      color: 'var(--color-obs-primary)',
                    }}
                  >
                    {isStagePickerOpen ? (
                      <>
                        <X size={10} />
                        閉じる
                      </>
                    ) : (
                      <>
                        <Pencil size={10} />
                        編集
                      </>
                    )}
                  </button>
                }
              />

              <motion.div
                className="p-3 space-y-0.5"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {stageHistory.map((item, i) => {
                  const cfg = STAGE_CONFIG[item.stage]
                  // 直近の同ステージは「最新」のみ表示濃く、それ以前は控えめに
                  return (
                    <motion.div
                      key={`${item.stage}-${item.date}-${i}`}
                      variants={{
                        hidden: { opacity: 0, x: -8 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-[7px]"
                      style={item.isCurrent ? {
                        background: 'rgba(171,199,255,0.06)',
                        boxShadow: 'inset 2px 0 0 var(--color-obs-primary)',
                      } : {}}
                    >
                      {item.isCurrent
                        ? <CheckCircle2 size={13} style={{ color: 'var(--color-obs-primary)' }} className="shrink-0" />
                        : <div className="w-[13px] h-[13px] rounded-full shrink-0" style={{ boxShadow: 'inset 0 0 0 1px rgba(109,106,111,0.20)' }} />
                      }
                      <span className="text-[12px] flex-1" style={{
                        fontWeight: item.isCurrent ? 600 : 400,
                        color: item.isCurrent ? 'var(--color-obs-primary)' : 'var(--color-obs-text-muted)',
                      }}>
                        {cfg.label}
                      </span>
                      <div className="text-right">
                        <p className="text-[11px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          {item.daysAgo === 0 ? '今日' : `${item.daysAgo}日前`}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Stage Picker（編集モード時のみ表示） */}
              <AnimatePresence>
                {isStagePickerOpen && (
                  <motion.div
                    key="stage-picker"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                    style={{ boxShadow: 'inset 0 1px 0 rgba(109,106,111,0.12)' }}
                  >
                    <div className="px-3 py-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <span className="text-[10.5px] font-medium tracking-[0.06em] uppercase" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          ステージを変更
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--color-obs-text-subtle)' }}>
                          全 {ALL_STAGES.length} 段階
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {ALL_STAGES.map((s) => {
                          const cfg = STAGE_CONFIG[s]
                          const active = s === currentStage
                          const tone = CHIP_TONE_STYLE[cfg.tone]
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={active}
                              onClick={() => handleChangeStage(s)}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-[7px] transition-colors text-left"
                              style={{
                                background: active ? 'rgba(171,199,255,0.06)' : 'transparent',
                                boxShadow: active ? 'inset 2px 0 0 var(--color-obs-primary)' : undefined,
                                cursor: active ? 'default' : 'pointer',
                                opacity: active ? 0.85 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(171,199,255,0.04)'
                              }}
                              onMouseLeave={(e) => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                              }}
                            >
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0"
                                style={tone}
                              >
                                {cfg.label}
                              </span>
                              <span
                                className="text-[11px] flex-1"
                                style={{ color: active ? 'var(--color-obs-primary)' : 'var(--color-obs-text-subtle)' }}
                              >
                                {active ? '現在のステージ' : `${cfg.label} に変更`}
                              </span>
                              {active ? (
                                <CheckCircle2 size={12} style={{ color: 'var(--color-obs-primary)' }} />
                              ) : (
                                <ChevronDown size={11} style={{ color: 'var(--color-obs-text-subtle)', transform: 'rotate(-90deg)' }} />
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] px-1 mt-1" style={{ color: 'var(--color-obs-text-subtle)' }}>
                        変更すると履歴に新しいエントリが追加されます。
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </aside>
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {taskModal !== null && (
            <DealTaskModal
              task={taskModal === 'new' ? null : taskModal}
              onClose={() => setTaskModal(null)}
              onSave={handleTaskSave}
            />
          )}
        </AnimatePresence>
      </div>
    </ObsPageShell>
  )
}
