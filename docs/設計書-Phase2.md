\# YouTube \& TikTok トレンド分析サイト - Phase 2 機能拡張設計書



\## 📋 プロジェクト概要



\### 現在の状況

\- \*\*Phase 1 (MVP)\*\*: 完了済み

\- \*\*技術スタック\*\*: Next.js 15, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Claude API

\- \*\*完成済みAPI\*\*: 10個（データ収集、レポート生成、トレンド取得、システム監視等）

\- \*\*開発環境\*\*: Windows 11



\### Phase 2 の目標

既存MVPの機能拡張とモダンデザインへの刷新を実施し、エンタープライズレベルのトレンド分析プラットフォームを構築する。



---



\## 🎨 デザイン刷新（最優先）



\### デザインコンセプト

\*\*「ネオモーフィズム × グラスモーフィズム」\*\*



\### 視覚的特徴

\- \*\*ネオモーフィズム\*\*: 柔らかい影と光沢による立体的な質感

\- \*\*グラスモーフィズム\*\*: 半透明背景 + ぼかし効果による奥行き表現

\- \*\*動的要素\*\*: グラデーション、浮遊アクセント、スムーズアニメーション

\- \*\*ダークモード\*\*: 完全対応、自動切り替え



\### 更新対象ファイル

```

src/

├── components/

│   ├── TrendCard.tsx        # モダンカードデザイン

│   ├── Dashboard.tsx        # 新ダッシュボードUI

│   └── TrendChart.tsx       # 高度なデータ可視化

├── app/

│   └── page.tsx            # ヒーローセクション追加

└── tailwind.config.js      # カスタムスタイル設定

```



\### 追加パッケージ

```bash

npm install @tailwindcss/line-clamp

```



---



\## 🚀 機能拡張計画



\### 1. 詳細分析機能



\#### 1.1 トレンド予測機能

\- \*\*目的\*\*: 過去データからAIによる将来予測

\- \*\*実装範囲\*\*:

&nbsp; - 週間・月間成長率分析

&nbsp; - シーズナルトレンド検出

&nbsp; - 予測精度指標

\- \*\*新規API\*\*:

&nbsp; - `GET /api/predictions/weekly`

&nbsp; - `GET /api/predictions/monthly`

&nbsp; - `GET /api/predictions/seasonal`



\#### 1.2 詳細カテゴリ分析

\- \*\*目的\*\*: ジャンル別の深掘り分析

\- \*\*実装範囲\*\*:

&nbsp; - 新興カテゴリの自動検出

&nbsp; - カテゴリ間関連性分析

&nbsp; - 詳細サブカテゴリ分類

\- \*\*新規API\*\*:

&nbsp; - `GET /api/categories/emerging`

&nbsp; - `GET /api/categories/relations`

&nbsp; - `GET /api/categories/detailed`



\#### 1.3 エンゲージメント深掘り分析

\- \*\*目的\*\*: 詳細なユーザー反応分析

\- \*\*実装範囲\*\*:

&nbsp; - いいね率、コメント率、シェア率分析

&nbsp; - プラットフォーム別エンゲージメント特性

&nbsp; - バイラル要因の自動抽出

\- \*\*新規API\*\*:

&nbsp; - `GET /api/engagement/detailed`

&nbsp; - `GET /api/engagement/platform-comparison`

&nbsp; - `GET /api/engagement/viral-factors`



\### 2. UI/UX改善



\#### 2.1 インタラクティブフィルター機能

\- \*\*目的\*\*: 柔軟なデータ表示制御

\- \*\*実装範囲\*\*:

&nbsp; - カスタム日付範囲選択

&nbsp; - 多層カテゴリフィルター

&nbsp; - プラットフォーム別表示切り替え

&nbsp; - 人気度・エンゲージメント率ソート

\- \*\*新規コンポーネント\*\*:

&nbsp; - `FilterPanel.tsx`

&nbsp; - `DateRangePicker.tsx`

&nbsp; - `CategoryFilter.tsx`



