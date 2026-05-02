# Claude Code Routines セットアップガイド

日次自動化を Claude Code Routines（クラウド実行）で回すための設定手順。

## 前提
- Claude Max プラン（1日20 Routines 実行可能）
- Routines は Anthropic クラウド側で実行されるため、**ローカルPCが閉じていても稼働**する
- GitHub リポジトリ（bgm）と紐付けておく

## Routine 構成

3本の Routine を 05:00 / 06:00 / 07:00（JST）で走らせる。

### Routine 1: 新規企業エンリッチメント
- **起動時刻**: 毎日 05:00 JST
- **目的**: `enrichment_status=PENDING` の企業を Claude Haiku 4.5 で補完
- **プロンプト**:
  ```
  bgm リポジトリで以下を実行してください:

  1. リポジトリをチェックアウト
  2. `pnpm install` 実行
  3. `pnpm enrich:companies --limit=100` を実行
  4. エラーがあればSlackに投稿（IDが xxx のhookにPOST）
  5. 完了後、どの企業がどう変わったかを要約して報告

  実行時の環境変数は GitHub Actions secrets を参照:
  - DATABASE_URL
  - ANTHROPIC_API_KEY
  - SERPER_API_KEY
  - JINA_API_KEY

  1日100社処理すれば月3,000社ペースで拡大可能。
  ```

### Routine 2: 組織図・担当者抽出
- **起動時刻**: 毎日 06:00 JST
- **目的**: エンリッチ完了企業から、部門構造と担当者名を抽出
- **プロンプト**:
  ```
  bgm リポジトリで `pnpm enrich:orgchart --limit=30` を実行してください。

  完了後、新規に取得された部門の数、公開担当者が見つかった企業の数を報告。
  失敗企業があれば企業名と原因をリストアップ。
  ```

### Routine 3: 日次サマリレポート
- **起動時刻**: 毎日 07:00 JST
- **目的**: 前日のクロール・エンリッチ結果をSlackに投稿
- **プロンプト**:
  ```
  bgm のDBに接続して、以下の日次サマリを生成してSlack #daily-intent に投稿:

  - 今日のクロールで検出された「HOT」インテント企業数
  - 24時間以内に掲載された求人数（部門別）
  - エンリッチ完了した企業数
  - 新規に部門情報が追加された企業TOP5
  - 翌日優先すべき企業10社（leadScoreとHOTインテントで並び替え）

  SQLの雛形:
    SELECT cm.name, ci.intent_level, ci.signal_count
    FROM CompanyIntent ci
    JOIN CompanyMaster cm ON cm.id = ci.companyMasterId
    WHERE ci.latestSignalAt > NOW() - INTERVAL '1 day'
    ORDER BY ci.intent_level, ci.latestSignalAt DESC
    LIMIT 50;
  ```

## Routine 作成手順

1. Claude Code を開く
2. `/schedule` 実行 → 「Create routine」
3. 名前: `daily-enrich-companies`（例）
4. スケジュール: `0 5 * * *` (JST) → UTC は `0 20 * * *`
5. 上記プロンプトを貼り付け
6. 「GitHub access」を有効化（bgm リポジトリへの書き込み不要、読み取りのみ）
7. 「Secrets」で `DATABASE_URL` `ANTHROPIC_API_KEY` 等を登録

## コスト見積（日次）

| Routine | Claude Haiku呼び出し数 | 推定コスト |
|---|---|---|
| Routine 1（エンリッチ 100社） | 100 | ~$2 |
| Routine 2（組織図 30社） | 30 | ~$1.5 |
| Routine 3（サマリ） | 3-5 | ~$0.05 |
| **合計（日次）** | | **~$3.5** |
| **月額** | | **~$105** |

※ Routineの実行費用は Claude Max に含まれる（20回/日の枠内）

## GitHub Actions との役割分担

| 処理 | 実行基盤 | 理由 |
|---|---|---|
| 求人サイトクロール（Playwright） | **GitHub Actions** | Headless Chrome が必要、Routines では重い |
| LLMベースのエンリッチ | **Claude Code Routines** | LLM中心、シンプル |
| DBサマリ生成 | **Claude Code Routines** | SQL生成＋解釈に適する |

## トラブルシューティング

**Q. Routine 実行回数の上限に達した**  
→ Max は 1日 20回。20回を超えるタスクは GitHub Actions + cron で肩代わりさせる。

**Q. Claude Haiku 4.5 が `claude-haiku-4-5-20251001` で見つからない**  
→ API の最新モデルIDを確認。 `https://docs.anthropic.com/en/docs/about-claude/models`

**Q. Serper/Jina のレート制限に当たる**  
→ `enrich-companies.ts` の `setTimeout(500)` を 1000〜2000ms に調整。
