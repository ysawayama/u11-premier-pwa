/**
 * PWA Push通知管理フック
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isLoading: true,
  });

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    if (typeof window === 'undefined') {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const isSupported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;

    if (!isSupported) {
      console.log('Push notifications not supported');
      setState((prev) => ({
        ...prev,
        isSupported: false,
        isLoading: false,
      }));
      return;
    }

    const permission = Notification.permission;
    console.log('Notification permission:', permission);

    // Service Worker登録状態を確認（タイムアウト付き）
    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      const readyPromise = navigator.serviceWorker.ready;

      const registration = await Promise.race([readyPromise, timeoutPromise]) as ServiceWorkerRegistration;

      if (!registration) {
        throw new Error('Service Worker not ready');
      }

      const subscription = await registration.pushManager.getSubscription();
      console.log('Push subscription:', subscription);

      setState({
        isSupported: true,
        permission,
        subscription,
        isLoading: false,
      });
    } catch (error) {
      console.log('Service Worker not ready or error:', error);
      // Service Workerが未登録でも続行
      setState({
        isSupported: true,
        permission,
        subscription: null,
        isLoading: false,
      });
    }
  };

  /**
   * 通知許可をリクエスト
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      alert('このブラウザは通知機能に対応していません');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission === 'granted') {
        return true;
      } else {
        alert('通知が許可されませんでした');
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      alert('通知許可のリクエストに失敗しました');
      return false;
    }
  };

  /**
   * プッシュ通知にサブスクライブ
   */
  const subscribe = async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    // 許可がない場合は先にリクエスト
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      // Service Workerを登録
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      await navigator.serviceWorker.ready;

      // VAPIDキーを取得（環境変数から）
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.error('VAPID public key is not configured');
        alert('プッシュ通知の設定が完了していません');
        return false;
      }

      // プッシュマネージャーにサブスクライブ
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // サブスクリプションをサーバーに保存
      await saveSubscription(subscription);

      setState((prev) => ({
        ...prev,
        subscription,
        permission: 'granted',
      }));

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      alert('プッシュ通知の登録に失敗しました');
      return false;
    }
  };

  /**
   * プッシュ通知のサブスクリプションを解除
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!state.subscription) {
      return true;
    }

    try {
      await state.subscription.unsubscribe();
      await deleteSubscription(state.subscription);

      setState((prev) => ({
        ...prev,
        subscription: null,
      }));

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      alert('プッシュ通知の解除に失敗しました');
      return false;
    }
  };

  /**
   * テスト通知を送信
   */
  const sendTestNotification = async (): Promise<boolean> => {
    console.log('sendTestNotification called');
    console.log('Current permission:', state.permission);

    if (state.permission !== 'granted') {
      alert('通知が許可されていません');
      return false;
    }

    try {
      console.log('Getting service worker registration...');
      // シンプルなローカル通知を表示
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      console.log('Showing notification...');
      await registration.showNotification('テスト通知', {
        body: 'プッシュ通知が正常に動作しています',
        vibrate: [200, 100, 200],
      });
      console.log('Notification shown successfully');
      alert('テスト通知を送信しました！');
      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('テスト通知の送信に失敗しました: ' + (error as Error).message);
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

/**
 * サブスクリプションをSupabaseに保存
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const subscriptionData = {
    user_id: user.id,
    endpoint: subscription.endpoint,
    keys: JSON.stringify({
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
    }),
  };

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id,endpoint',
    });

  if (error) {
    throw error;
  }
}

/**
 * サブスクリプションをSupabaseから削除
 */
async function deleteSubscription(subscription: PushSubscription): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', subscription.endpoint);

  if (error) {
    throw error;
  }
}

/**
 * Base64エンコードされたVAPIDキーをUint8Arrayに変換
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * ArrayBufferをBase64に変換
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
