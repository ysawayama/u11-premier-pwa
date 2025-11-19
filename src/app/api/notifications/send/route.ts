/**
 * プッシュ通知送信API
 * POST /api/notifications/send
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// VAPID設定
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys are not configured');
}

webpush.setVapidDetails(
  'mailto:admin@u11premier.jp', // 管理者のメールアドレス
  vapidPublicKey,
  vapidPrivateKey
);

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: any;
}

interface SendNotificationRequest {
  userId?: string; // 特定ユーザーに送信
  userIds?: string[]; // 複数ユーザーに送信
  all?: boolean; // 全ユーザーに送信
  notification: NotificationPayload;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック（ここでは簡易的にヘッダーからトークンを確認）
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Supabaseクライアント作成（サービスロールキーを使用）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // トークン検証
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // コーチまたは管理者のみが通知を送信可能
    const { data: userData } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!userData || !['coach', 'admin'].includes(userData.user_type)) {
      return NextResponse.json(
        { error: 'Forbidden: Only coaches and admins can send notifications' },
        { status: 403 }
      );
    }

    // リクエストボディを解析
    const body: SendNotificationRequest = await request.json();
    const { userId, userIds, all, notification } = body;

    if (!notification || !notification.title || !notification.body) {
      return NextResponse.json(
        { error: 'Invalid request: title and body are required' },
        { status: 400 }
      );
    }

    // サブスクリプションを取得
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*');

    if (userId) {
      subscriptionsQuery = subscriptionsQuery.eq('user_id', userId);
    } else if (userIds && userIds.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in('user_id', userIds);
    } else if (!all) {
      return NextResponse.json(
        { error: 'Invalid request: specify userId, userIds, or all=true' },
        { status: 400 }
      );
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No subscriptions found', sent: 0 },
        { status: 200 }
      );
    }

    // 通知ペイロードを構築
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/icon-192x192.png',
      tag: notification.tag || 'default',
      data: {
        url: notification.url || '/dashboard',
        ...notification.data,
      },
    });

    // 全サブスクリプションに通知を送信
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: JSON.parse(subscription.keys as string),
          };

          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, userId: subscription.user_id };
        } catch (error: any) {
          // サブスクリプションが無効な場合は削除
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id);
          }
          console.error('Failed to send notification:', error);
          return { success: false, userId: subscription.user_id, error };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      message: 'Notifications sent',
      sent: successCount,
      total: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
