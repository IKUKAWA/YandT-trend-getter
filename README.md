# YouTube & TikTok トレンド分析サイト

YouTubeとTikTokのトレンドデータを自動収集し、AI(Claude)による分析記事を自動生成するサイトです。

## 🚀 機能

- **データ収集**: YouTube Data API v3 & TikTok API からトレンドデータを自動収集
- **AI記事生成**: Claude APIを使用した週間・月間トレンド分析記事の自動生成
- **ダッシュボード**: リアルタイムトレンドデータの可視化
- **自動化**: cron jobs による定期的なデータ収集・記事生成
- **API**: RESTful API エンドポイント

## 🛠 技術スタック

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API
- **External APIs**: YouTube Data API v3, TikTok API
- **Charts**: Recharts
- **UI**: Lucide React Icons

## 📋 セットアップ

### 1. 環境変数設定

```bash
cp .env.example .env.local
```

必要な環境変数:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/trend_analysis"
YOUTUBE_API_KEY="your_youtube_api_key"
TIKTOK_API_KEY="your_tiktok_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
CRON_SECRET="your_cron_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. データベースセットアップ

```bash
# 依存関係インストール
npm install

# Prisma Client 生成
npm run db:generate

# データベースマイグレーション
npm run db:push
```

### 3. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

## 📡 API エンドポイント

### トレンドデータ
- `GET /api/trends/weekly` - 週間トレンド取得
- `GET /api/trends/monthly` - 月間トレンド取得
- `GET /api/analytics/compare` - プラットフォーム比較

### AI記事
- `GET /api/articles` - AI記事一覧
- `GET /api/articles/[id]` - 特定記事取得

### 自動化
- `POST /api/collect` - データ収集実行
- `POST /api/reports/weekly` - 週間レポート生成
- `POST /api/reports/monthly` - 月間レポート生成
- `POST /api/cron/daily` - 日次タスク実行

### システム
- `GET /api/status` - システム状態確認

## 🔄 自動化スケジュール

| タスク | 頻度 | 時間 | エンドポイント |
|--------|------|------|----------------|
| データ収集 | 毎日 | 09:00 JST | `/api/cron/daily` |
| 週間レポート | 毎週月曜 | 10:00 JST | `/api/reports/weekly` |
| 月間レポート | 毎月1日 | 11:00 JST | `/api/reports/monthly` |

## 🗂 プロジェクト構造

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API エンドポイント
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # ホームページ
├── components/         # React コンポーネント
│   ├── ui/            # UI コンポーネント
│   ├── Dashboard.tsx   # メインダッシュボード
│   ├── TrendCard.tsx   # トレンドカード
│   └── TrendChart.tsx  # チャートコンポーネント
├── lib/               # ユーティリティ・設定
│   ├── db.ts          # Prisma クライアント
│   ├── youtube-api.ts # YouTube API クライアント
│   ├── tiktok-api.ts  # TikTok API クライアント
│   ├── data-collector.ts # データ収集クラス
│   ├── ai-article-generator.ts # AI記事生成クラス
│   ├── scheduler.ts   # スケジューラー
│   └── utils.ts       # ヘルパー関数
├── types/             # TypeScript 型定義
└── hooks/             # カスタムフック
```

## 🔐 認証・セキュリティ

- API認証: Bearer Token (CRON_SECRET)
- Rate Limiting: 実装済み
- 環境変数: セキュアな管理
- CORS: 適切な設定

## 📊 データベーススキーマ

### TrendData
- プラットフォーム (YouTube/TikTok)
- 動画情報 (タイトル、ID、統計)
- カテゴリ・ハッシュタグ
- 収集日時・週・月

### AIArticle
- 記事情報 (タイトル、内容、要約)
- 記事タイプ (週間/月間)
- 公開状態
- メタデータ

### TrendAnalysis
- 分析結果
- トップカテゴリ
- 成長トレンド
- AI洞察

## 🚀 デプロイメント

### Vercel (推奨)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t trend-analysis .
docker run -p 3000:3000 trend-analysis
```

### 環境設定
- PostgreSQL データベース
- 外部API キー設定
- Cron job 設定 (Vercel Cron/GitHub Actions)

## 📈 モニタリング

- システム状態: `/api/status`
- データ収集ログ
- AI記事生成メトリクス
- API使用量追跡

## 🔧 開発

### スクリプト
```bash
npm run dev          # 開発サーバー
npm run build        # 本番ビルド
npm run start        # 本番サーバー
npm run lint         # ESLint
npm run type-check   # TypeScript型チェック
npm run db:push      # データベース更新
npm run db:generate  # Prisma Client生成
npm run db:studio    # Prisma Studio
```

### コードスタイル
- TypeScript Strict Mode
- ESLint + Prettier
- Tailwind CSS
- コンポーネント駆動開発

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 🎯 今後の予定

- [ ] ユーザー認証機能
- [ ] 記事のお気に入り機能
- [ ] コメント・評価システム
- [ ] 多言語対応
- [ ] PWA対応
- [ ] パフォーマンス最適化