'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { createClient } from '@/lib/supabase/client';

interface NotificationPreferences {
  goals_enabled: boolean;
  cards_enabled: boolean;
  match_start_enabled: boolean;
  match_end_enabled: boolean;
  team_updates_enabled: boolean;
}

/**
 * 設定ページ - 通知設定
 */
export default function SettingsPage() {
  const notifications = useNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    goals_enabled: true,
    cards_enabled: true,
    match_start_enabled: true,
    match_end_enabled: true,
    team_updates_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user found');
        return;
      }

      console.log('Loading preferences for user:', user.id);

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        // テーブルが存在しない場合やRLSエラーの場合でもデフォルト値を使用
        if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('406')) {
          console.log('Table does not exist or no data found, using defaults');
          return;
        }
        throw error;
      }

      if (data) {
        console.log('Loaded preferences:', data);
        setPreferences({
          goals_enabled: data.goals_enabled,
          cards_enabled: data.cards_enabled,
          match_start_enabled: data.match_start_enabled,
          match_end_enabled: data.match_end_enabled,
          team_updates_enabled: data.team_updates_enabled,
        });
      } else {
        console.log('No preferences found, using defaults');
      }
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
      // エラーが発生してもデフォルト値で続行
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase.from('notification_preferences').upsert(
        {
          user_id: user.id,
          ...preferences,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) throw error;

      alert('設定を保存しました');
    } catch (err: any) {
      alert('設定の保存に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading || notifications.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← ダッシュボード
          </Link>
          <h1 className="text-2xl font-bold text-blue-900">通知設定</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 通知許可状態 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            プッシュ通知
          </h2>

          {!notifications.isSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                このブラウザはプッシュ通知に対応していません
              </p>
            </div>
          )}

          {notifications.isSupported && (
            <div className="space-y-4">
              {/* 許可状態 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">通知の状態</p>
                  <p className="text-sm text-gray-600">
                    {notifications.permission === 'granted'
                      ? '許可されています'
                      : notifications.permission === 'denied'
                      ? 'ブロックされています'
                      : '未設定'}
                  </p>
                </div>
                <div>
                  {notifications.permission === 'granted' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ 有効
                    </span>
                  ) : notifications.permission === 'denied' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      ✗ 無効
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      未設定
                    </span>
                  )}
                </div>
              </div>

              {/* サブスクリプション状態 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">
                    プッシュ通知の登録
                  </p>
                  <p className="text-sm text-gray-600">
                    {notifications.subscription
                      ? '登録済み'
                      : '未登録'}
                  </p>
                </div>
                <div>
                  {notifications.subscription ? (
                    <button
                      onClick={notifications.unsubscribe}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm"
                    >
                      登録解除
                    </button>
                  ) : (
                    <button
                      onClick={notifications.subscribe}
                      disabled={notifications.permission === 'denied'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm disabled:bg-gray-400"
                    >
                      登録する
                    </button>
                  )}
                </div>
              </div>

              {/* テスト通知 */}
              {notifications.permission === 'granted' && (
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">テスト通知</p>
                    <p className="text-sm text-gray-600">
                      通知が正しく動作するか確認
                    </p>
                  </div>
                  <button
                    onClick={notifications.sendTestNotification}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
                  >
                    送信
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 通知の詳細設定 */}
        {notifications.subscription && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              通知の種類
            </h2>

            <div className="space-y-4">
              {/* ゴール通知 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">⚽ ゴール</p>
                  <p className="text-sm text-gray-600">
                    試合でゴールが入った時
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('goals_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.goals_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.goals_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* カード通知 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">🟨🟥 カード</p>
                  <p className="text-sm text-gray-600">
                    イエローカード・レッドカード
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('cards_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.cards_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.cards_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 試合開始通知 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">🏁 試合開始</p>
                  <p className="text-sm text-gray-600">試合が開始された時</p>
                </div>
                <button
                  onClick={() => handleToggle('match_start_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.match_start_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.match_start_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 試合終了通知 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">🏁 試合終了</p>
                  <p className="text-sm text-gray-600">試合が終了した時</p>
                </div>
                <button
                  onClick={() => handleToggle('match_end_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.match_end_enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.match_end_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* チーム更新通知 */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">📢 チーム更新</p>
                  <p className="text-sm text-gray-600">
                    チーム情報の更新・お知らせ
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('team_updates_enabled')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.team_updates_enabled
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.team_updates_enabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={savePreferences}
              disabled={saving}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        )}

        {/* ヒント */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 通知について
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• プッシュ通知を受け取るには、まず通知を許可してください</li>
            <li>• 通知をブロックした場合は、ブラウザの設定から変更できます</li>
            <li>
              • テスト通知で正しく動作するか確認することをお勧めします
            </li>
            <li>
              • 不要な通知は個別にオフにできます
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
