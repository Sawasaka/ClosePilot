// 問い合わせチャットの仮ナレッジ。実装時は RAG エンドポイントへ差し替える前提。
export type KnowledgeAnswer = {
  text: string
  // 出典を表示する場合に使う(任意)
  sources?: { title: string; href?: string }[]
}

type Rule = {
  match: (q: string) => boolean
  answer: KnowledgeAnswer
}

const has = (q: string, ...kw: string[]) => kw.some((k) => q.includes(k))

const RULES: Rule[] = [
  {
    match: (q) => has(q, '企業', '会社', 'インポート', '取込'),
    answer: {
      text:
        '企業データは [企業] ページの右上「+ 追加」から個別登録、または CSV インポートで一括登録できます。インポート時は「会社名」「ドメイン」「業界」などの列ヘッダーを自動マッピングします。',
      sources: [
        { title: '企業データの追加・インポート手順', href: '/knowledge?q=企業%20インポート' },
      ],
    },
  },
  {
    match: (q) => has(q, 'インテント', 'シグナル', '採用', 'PR TIMES'),
    answer: {
      text:
        'インテントスコアは 4 部門(IT・Sales・HR・Marketing)ごとに、求人ポスト数・PR TIMES の発表頻度・gBizINFO の事業者活動などを合算して算出しています。HOT/WARM/COLD の閾値は [開発優先度] から調整可能です。',
      sources: [
        { title: 'インテントスコアの仕組み', href: '/knowledge?q=インテント' },
      ],
    },
  },
  {
    match: (q) => has(q, '議事録', 'Meet', 'Zoom', '要約', '商談'),
    answer: {
      text:
        'Google Meet/Zoom の録画URLを取引(Deal)に貼り付けると自動で文字起こしと要約が走ります。要約完了後、Deal は「ヒアリング済」に自動遷移し、課題はアクションボードへキューイングされます。',
      sources: [
        { title: '議事録の自動取込フロー', href: '/knowledge?q=議事録' },
      ],
    },
  },
  {
    match: (q) => has(q, 'メール', '配信', 'シーケンス', 'DM'),
    answer: {
      text:
        '[メール配信] からシーケンス(複数ステップの自動配信)を作成できます。各ステップで件名/本文/送信タイミング/分岐条件を設定可能です。紙DMはラクスル連携で発送まで自動化されます。',
      sources: [
        { title: 'メール配信シーケンスの作り方', href: '/knowledge?q=シーケンス' },
      ],
    },
  },
  {
    match: (q) => has(q, '通知', 'ベル', 'お知らせ'),
    answer: {
      text:
        '右上のベルアイコンから運営からのお知らせ(新機能・メンテナンス・Tips)を確認できます。未読がある場合は赤いインジケーターが表示されます。',
    },
  },
  {
    match: (q) => has(q, 'パスワード', 'ログイン', 'アカウント'),
    answer: {
      text:
        'ログインに関するお困りごとは、左下のアカウントメニューから「設定 → セキュリティ」でパスワード変更が可能です。解決しない場合は「担当者に相談する」を押してください。',
    },
  },
]

const FALLBACK: KnowledgeAnswer = {
  text:
    'ご質問の内容に対するナレッジが見つかりませんでした。もう少し具体的なキーワード(例:「インテントスコアの計算方法」「議事録の文字起こし精度」など)でお試しいただくか、「担当者に相談する」から開発チームへ直接お繋ぎください。',
}

// シンプルな同期マッチング。実運用では fetch('/api/support/ask') に置換する想定。
export function answerForQuestion(question: string): KnowledgeAnswer {
  const q = question.trim()
  if (!q) return FALLBACK
  for (const rule of RULES) {
    if (rule.match(q)) return rule.answer
  }
  return FALLBACK
}
