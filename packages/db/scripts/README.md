# DB Scripts

## import-from-abm.ts

abm-tool（Supabase）で構築済みの企業マスター・インテントデータを bgm（Prisma/PostgreSQL）へ移行するスクリプト。

### 前提

1. **bgm側のDBが準備済み**（DATABASE_URL が本番DBに向いている）
2. **Prismaマイグレーション完了**（`pnpm db:push` or `pnpm db:migrate` でスキーマ適用済み）
3. **abm-tool の Supabase credentials** を入手済み

### セットアップ

`bgm/.env.local` に以下を追加:

```bash
# 移行元（abm-tool）
ABM_SUPABASE_URL="https://xxxxxxxxxx.supabase.co"
ABM_SUPABASE_SERVICE_KEY="eyJhbGci..."   # service_role key（anon keyではない）

# 移行先（bgm）
DATABASE_URL="postgresql://..."
```

依存インストール（まだなら）:

```bash
pnpm install
cd packages/db && pnpm install
```

### 実行

#### ① ドライラン（推奨、まず動作確認）
DBへの書き込みは行わず、件数だけ確認:

```bash
pnpm --filter @bgm/db import:abm:dry
```

#### ② 件数制限付き（本番移行前のテスト）
先頭100社だけ移行:

```bash
cd packages/db && tsx scripts/import-from-abm.ts --limit=100
```

#### ③ 本番実行（全データ移行）
```bash
pnpm --filter @bgm/db import:abm
```

### 移行される内容

| abm-tool（Supabase） | bgm（Prisma） | 想定件数 |
|---|---|---|
| industries | Industry | 25 |
| service_tags | ServiceTag | 20+ |
| companies | **CompanyMaster** | ~3,794 |
| company_tags | CompanyServiceTag | 1,900+ |
| offices | Office | ~5,038 |
| departments | Department（ツリー構造、親子関係は2パスで設定） | 企業による |
| intent_signals | IntentSignal | ~13,114 |
| company_intents | CompanyIntent（departmentType単位で集約） | 945社×N部門 |

### 冪等性

- `CompanyMaster` は `corporateNumber` で UNIQUE、**upsert**（再実行可）
- `Industry` / `ServiceTag` は `name` で UNIQUE、**upsert**
- `CompanyServiceTag` / `IntentSignal` は createMany + `skipDuplicates`
- `CompanyIntent` は `(companyMasterId, departmentType)` の複合UNIQUE、**upsert**
- `Office` / `Department` は再実行すると重複作成される → **初回のみ実行すること**

再実行が必要な場合は、Office/Departmentを事前に削除:
```sql
DELETE FROM "Office";
DELETE FROM "Department";
```

### 移行されないもの（意図的に除外）

- `approach_statuses` / `approach_logs` — bgm側で `Deal` / `Activity` / `Task` が同等機能を提供
- `organizations` / `organization_members` — bgm側で `Organization` / `User` として管理
- `office_locations` (JSONB) — `Office` テーブルに正規化済み

### トラブルシューティング

**Q. `corporateNumber` 重複エラーが出る**  
→ abm-tool側で重複データがある。事前にSupabase側でクリーンアップ。

**Q. `departmentType` が null のインテントが混在**  
→ abm-toolの `department_type` が想定外の値。`mapDepartmentType()` を拡張するか、スキップされる。

**Q. タイムアウト**  
→ BATCH_SIZE を小さくするか、`--limit=500` で分割実行。
