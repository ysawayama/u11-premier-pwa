'use client';

import { useEffect, useState } from 'react';

/**
 * PWAインストールプロンプトコンポーネント
 * iOS SafariとAndroid Chromeの両方に対応
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // すでにPWAとしてインストール済みかチェック
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Android Chrome: beforeinstallpromptイベントをキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // LocalStorageで「後で」を選択したかチェック
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowAndroidPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari: ユーザーエージェントで判定
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
      if (!dismissed) {
        // 初回訪問から3秒後にプロンプト表示（UX改善）
        setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Android: インストールボタンクリック
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWAインストール受け入れ');
      setShowAndroidPrompt(false);
    }

    setDeferredPrompt(null);
  };

  // プロンプトを閉じる（後で）
  const handleDismiss = (platform: 'android' | 'ios') => {
    if (platform === 'android') {
      setShowAndroidPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    } else {
      setShowIOSPrompt(false);
      localStorage.setItem('pwa-install-dismissed-ios', 'true');
    }
  };

  // すでにインストール済みなら何も表示しない
  if (isInstalled) return null;

  // Android Chromeのプロンプト
  if (showAndroidPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚽️</span>
            <div>
              <h3 className="font-semibold text-lg">アプリをインストール</h3>
              <p className="text-sm text-blue-200">
                ホーム画面に追加して、アプリのように使えます
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-navy px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition"
            >
              インストール
            </button>
            <button
              onClick={() => handleDismiss('android')}
              className="text-blue-200 hover:text-white px-4 py-2"
            >
              後で
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS Safariのプロンプト
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚽️</span>
              <h3 className="font-semibold text-lg">ホーム画面に追加</h3>
            </div>
            <button
              onClick={() => handleDismiss('ios')}
              className="text-blue-200 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="text-sm space-y-2 pl-11">
            <p className="text-blue-100">
              このアプリをホーム画面に追加すると、アプリのように快適に使えます：
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200">
              <li>
                下部の <span className="inline-block align-middle">📤</span> シェアボタンをタップ
              </li>
              <li>「ホーム画面に追加」を選択</li>
              <li>「追加」をタップ</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
