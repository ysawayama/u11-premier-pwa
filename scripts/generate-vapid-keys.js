/**
 * VAPID鍵生成スクリプト
 *
 * 使い方:
 *   node scripts/generate-vapid-keys.js
 *
 * 生成されたキーを .env.local に追加してください
 */

const webpush = require('web-push');

console.log('\n🔐 VAPID鍵を生成しています...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID鍵の生成が完了しました\n');
console.log('以下の内容を .env.local ファイルにコピーしてください:\n');
console.log('─'.repeat(80));
console.log(`# Web Push通知用のVAPIDキー`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('─'.repeat(80));
console.log('\n');

console.log('📝 注意事項:');
console.log('  • VAPID_PRIVATE_KEYは絶対に公開しないでください');
console.log('  • 本番環境では必ず異なるキーを使用してください');
console.log('  • .env.localファイルは.gitignoreに含まれていることを確認してください\n');

// Supabase Edge Functionのシークレットにも設定が必要
console.log('💡 Supabase Edge Functionを使う場合:');
console.log('  以下のコマンドでSupabase Edge Functionにシークレットを設定してください:\n');
console.log(`  supabase secrets set VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`  supabase secrets set VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('');
