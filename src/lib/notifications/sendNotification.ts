/**
 * 通知送信ユーティリティ
 */

import { createClient } from '@/lib/supabase/client';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: any;
  userId?: string;
  userIds?: string[];
  all?: boolean;
}

/**
 * プッシュ通知を送信
 */
export async function sendNotification(
  options: NotificationOptions
): Promise<boolean> {
  try {
    const supabase = createClient();

    // 認証トークンを取得
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error('User not authenticated');
      return false;
    }

    // API呼び出し
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        userId: options.userId,
        userIds: options.userIds,
        all: options.all || false,
        notification: {
          title: options.title,
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          tag: options.tag,
          url: options.url,
          data: options.data,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to send notification:', error);
      return false;
    }

    const result = await response.json();
    console.log('Notification sent:', result);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * ゴール通知を送信
 */
export async function sendGoalNotification(
  playerName: string,
  teamName: string,
  matchId: string,
  minute: number
): Promise<boolean> {
  return sendNotification({
    title: `⚽ ゴール！`,
    body: `${teamName} - ${playerName} (${minute}')`,
    tag: 'goal',
    url: `/matches/${matchId}`,
    all: true,
    data: {
      type: 'goal',
      matchId,
      playerName,
      teamName,
      minute,
    },
  });
}

/**
 * イエローカード通知を送信
 */
export async function sendYellowCardNotification(
  playerName: string,
  teamName: string,
  matchId: string,
  minute: number
): Promise<boolean> {
  return sendNotification({
    title: `🟨 イエローカード`,
    body: `${teamName} - ${playerName} (${minute}')`,
    tag: 'yellow_card',
    url: `/matches/${matchId}`,
    all: true,
    data: {
      type: 'yellow_card',
      matchId,
      playerName,
      teamName,
      minute,
    },
  });
}

/**
 * レッドカード通知を送信
 */
export async function sendRedCardNotification(
  playerName: string,
  teamName: string,
  matchId: string,
  minute: number
): Promise<boolean> {
  return sendNotification({
    title: `🟥 レッドカード`,
    body: `${teamName} - ${playerName} (${minute}')`,
    tag: 'red_card',
    url: `/matches/${matchId}`,
    all: true,
    data: {
      type: 'red_card',
      matchId,
      playerName,
      teamName,
      minute,
    },
  });
}

/**
 * 試合開始通知を送信
 */
export async function sendMatchStartNotification(
  homeTeam: string,
  awayTeam: string,
  matchId: string
): Promise<boolean> {
  return sendNotification({
    title: `🏁 試合開始`,
    body: `${homeTeam} vs ${awayTeam}`,
    tag: 'match_start',
    url: `/matches/${matchId}`,
    all: true,
    data: {
      type: 'match_start',
      matchId,
      homeTeam,
      awayTeam,
    },
  });
}

/**
 * 試合終了通知を送信
 */
export async function sendMatchEndNotification(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
  matchId: string
): Promise<boolean> {
  return sendNotification({
    title: `🏁 試合終了`,
    body: `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
    tag: 'match_end',
    url: `/matches/${matchId}`,
    all: true,
    data: {
      type: 'match_end',
      matchId,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
    },
  });
}
