#!/usr/bin/env node
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// アイコンのサイズ
const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'icon-180x180.png' },
];

async function resizeIcon(inputPath) {
  // 入力ファイルの確認
  if (!existsSync(inputPath)) {
    console.error(`❌ エラー: 入力ファイルが見つかりません: ${inputPath}`);
    process.exit(1);
  }

  console.log(`📸 入力画像: ${inputPath}`);
  console.log(`🔄 リサイズ開始...\n`);

  const outputDir = join(__dirname, '../public/icons');

  try {
    // 各サイズにリサイズ
    for (const { size, name } of sizes) {
      const outputPath = join(outputDir, name);

      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} を生成しました`);
    }

    // apple-touch-icon.png も作成（180x180のコピー）
    const appleTouchIconPath = join(__dirname, '../public/apple-touch-icon.png');
    await sharp(inputPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath);

    console.log(`✅ apple-touch-icon.png を生成しました`);

    console.log('\n🎉 全てのアイコンの生成が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// コマンドライン引数から入力パスを取得
const inputPath = process.argv[2];

if (!inputPath) {
  console.error('使用方法: node scripts/resize-icon.mjs <入力画像パス>');
  console.error('例: node scripts/resize-icon.mjs ~/Downloads/icon.png');
  process.exit(1);
}

resizeIcon(inputPath);
