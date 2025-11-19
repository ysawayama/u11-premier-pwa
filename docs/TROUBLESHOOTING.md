# トラブルシューティングガイド

このドキュメントは、開発中に遭遇した問題と解決策をまとめたナレッジベースです。

---

## 📋 目次

1. [TypeScriptビルドエラー](#typescript-build-errors)
2. [Supabaseクエリエラー](#supabase-query-errors)
3. [SSR/プリレンダリングエラー](#ssr-prerendering-errors)
4. [PWA/Service Workerエラー](#pwa-service-worker-errors)
5. [プッシュ通知の問題](#push-notification-issues)

---

## <a name="typescript-build-errors"></a>🔴 TypeScriptビルドエラー

### 問題1: `Type 'postponed' is not comparable to type 'MatchStatus'`

**症状**:
```
Type error: Type '"postponed"' is not comparable to type 'MatchStatus'.
```

**原因**:
コードで使用している値が型定義に含まれていない

**解決策**:
```typescript
// src/types/database.ts
export const MatchStatus = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed', // ← 追加
} as const;
```

---

### 問題2: `Property 'referee_name' does not exist on type 'Match'`

**症状**:
```
Type error: Property 'referee_name' does not exist on type 'Match'.
Did you mean 'referee'?
```

**原因**:
プロパティ名の誤り

**解決策**:
```typescript
// ❌ 間違い
{match.referee_name}

// ✅ 正しい
{match.referee}
```

---

### 問題3: `Type 'number | null' is not assignable to type 'number'`

**症状**:
```
Argument of type 'number | null' is not assignable to parameter of type 'number'.
```

**原因**:
nullableな値をnon-nullableな関数に渡している

**解決策**:
```typescript
// ❌ 間違い
getRankBadge(standing.rank)

// ✅ 正しい: 関数の型定義を変更
const getRankBadge = (rank: number | null) => {
  if (!rank) {
    return <span>-</span>;
  }
  // ... 残りの処理
}
```

---

### 問題4: `Could not find a declaration file for module 'web-push'`

**症状**:
```
Type error: Could not find a declaration file for module 'web-push'.
```

**原因**:
型定義パッケージがインストールされていない

**解決策**:
```bash
pnpm add -D @types/web-push
```

---

### 問題5: `Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BufferSource'`

**症状**:
```
Type error: Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'string | BufferSource | null | undefined'.
```

**原因**:
TypeScriptの厳密な型チェック

**解決策**:
```typescript
// 型アサーションを追加
applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
```

---

### 問題6: `'vibrate' does not exist in type 'NotificationOptions'`

**症状**:
```
Object literal may only specify known properties, and 'vibrate' does not exist in type 'NotificationOptions'.
```

**原因**:
TypeScriptの型定義に含まれていないプロパティ

**解決策**:
```typescript
// vibrate プロパティを削除
await registration.showNotification('テスト通知', {
  body: 'プッシュ通知が正常に動作しています',
  // vibrate: [200, 100, 200], // ← 削除
});
```

---

## <a name="supabase-query-errors"></a>🔴 Supabaseクエリエラー

### 問題1: 複数のリレーションシップで曖昧性エラー

**症状**:
```
Could not embed because more than one relationship was found for 'match_events' and 'players'
```

**原因**:
`match_events` テーブルには複数の `players` への外部キーがある：
- `player_id`
- `assisted_by_player_id`
- `substitution_player_out_id`
- `substitution_player_in_id`

そのため、単に `players(...)` と書くとどの外部キーを使うべきか分からない

**解決策**:
カラム名で明示的に指定する
```typescript
// ❌ 間違い
.select('player:players(...)')

// ✅ 正しい
.select('player:players!player_id(...)')
.select('assister:players!assisted_by_player_id(...)')
```

---

### 問題2: 外部キー制約名が見つからないエラー

**症状**:
```
Could not find a relationship between 'match_events' and 'players' in the schema cache
```

**原因**:
外部キー制約名がデータベースに存在しない、または推測できない

**解決策**:
外部キー制約名ではなく、カラム名で指定する
```typescript
// ❌ 間違い: 制約名に依存
.select('player:players!match_events_player_id_fkey(...)')

// ✅ 正しい: カラム名で指定
.select('player:players!player_id(...)')
```

---

### 問題3: カラムが存在しないエラー

**症状**:
```
column "assisted_by_player_id" does not exist
```

**原因**:
マイグレーションでカラムが追加されていない

**解決策**:
マイグレーションを作成して実行
```sql
ALTER TABLE public.match_events
ADD COLUMN IF NOT EXISTS assisted_by_player_id UUID
REFERENCES public.players(id) ON DELETE SET NULL;
```

---

## <a name="ssr-prerendering-errors"></a>🔴 SSR/プリレンダリングエラー

### 問題1: `Cannot read properties of null (reading 'useContext')`

**症状**:
```
Error occurred prerendering page "/admin/matches"
TypeError: Cannot read properties of null (reading 'useContext')
```

**原因**:
- Client componentsでもプリレンダリングが試みられる
- Zustand storeやSupabase clientがSSR環境で実行されるとエラー

**解決策1**: Supabase clientにSSRチェックを追加
```typescript
// src/lib/supabase/client.ts
export const createClient = () => {
  // SSR時には null を返す
  if (typeof window === 'undefined') {
    return null as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

**解決策2**: Dynamic renderingを強制
```typescript
// ページまたはレイアウトで
'use client';

export const dynamic = 'force-dynamic';
```

**注意**:
- Vercelでは自動的に最適化されるため、ローカルのビルドエラーが本番では発生しないことがある
- ローカルでビルドエラーが出ても、まずVercelにデプロイして確認することを推奨

---

## <a name="pwa-service-worker-errors"></a>🔴 PWA/Service Workerエラー

### 問題1: Service Workerのタイムアウト

**症状**:
```
Service Worker not ready or error: Error: Timeout
```

**原因**:
`navigator.serviceWorker.ready` が無限に待機している

**解決策**:
タイムアウトを設定
```typescript
const timeoutPromise = new Promise<null>((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), 3000)
);

const readyPromise = navigator.serviceWorker.ready;
const registration = await Promise.race([readyPromise, timeoutPromise]);
```

---

### 問題2: アイコンが404エラー

**症状**:
```
Failed to load resource: the server responded with a status of 404 ()
icons/icon-192x192.png
```

**原因**:
PNGアイコンファイルが存在しない

**解決策**:
アイコンを生成する
```bash
# マスター画像からリサイズ
node scripts/resize-icon.mjs path/to/master-icon.png
```

---

## <a name="push-notification-issues"></a>🔴 プッシュ通知の問題

### 問題1: 通知が表示されない（macOSローカル環境）

**症状**:
- コンソールには「Notification shown successfully」と表示される
- しかし実際には通知が表示されない

**原因**:
macOSのシステム通知設定でブラウザの通知がブロックされている可能性

**解決策**:
1. **システム設定** → **通知** → **Chrome/Safari**
2. 通知を「許可」に設定
3. 通知スタイルを「バナー」または「通知」に設定
4. 「おやすみモード」を無効化

**注意**:
- 本番環境（HTTPS）では正常に動作する可能性が高い
- ローカルで動作しなくても、まず本番環境でテストすることを推奨

---

### 問題2: 通知許可がリセットされる

**症状**:
通知許可を与えても、次回アクセス時にリセットされる

**原因**:
- localhostでは通知許可が保持されないことがある
- Service Workerが再登録される

**解決策**:
- 本番環境（HTTPS）を使用する
- または、開発時は通知許可を毎回与える

---

### 問題3: VAPID鍵が無効

**症状**:
```
Error: Invalid VAPID keys
```

**原因**:
VAPID鍵が正しく設定されていない、または有効期限切れ

**解決策**:
新しいVAPID鍵を生成
```bash
node scripts/generate-vapid-keys.js
```

生成された鍵を `.env.local` と Vercelの環境変数に設定

---

## 🛠️ デバッグのヒント

### TypeScriptエラーのデバッグ

1. **型定義を確認**: `src/types/database.ts` を確認
2. **エラーメッセージを読む**: 「Did you mean...?」の提案を確認
3. **明示的な型指定**: `as` でキャストするより、正しい型を使う

### Supabaseエラーのデバッグ

1. **RLSポリシーを確認**: Supabase Dashboardで確認
2. **SQLを直接実行**: SQL Editorで同じクエリを実行
3. **ログを確認**: `console.log(error)` でエラー詳細を確認

### Service Workerのデバッグ

1. **開発者ツール** → **Application** → **Service Workers**
2. 「Update on reload」をチェック
3. 「Unregister」で再登録

### 通知のデバッグ

1. **ブラウザのコンソール**を確認
2. **システム通知設定**を確認
3. **本番環境（HTTPS）**でテスト

---

## 📚 参考資料

### 公式ドキュメント

- [Next.js - SSR Troubleshooting](https://nextjs.org/docs/messages/react-hydration-error)
- [Supabase - PostgREST API](https://postgrest.org/en/stable/api.html)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### よくあるエラーコード

- **400 Bad Request**: クエリ構文エラー、パラメータ不正
- **401 Unauthorized**: 認証エラー
- **403 Forbidden**: 権限エラー（RLSポリシー）
- **404 Not Found**: リソースが存在しない
- **406 Not Acceptable**: テーブル/カラムが存在しない

---

## 🆘 それでも解決しない場合

1. **エラーメッセージ全体をコピー**して検索
2. **GitHub Issues**を確認（Next.js、Supabase、関連ライブラリ）
3. **スタックトレース**を確認して原因を特定
4. **最小再現コード**を作成してテスト

---

**このドキュメントは継続的に更新されます。新しい問題と解決策を追加してください。**
