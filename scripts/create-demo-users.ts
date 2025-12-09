/**
 * デモユーザー一括作成スクリプト
 *
 * 使用方法:
 * npx tsx scripts/create-demo-users.ts
 *
 * 機能:
 * - Supabase Auth にユーザーを作成
 * - users テーブルにプロフィールを作成
 * - players テーブルに選手情報を作成
 * - team_members テーブルにチームメンバーとして登録
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local を読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

// サービスロールキーを使ったクライアント（管理者権限）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// デモユーザー定義
const demoUsers = [
  {
    email: 'demo1@example.com',
    password: 'Test1234',
    fullName: 'デモユーザー1（田中保護者）',
    phone: '090-1111-0001',
    player: {
      familyName: '田中',
      givenName: '太郎',
      familyNameKana: 'タナカ',
      givenNameKana: 'タロウ',
      dateOfBirth: '2014-04-15',
      grade: 5,
      uniformNumber: 10,
      position: 'MF',
    },
  },
  {
    email: 'demo2@example.com',
    password: 'Test1234',
    fullName: 'デモユーザー2（佐藤保護者）',
    phone: '090-1111-0002',
    player: {
      familyName: '佐藤',
      givenName: '健太',
      familyNameKana: 'サトウ',
      givenNameKana: 'ケンタ',
      dateOfBirth: '2014-07-22',
      grade: 5,
      uniformNumber: 7,
      position: 'FW',
    },
  },
  {
    email: 'demo3@example.com',
    password: 'Test1234',
    fullName: 'デモユーザー3（鈴木保護者）',
    phone: '090-1111-0003',
    player: {
      familyName: '鈴木',
      givenName: '翔',
      familyNameKana: 'スズキ',
      givenNameKana: 'ショウ',
      dateOfBirth: '2014-01-08',
      grade: 5,
      uniformNumber: 4,
      position: 'DF',
    },
  },
  {
    email: 'demo4@example.com',
    password: 'Test1234',
    fullName: 'デモユーザー4（高橋保護者）',
    phone: '090-1111-0004',
    player: {
      familyName: '高橋',
      givenName: '陽向',
      familyNameKana: 'タカハシ',
      givenNameKana: 'ヒナタ',
      dateOfBirth: '2014-11-30',
      grade: 5,
      uniformNumber: 1,
      position: 'GK',
    },
  },
  {
    email: 'demo5@example.com',
    password: 'Test1234',
    fullName: 'デモユーザー5（渡辺保護者）',
    phone: '090-1111-0005',
    player: {
      familyName: '渡辺',
      givenName: '蓮',
      familyNameKana: 'ワタナベ',
      givenNameKana: 'レン',
      dateOfBirth: '2014-09-12',
      grade: 5,
      uniformNumber: 9,
      position: 'FW',
    },
  },
];

async function main() {
  console.log('🚀 デモユーザー作成を開始します...\n');

  // 1. 大豆戸FCのIDを取得
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('name', '大豆戸FC')
    .single();

  if (teamError || !team) {
    console.error('❌ 大豆戸FCが見つかりません:', teamError?.message);
    process.exit(1);
  }

  console.log(`✓ チーム: ${team.name} (${team.id})\n`);

  // 2. 各デモユーザーを作成
  for (const user of demoUsers) {
    console.log(`--- ${user.email} ---`);

    try {
      // 2-1. 既存ユーザーを確認
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find((u) => u.email === user.email);

      let userId: string;

      if (existingUser) {
        console.log(`  ⚠️  Auth ユーザーは既に存在: ${existingUser.id}`);
        userId = existingUser.id;
      } else {
        // 2-2. Auth ユーザーを作成
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // メール確認をスキップ
        });

        if (authError) {
          console.error(`  ❌ Auth ユーザー作成失敗: ${authError.message}`);
          continue;
        }

        userId = authData.user.id;
        console.log(`  ✓ Auth ユーザー作成: ${userId}`);
      }

      // 2-3. users テーブルにプロフィールを作成/更新
      const { error: profileError } = await supabase.from('users').upsert(
        {
          id: userId,
          email: user.email,
          user_type: 'admin', // 全機能にアクセス可能
          full_name: user.fullName,
          phone: user.phone,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        console.error(`  ❌ プロフィール作成失敗: ${profileError.message}`);
        continue;
      }
      console.log(`  ✓ プロフィール作成/更新`);

      // 2-4. 既存の選手を確認
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', userId)
        .eq('team_id', team.id)
        .single();

      let playerId: string;

      if (existingPlayer) {
        playerId = existingPlayer.id;
        console.log(`  ⚠️  選手は既に存在: ${playerId}`);
      } else {
        // 2-5. players テーブルに選手を作成
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .insert({
            team_id: team.id,
            user_id: userId,
            family_name: user.player.familyName,
            given_name: user.player.givenName,
            family_name_kana: user.player.familyNameKana,
            given_name_kana: user.player.givenNameKana,
            date_of_birth: user.player.dateOfBirth,
            grade: user.player.grade,
            uniform_number: user.player.uniformNumber,
            position: user.player.position,
            is_active: true,
          })
          .select('id')
          .single();

        if (playerError) {
          console.error(`  ❌ 選手作成失敗: ${playerError.message}`);
          continue;
        }

        playerId = playerData.id;
        console.log(`  ✓ 選手作成: ${user.player.familyName} ${user.player.givenName} (#${user.player.uniformNumber})`);
      }

      // 2-6. team_members に登録（マネージャー権限）
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .eq('team_id', team.id)
        .single();

      if (existingMember) {
        console.log(`  ⚠️  チームメンバーは既に存在`);
      } else {
        const { error: memberError } = await supabase.from('team_members').insert({
          team_id: team.id,
          user_id: userId,
          role: 'manager', // マネージャー権限で全機能アクセス可能
          player_id: playerId,
          is_primary_contact: false,
          is_active: true,
        });

        if (memberError) {
          console.error(`  ❌ チームメンバー登録失敗: ${memberError.message}`);
          continue;
        }
        console.log(`  ✓ チームメンバー登録 (role: manager)`);
      }

      console.log(`  ✅ 完了!\n`);
    } catch (err) {
      console.error(`  ❌ エラー:`, err);
    }
  }

  // 3. 結果を表示
  console.log('\n========================================');
  console.log('📋 作成されたデモアカウント');
  console.log('========================================\n');

  const { data: results } = await supabase
    .from('users')
    .select(
      `
      email,
      full_name,
      user_type
    `
    )
    .like('email', 'demo%@example.com')
    .order('email');

  if (results) {
    console.log('| Email | 氏名 | 権限 |');
    console.log('|-------|------|------|');
    for (const r of results) {
      console.log(`| ${r.email} | ${r.full_name} | ${r.user_type} |`);
    }
  }

  console.log('\n========================================');
  console.log('🔑 ログイン情報（共通パスワード: Test1234）');
  console.log('========================================');
  for (const user of demoUsers) {
    console.log(`  ${user.email}`);
  }

  console.log('\n✅ 全て完了しました！');
}

main().catch(console.error);