\#### 2.2 高度なデータ可視化

\- \*\*目的\*\*: より直感的なデータ理解

\- \*\*実装範囲\*\*:

&nbsp; - 時系列変化グラフ

&nbsp; - ヒートマップ表示

&nbsp; - 地域別（日本国内）トレンド

&nbsp; - アニメーション付き動的グラフ

\- \*\*新規コンポーネント\*\*:

&nbsp; - `TimeSeriesChart.tsx`

&nbsp; - `HeatmapChart.tsx`

&nbsp; - `RegionalChart.tsx`

&nbsp; - `AnimatedChart.tsx`



\#### 2.3 レスポンシブデザイン最適化

\- \*\*目的\*\*: 全デバイス対応

\- \*\*実装範囲\*\*:

&nbsp; - モバイルファーストリデザイン

&nbsp; - タブレット最適化

&nbsp; - タッチジェスチャー対応

&nbsp; - PWA対応準備



\### 3. 管理者ダッシュボード



\#### 3.1 システム監視画面

\- \*\*目的\*\*: リアルタイム運用監視

\- \*\*実装範囲\*\*:

&nbsp; - データ収集状況の可視化

&nbsp; - API使用量リアルタイム表示

&nbsp; - エラーログ管理画面

&nbsp; - パフォーマンス指標ダッシュボード

\- \*\*新規ページ\*\*:

&nbsp; - `/admin/monitoring`

&nbsp; - `/admin/logs`

&nbsp; - `/admin/performance`



\#### 3.2 コンテンツ管理

\- \*\*目的\*\*: AI記事の品質管理

\- \*\*実装範囲\*\*:

&nbsp; - AI記事編集・公開管理

&nbsp; - 記事スケジューリング

&nbsp; - SEOメタデータ管理

&nbsp; - 記事品質スコア表示

\- \*\*新規ページ\*\*:

&nbsp; - `/admin/articles`

&nbsp; - `/admin/scheduler`

&nbsp; - `/admin/seo`



\#### 3.3 ユーザー分析

\- \*\*目的\*\*: サイト利用状況把握

\- \*\*実装範囲\*\*:

&nbsp; - アクセス解析ダッシュボード

&nbsp; - 人気記事ランキング

&nbsp; - ユーザー行動フロー

&nbsp; - 滞在時間・離脱率分析

\- \*\*新規API\*\*:

&nbsp; - `GET /api/analytics/access`

&nbsp; - `GET /api/analytics/popular`

&nbsp; - `GET /api/analytics/behavior`



---



\## 🌟 新機能提案



\### 4. アラート機能



\#### 4.1 トレンド通知システム

\- \*\*目的\*\*: 重要トレンドの即座通知

\- \*\*実装範囲\*\*:

&nbsp; - 急上昇トレンド検出

&nbsp; - 特定キーワード監視

&nbsp; - しきい値ベースアラート

\- \*\*通知方法\*\*:

&nbsp; - メール通知

&nbsp; - ブラウザプッシュ通知

&nbsp; - Slack連携（オプション）



\#### 4.2 レポート配信

\- \*\*目的\*\*: 定期レポートの自動配信

\- \*\*実装範囲\*\*:

&nbsp; - 週間サマリーメール

&nbsp; - 月間詳細レポート配信

&nbsp; - カスタム配信設定

\- \*\*新規API\*\*:

&nbsp; - `POST /api/notifications/setup`

&nbsp; - `GET /api/notifications/history`



\### 5. 比較分析強化



\#### 5.1 時系列比較機能

\- \*\*目的\*\*: 複数期間の詳細比較

\- \*\*実装範囲\*\*:

&nbsp; - 任意期間の比較分析

&nbsp; - 前年同期比較

&nbsp; - 競合他社データ比較（外部API連携）

\- \*\*新規コンポーネント\*\*:

&nbsp; - `ComparisonTimeline.tsx`

&nbsp; - `YearOverYearChart.tsx`



