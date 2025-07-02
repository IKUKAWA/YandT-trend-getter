# テスト戦略とガイド

## 概要

YandT Trend Getterプロジェクトの包括的なテストスイートです。ユニットテスト、統合テスト、E2Eテストを含みます。

## テストの種類

### 1. ユニットテスト (`*.test.ts`, `*.test.tsx`)
- **目的**: 個別の関数、コンポーネント、フックをテスト
- **ツール**: Jest + React Testing Library
- **場所**: `src/__tests__/`配下の各フォルダ

### 2. 統合テスト (`api/*.test.ts`)
- **目的**: APIエンドポイントとデータフローをテスト
- **ツール**: Jest + MSW (Mock Service Worker)
- **場所**: `src/__tests__/api/`

### 3. E2Eテスト (`e2e/*.spec.ts`)
- **目的**: エンドユーザーの実際の使用フローをテスト
- **ツール**: Playwright
- **場所**: `src/__tests__/e2e/`

## セットアップ

### 必要な依存関係のインストール
```bash
npm install
```

### テスト依存関係
- `jest`: テストランナー
- `@testing-library/react`: Reactコンポーネントテスト
- `@testing-library/jest-dom`: DOM関連のmatcher
- `@testing-library/user-event`: ユーザーインタラクションシミュレーション
- `msw`: API モッキング
- `@playwright/test`: E2Eテスト

## テスト実行

### ユニット・統合テスト
```bash
# 全テスト実行
npm run test

# ウォッチモードで実行
npm run test:watch

# カバレッジ付きで実行
npm run test:coverage

# CI環境での実行
npm run test:ci
```

### E2Eテスト
```bash
# E2Eテスト実行
npm run test:e2e

# UIモードで実行（デバッグ用）
npm run test:e2e:ui

# Playwright初回セットアップ
npx playwright install
```

## テストの書き方

### ユニットテストの例

```typescript
import { render, screen } from '@testing-library/react'
import { ChannelSearch } from '@/components/channel/ChannelSearch'

describe('ChannelSearch', () => {
  test('should render search input', () => {
    render(<ChannelSearch onChannelSelect={jest.fn()} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
```

### APIテストの例

```typescript
import { GET } from '@/app/api/channels/search/route'
import { NextRequest } from 'next/server'

describe('/api/channels/search', () => {
  test('should return search results', async () => {
    const request = new NextRequest('http://localhost/api/channels/search?q=test')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### E2Eテストの例

```typescript
import { test, expect } from '@playwright/test'

test('should search and select channel', async ({ page }) => {
  await page.goto('/channel-analysis')
  await page.fill('[role="combobox"]', 'テスト')
  await page.click('[role="option"]:first-child')
  await expect(page.getByText('分析データ')).toBeVisible()
})
```

## モックとテストデータ

### MSWハンドラー
- `src/__tests__/mocks/handlers.ts`: API応答のモック
- `src/__tests__/mocks/server.ts`: MSWサーバー設定

### テストユーティリティ
- `src/__tests__/utils/test-utils.tsx`: 共通テストユーティリティ
- カスタムレンダー、モックデータファクトリー、テストヘルパー

## テストカバレッジ

### 目標カバレッジ
- **Line Coverage**: 80%以上
- **Function Coverage**: 85%以上
- **Branch Coverage**: 75%以上
- **Statement Coverage**: 80%以上

### カバレッジレポート
```bash
npm run test:coverage
```
レポートは `coverage/` ディレクトリに生成されます。

## CI/CD統合

### GitHub Actions
```yaml
- name: Run tests
  run: npm run test:ci

- name: Run E2E tests
  run: npm run test:e2e
```

## ベストプラクティス

### 1. テスト命名
- **Describe**: コンポーネント名やモジュール名
- **Test**: 具体的な動作や期待結果

```typescript
describe('ChannelSearch Component', () => {
  test('should display search results when typing', () => {
    // テスト内容
  })
})
```

### 2. アクセシビリティテスト
```typescript
// role、aria属性、キーボードナビゲーションをテスト
expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
```

### 3. エラーハンドリングテスト
```typescript
// エラー状態、ローディング状態、エッジケースをテスト
test('should handle API errors gracefully', async () => {
  // エラーモック設定
  // エラー処理のテスト
})
```

### 4. 非同期テスト
```typescript
// waitFor、findBy を適切に使用
await waitFor(() => {
  expect(screen.getByText('Loading...')).not.toBeInTheDocument()
})
```

## デバッグ

### テストデバッグ
```bash
# 特定のテストファイルのみ実行
npm test -- ChannelSearch.test.tsx

# 特定のテストケースのみ実行
npm test -- --testNamePattern="should render search input"

# デバッグ情報を表示
npm test -- --verbose
```

### E2Eテストデバッグ
```bash
# ヘッドレスモードを無効にして実行
npm run test:e2e -- --headed

# ステップ実行
npm run test:e2e -- --debug
```

## トラブルシューティング

### よくある問題

1. **テストがタイムアウトする**
   - `waitFor`のタイムアウト値を調整
   - 非同期処理の完了を適切に待機

2. **モックが機能しない**
   - `jest.clearAllMocks()`を`beforeEach`で実行
   - モックの設定順序を確認

3. **E2Eテストが不安定**
   - 要素の待機条件を見直し
   - `page.waitForLoadState()`を使用

### パフォーマンス最適化
- 必要最小限のコンポーネントのみレンダー
- 重い計算処理はモック
- 並列実行の活用

## 貢献ガイド

### 新しいテストの追加
1. 適切なディレクトリに配置
2. 命名規則に従う
3. 既存のテストユーティリティを活用
4. カバレッジを確認

### テストレビューのポイント
- テストの意図が明確か
- エッジケースがカバーされているか
- モックが適切に設定されているか
- アクセシビリティがテストされているか

## 参考資料

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)