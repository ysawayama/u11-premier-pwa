# PWA アイコン設定ガイド

## 必要なアイコンサイズ

PWAでは以下のサイズのアイコンが必要です：

### 基本セット
- **192x192px** - Android向け標準サイズ
- **512x512px** - Android向け高解像度
- **180x180px** - iOS向け（apple-touch-icon）

### 推奨追加サイズ
- **152x152px** - iPad
- **144x144px** - Windows/Android
- **96x96px** - 小さいサイズ用
- **72x72px** - 古いデバイス用

## ファイル配置

```
public/
  ├── icons/
  │   ├── icon-192x192.png
  │   ├── icon-512x512.png
  │   ├── icon-180x180.png
  │   ├── icon-152x152.png
  │   ├── icon-144x144.png
  │   ├── icon-96x96.png
  │   └── icon-72x72.png
  └── apple-touch-icon.png (180x180)
```

## アイコン作成方法

### 1. デザインツールで作成
- Figma, Sketch, Adobe XD などで512x512pxのアイコンをデザイン
- シンプルで認識しやすいデザインにする
- 余白を十分に取る（セーフゾーン: 中心の80%程度）

### 2. 一括リサイズ
以下のオンラインツールが便利です：
- https://realfavicongenerator.net/ - 全サイズ自動生成
- https://www.pwabuilder.com/ - PWA専用ツール

### 3. または、ImageMagick（コマンドライン）
```bash
# 512x512のマスター画像から各サイズを生成
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 180x180 icon-180x180.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 72x72 icon-72x72.png
```

## 現在の設定

`public/manifest.json` に以下が設定されています：

```json
{
  "name": "U-11プレミアリーグ",
  "short_name": "U11PL",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## 次のステップ

1. 512x512pxのマスターアイコンを作成
2. `public/icons/` フォルダに配置
3. 各サイズにリサイズ
4. `public/apple-touch-icon.png` も配置（iOS用）

## 暫定対応

アイコンがない場合、PWAは以下のフォールバックを使用します：
- ブラウザのデフォルトアイコン
- サイトのファビコン
- 最初の文字（アプリ名の頭文字）

本番環境にデプロイする前に、適切なアイコンを配置することを推奨します。