\#### 5.2 海外トレンド比較

\- \*\*目的\*\*: グローバルトレンドとの比較

\- \*\*実装範囲\*\*:

&nbsp; - 主要国（米国、韓国等）データ取得

&nbsp; - 国際比較チャート

&nbsp; - 文化的差異分析

\- \*\*新規API\*\*:

&nbsp; - `GET /api/global/trends`

&nbsp; - `GET /api/global/comparison`



\### 6. エクスポート・共有機能



\#### 6.1 データエクスポート

\- \*\*実装範囲\*\*:

&nbsp; - CSV形式データダウンロード

&nbsp; - PDF形式レポート生成

&nbsp; - Excel形式詳細データ

\- \*\*新規API\*\*:

&nbsp; - `GET /api/export/csv`

&nbsp; - `GET /api/export/pdf`

&nbsp; - `GET /api/export/excel`



\#### 6.2 外部連携

\- \*\*実装範囲\*\*:

&nbsp; - REST API公開（認証付き）

&nbsp; - Webhook配信機能

&nbsp; - サードパーティ連携SDK

\- \*\*新規API\*\*:

&nbsp; - `GET /api/public/trends` (認証必須)

&nbsp; - `POST /api/webhooks/register`



\### 7. ユーザーカスタマイズ



\#### 7.1 個人設定

\- \*\*実装範囲\*\*:

&nbsp; - 興味カテゴリ登録

&nbsp; - 個人向けダッシュボード

&nbsp; - 表示設定カスタマイズ

\- \*\*新規ページ\*\*:

&nbsp; - `/settings/preferences`

&nbsp; - `/settings/dashboard`



\#### 7.2 ブックマーク・お気に入り

\- \*\*実装範囲\*\*:

&nbsp; - トレンド記事ブックマーク

&nbsp; - カスタムウォッチリスト

&nbsp; - フォローカテゴリ機能

\- \*\*新規API\*\*:

&nbsp; - `POST /api/bookmarks`

&nbsp; - `GET /api/watchlist`



---



\## 📅 開発スケジュール（3週間）



\### 第1週: デザイン刷新 + 詳細分析機能

\*\*優先度: 最高\*\*



\#### Day 1-2: デザインシステム構築

\- ネオモーフィズム × グラスモーフィズムの実装

\- TrendCard.tsx の刷新

\- 基本コンポーネントライブラリ更新



\#### Day 3-4: ダッシュボード刷新

\- Dashboard.tsx の完全リニューアル

\- 新しいチャートコンポーネント実装

\- レスポンシブ対応強化



\#### Day 5-7: 詳細分析機能

\- トレンド予測API実装

\- 詳細カテゴリ分析機能

\- エンゲージメント深掘り分析



\### 第2週: UI/UX改善 + 管理者機能

\*\*優先度: 高\*\*



\#### Day 8-10: インタラクティブフィルター

\- FilterPanel コンポーネント開発

\- 日付範囲選択機能

\- 多層フィルター実装



\#### Day 11-12: 高度データ可視化

\- ヒートマップチャート実装

\- アニメーション付きグラフ

\- 時系列変化表示



\#### Day 13-14: 管理者ダッシュボード

\- システム監視画面

\- コンテンツ管理機能

\- 基本的なユーザー分析



\### 第3週: 新機能 + 最適化

\*\*優先度: 中\*\*



\#### Day 15-17: アラート・通知機能

\- トレンド通知システム

\- メール配信機能

\- レポート自動配信



\#### Day 18-19: エクスポート機能

\- CSV/PDF エクスポート

\- 基本的な外部連携API



\#### Day 20-21: 最終調整・テスト

\- 全機能統合テスト

\- パフォーマンス最適化

\- ドキュメント更新



---



\## 🛠 技術実装詳細



\### 追加パッケージ要件

