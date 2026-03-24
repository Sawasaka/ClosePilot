import { WebClient } from '@slack/web-api'

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export async function sendDM(userId: string, text: string, blocks?: unknown[]) {
  return slack.chat.postMessage({
    channel: userId,
    text,
    blocks: blocks as never,
  })
}

export async function sendTaskReminder(
  slackUserId: string,
  task: {
    title: string
    dueAt: Date
    contactName: string
    companyName: string
    appUrl: string
  }
) {
  const dueStr = task.dueAt.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  return sendDM(slackUserId, `タスクのリマインドです: ${task.title}`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📋 タスクリマインド*\n*${task.title}*\n👤 ${task.contactName}（${task.companyName}）\n⏰ ${dueStr}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '詳細を見る' },
          url: task.appUrl,
          style: 'primary',
        },
      ],
    },
  ])
}

export async function sendDealStalledAlert(
  managerSlackId: string,
  deal: {
    name: string
    ownerName: string
    daysSinceActivity: number
    stage: string
    appUrl: string
  }
) {
  return sendDM(
    managerSlackId,
    `停滞案件アラート: ${deal.name}`,
    [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*⚠️ 停滞案件アラート*\n*${deal.name}*\n担当: ${deal.ownerName}\nステージ: ${deal.stage}\n最終活動から *${deal.daysSinceActivity}日* 経過`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '案件を確認' },
            url: deal.appUrl,
            style: 'danger',
          },
        ],
      },
    ]
  )
}

export async function sendApprovalRequest(
  managerSlackId: string,
  request: {
    repName: string
    dealName: string
    discountRate: number
    reason: string
    appUrl: string
    requestId: string
  }
) {
  return sendDM(managerSlackId, `承認リクエスト: ${request.dealName}`, [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🔔 承認リクエスト*\n担当者: ${request.repName}\n案件: ${request.dealName}\n割引率: *${request.discountRate}%*\n理由: ${request.reason}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ 承認' },
          style: 'primary',
          action_id: 'approve_request',
          value: request.requestId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ 却下' },
          style: 'danger',
          action_id: 'reject_request',
          value: request.requestId,
        },
      ],
    },
  ])
}
