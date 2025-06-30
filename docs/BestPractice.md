# Next.js ベストプラクティス ガイド

## 1. プロジェクト構造

### App Router構造（推奨）
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   └── [...]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── features/
├── lib/
│   ├── utils.ts
│   └── db.ts
├── hooks/
└── types/
```

### ディレクトリ命名規則
- kebab-case を使用（例: `user-profile`）
- グループ化には `()` を使用（例: `(marketing)`）
- プライベートフォルダには `_` を使用（例: `_components`）

## 2. App Router のベストプラクティス

### Server Components（デフォルト）
```tsx
// app/posts/page.tsx
async function PostsPage() {
  const posts = await fetchPosts() // サーバーで実行
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### Client Components（必要な場合のみ）
```tsx
'use client'

// components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Server Actions
```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')
  
  await db.post.create({
    data: { title, content }
  })
  
  revalidatePath('/posts')
}
```

## 3. データフェッチング

### Parallel Data Fetching
```tsx
async function Page() {
  // 並列でデータを取得
  const [posts, user] = await Promise.all([
    fetchPosts(),
    fetchUser()
  ])
  
  return <>{/* ... */}</>
}
```

### Streaming with Suspense
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  )
}
```

### キャッシュ戦略
```tsx
// 静的データ（デフォルト）
fetch('https://api.example.com/posts')

// 動的データ
fetch('https://api.example.com/posts', { 
  cache: 'no-store' 
})

// 時間ベースの再検証
fetch('https://api.example.com/posts', { 
  next: { revalidate: 3600 } // 1時間
})
```

## 4. パフォーマンス最適化

### Image最適化
```tsx
import Image from 'next/image'

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false} // LCPに影響する画像のみtrue
    />
  )
}
```

### フォント最適化
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 動的インポート
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('../components/HeavyComponent'),
  { 
    loading: () => <p>Loading...</p>,
    ssr: false // 必要に応じて
  }
)
```

## 5. Metadata と SEO

### 静的メタデータ
```tsx
// app/about/page.tsx
export const metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
    images: ['/og-image.jpg']
  }
}
```

### 動的メタデータ
```tsx
// app/posts/[id]/page.tsx
export async function generateMetadata({ params }) {
  const post = await fetchPost(params.id)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image]
    }
  }
}
```

## 6. エラーハンドリング

### Error Boundary
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Not Found
```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  )
}
```

## 7. 認証パターン

### Middleware認証
```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

## 8. 環境変数

### 環境変数の使い分け
```bash
# .env.local
# サーバーサイドのみ
DATABASE_URL=postgresql://...
API_SECRET=secret_key

# クライアントサイドでも使用
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_ANALYTICS_ID=GA-123456
```

## 9. TypeScript ベストプラクティス

### 型定義
```tsx
// types/index.ts
export interface Post {
  id: string
  title: string
  content: string
  author: User
  createdAt: Date
}

// コンポーネントProps
interface PostCardProps {
  post: Post
  onDelete?: (id: string) => void
}
```

### API Route型安全性
```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  
  // 型安全なレスポンス
  return NextResponse.json<Post[]>(posts)
}
```

## 10. テスト戦略

### コンポーネントテスト
```tsx
// __tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### E2Eテスト（Playwright）
```tsx
// e2e/app.spec.ts
test('should navigate to about page', async ({ page }) => {
  await page.goto('/')
  await page.click('text=About')
  await expect(page).toHaveURL('/about')
})
```

## 11. デプロイメント

### 本番ビルド最適化
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "analyze": "ANALYZE=true next build"
  }
}
```

### 出力形式
```js
// next.config.js
module.exports = {
  output: 'standalone', // Dockerデプロイ用
  // または
  output: 'export', // 静的エクスポート
}
```

## 12. セキュリティ

### Content Security Policy
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'"
  )
  
  return response
}
```

### 環境変数の検証
```tsx
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

## 13. パフォーマンスモニタリング

### Web Vitals
```tsx
// app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric)
  // Analytics サービスに送信
}
```

### Bundle分析
```bash
# Bundle Analyzerのインストール
npm install @next/bundle-analyzer

# next.config.jsで設定
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})
```

## 14. よくあるアンチパターンと解決策

### ❌ Client Componentの過剰使用
```tsx
// 悪い例
'use client'
export function PostList({ posts }) {
  return <>{/* 静的なリスト */}</>
}
```

### ✅ Server Componentを優先
```tsx
// 良い例
export function PostList({ posts }) {
  return <>{/* Server Componentとして */}</>
}
```

### ❌ useEffectでのデータフェッチ
```tsx
// 悪い例
useEffect(() => {
  fetch('/api/posts').then(...)
}, [])
```

### ✅ Server Componentでフェッチ
```tsx
// 良い例
async function Posts() {
  const posts = await fetchPosts()
  return <>{/* ... */}</>
}
```

## 15. 開発ツール

### 推奨VSCode拡張機能
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier
- ESLint
- TypeScript Error Translator

### デバッグ設定
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "runtimeArgs": ["--inspect"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

このガイドは定期的に更新し、Next.jsの新機能や変更に対応させることが重要です。