```bash

\# UI/UX 強化

npm install @tailwindcss/line-clamp framer-motion



\# データ可視化強化

npm install d3 @types/d3 react-heatmap-grid



\# 日付操作

npm install date-fns



\# 通知機能

npm install nodemailer @types/nodemailer



\# エクスポート機能

npm install jspdf html2canvas xlsx



\# パフォーマンス監視

npm install @vercel/analytics

```



\### 新規ディレクトリ構造

```

src/

├── app/

│   ├── admin/                 # 管理者ページ

│   │   ├── monitoring/

│   │   ├── articles/

│   │   └── analytics/

│   └── settings/              # ユーザー設定

├── components/

│   ├── admin/                 # 管理者専用コンポーネント

│   ├── charts/                # 高度なチャート

│   ├── filters/               # フィルター関連

│   └── notifications/         # 通知関連

├── lib/

│   ├── predictions/           # 予測分析

│   ├── notifications/         # 通知システム

│   └── exports/              # エクスポート機能

└── types/

&nbsp;   ├── admin.ts              # 管理者関連型

&nbsp;   ├── filters.ts            # フィルター関連型

&nbsp;   └── notifications.ts      # 通知関連型

```



\### データベース拡張

```sql

-- 新規テーブル

CREATE TABLE predictions (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; type VARCHAR(50) NOT NULL,

&nbsp; data JSONB NOT NULL,

&nbsp; accuracy\_score FLOAT,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE user\_preferences (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; user\_id VARCHAR(100) NOT NULL,

&nbsp; preferences JSONB NOT NULL,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);



CREATE TABLE notifications (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; type VARCHAR(50) NOT NULL,

&nbsp; recipient VARCHAR(255) NOT NULL,

&nbsp; content JSONB NOT NULL,

&nbsp; sent\_at TIMESTAMP,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);

```



---



\## 🎯 成功指標 (KPI)



\### Phase 2 完了時の目標

\- \*\*ユーザーエクスペリエンス\*\*: ページ読み込み時間 2秒以内

\- \*\*視覚的インパクト\*\*: モダンデザインによる滞在時間 50% 向上

\- \*\*機能利用率\*\*: 新機能の月間利用率 30% 以上

\- \*\*管理効率\*\*: 管理作業時間 60% 削減

\- \*\*データ精度\*\*: 予測精度 80% 以上



\### 追加監視項目

\- フィルター機能使用率

\- エクスポート機能利用頻度

\- 通知機能の配信成功率

\- 管理者ダッシュボードアクセス数



---



\## 🔒 セキュリティ・パフォーマンス考慮事項



\### セキュリティ強化

\- 管理者機能の認証強化

\- API rate limiting の詳細設定

\- ユーザーデータ暗号化

\- CSRF対策強化



\### パフォーマンス最適化

\- 画像最適化とCDN活用

\- データベースクエリ最適化

\- React コンポーネントのメモ化

\- バンドルサイズ最小化



\### 監視・メトリクス

\- リアルタイムエラー監視

\- API レスポンス時間追跡

\- ユーザー行動分析

\- システムリソース監視



---



\## 📝 開発チェックリスト



\### Phase 2 完了条件

\- \[ ] ネオモーフィズム × グラスモーフィズムデザイン実装

\- \[ ] 全コンポーネントのモダン化完了

\- \[ ] 詳細分析機能（予測・カテゴリ・エンゲージメント）

\- \[ ] インタラクティブフィルター機能

\- \[ ] 管理者ダッシュボード基本機能

\- \[ ] アラート・通知システム

\- \[ ] エクスポート機能（CSV・PDF）

\- \[ ] 全機能のテスト完了

\- \[ ] ドキュメント更新

\- \[ ] パフォーマンス最適化



\### 次のPhase 3への引き継ぎ項目

\- AI予測精度の更なる向上

\- リアルタイムデータストリーミング

\- 多言語対応

\- 高度なユーザー管理機能

\- 本格的な企業向けAPI提供



---



\*本設計書は Claude Code での実装を前提とし、具体的なコード記述は省略している。各機能の詳細実装は開発フェーズで Claude Code と連携して進行する。\*

