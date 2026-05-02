-- ============================================================================
-- Slack 連携テーブル追加（差分マイグレーション）
--
-- 冪等版: 何度実行しても安全。新規テーブル 2 つだけを追加します。
-- ============================================================================

-- SlackWorkspace
CREATE TABLE IF NOT EXISTS "SlackWorkspace" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "installerUserId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "enterpriseId" TEXT,
    "botToken" TEXT NOT NULL,
    "botUserId" TEXT,
    "userToken" TEXT,
    "scope" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlackWorkspace_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SlackWorkspace_orgId_teamId_key" ON "SlackWorkspace"("orgId", "teamId");
CREATE INDEX IF NOT EXISTS "SlackWorkspace_installerUserId_idx" ON "SlackWorkspace"("installerUserId");

-- SlackMessage
CREATE TABLE IF NOT EXISTS "SlackMessage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT,
    "ts" TEXT NOT NULL,
    "threadTs" TEXT,
    "senderUserId" TEXT,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "text" TEXT NOT NULL,
    "permalink" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "companyId" TEXT,
    "dealId" TEXT,
    "matchedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SlackMessage_workspaceId_channelId_ts_key" ON "SlackMessage"("workspaceId", "channelId", "ts");
CREATE INDEX IF NOT EXISTS "SlackMessage_orgId_contactId_idx" ON "SlackMessage"("orgId", "contactId");
CREATE INDEX IF NOT EXISTS "SlackMessage_orgId_dealId_idx" ON "SlackMessage"("orgId", "dealId");
CREATE INDEX IF NOT EXISTS "SlackMessage_orgId_postedAt_idx" ON "SlackMessage"("orgId", "postedAt" DESC);
