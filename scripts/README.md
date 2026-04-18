# closepilot scripts

企業マスターの日次運用スクリプト集。

## スクリプト一覧

| スクリプト | 用途 | 実行頻度 | 実行基盤 |
|---|---|---|---|
| `crawl-intents.ts` | 求人サイトクロール → IntentSignal / CompanyIntent 更新 | 日次 03:00 | **GitHub Actions** |
| `enrich-companies.ts` | 企業基本情報エンリッチ（代表番号・メール・事業内容） | 日次 05:00 | **Claude Code Routines** |
| `enrich-orgchart.ts` | 部門構造・担当者名抽出 | 日次 06:00 | **Claude Code Routines** |

### 企業DB統合（一回限り）

| スクリプト | 用途 | 実行 |
|---|---|---|
| `packages/db/scripts/import-from-abm.ts` | abm-tool → closepilot 企業マスター移行 | 一回限り |

## 全体フロー

```
┌─────────────────────────────────────────┐
│ GitHub Actions (03:00 JST)              │
│  daily-crawl-intents.yml                │
│  → Playwright で求人クロール            │
│  → IntentSignal / CompanyIntent に保存 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Claude Code Routine 1 (05:00 JST)       │
│  → enrich-companies.ts                  │
│  → Haiku 4.5 で企業情報補完             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Claude Code Routine 2 (06:00 JST)       │
│  → enrich-orgchart.ts                   │
│  → Haiku 4.5 で組織図・担当者抽出       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Claude Code Routine 3 (07:00 JST)       │
│  → 日次サマリをSlackに投稿              │
└─────────────────────────────────────────┘
```

## セットアップ

### 1. 環境変数（`.env.local`）
```bash
DATABASE_URL="postgresql://..."
ANTHROPIC_API_KEY="sk-ant-..."          # Haiku 4.5 用
SERPER_API_KEY="..."                     # Web検索
JINA_API_KEY=""                          # オプション（無料枠あり）

# 移行時のみ
ABM_SUPABASE_URL="https://xxx.supabase.co"
ABM_SUPABASE_SERVICE_KEY="eyJ..."
```

### 2. 依存インストール
```bash
pnpm install
pnpm exec playwright install chromium
pnpm --filter @closepilot/db db:generate
```

### 3. 初回データ移行（abm-tool → closepilot）
```bash
# ドライラン
pnpm --filter @closepilot/db import:abm:dry

# 少量テスト
cd packages/db && tsx scripts/import-from-abm.ts --limit=100

# 本番
pnpm --filter @closepilot/db import:abm
```

### 4. GitHub Actions secrets 登録
リポジトリ Settings → Secrets → Actions で以下を登録:
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`
- `SERPER_API_KEY`
- `JINA_API_KEY`（任意）

### 5. Claude Code Routines 設定
[`ROUTINES.md`](./ROUTINES.md) 参照。

## ローカル実行

### クロール（軽量テスト）
```bash
pnpm crawl:intents --department=IT --max-pages=2 --limit-keywords=1
```

### エンリッチ
```bash
pnpm enrich:companies --limit=5 --dry-run
pnpm enrich:companies --limit=20
```

### 組織図
```bash
pnpm enrich:orgchart --company-id=<master_id>
```

## コスト見積（月額）

| 項目 | コスト |
|---|---|
| GitHub Actions（日次クロール 約20分/日） | $0（無料枠 2,000分/月以内） |
| Serper API（エンリッチ用 Web検索） | ~$50 |
| Claude Haiku 4.5 API（エンリッチ＋組織図） | ~$100 |
| **合計** | **~$150/月** |

## 将来拡張

- プレスリリースクロール（PR TIMES / @Press）
- 中小企業拡大（`packages/db/scripts/import-houjin.ts` で国税庁CSVインポート）
- ラクスル連携でDM発送自動化
- ステージ連動クロール（`Deal.stage` に応じて更新頻度を動的調整）
