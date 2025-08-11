# TODO Vibe - モダンなタスク管理アプリケーション

Next.js 15とモダンな技術スタックで構築された、シンプルで使いやすいTODOアプリケーションです。

## 🚀 主な機能

- タスクの作成・編集・削除
- タスク完了状態の管理
- レスポンシブデザイン
- ユーザー認証

## 🛠️ 技術スタック

### フロントエンド

- **[Next.js 15](https://nextjs.org/)** - React フレームワーク（App Router使用）
- **[React 19](https://react.dev/)** - UIライブラリ
- **[Tailwind CSS v4](https://tailwindcss.com/)** - ユーティリティファーストCSS
- **[shadcn/ui](https://ui.shadcn.com/)** - 再利用可能なコンポーネント
- **[Lucide React](https://lucide.dev/)** - アイコンライブラリ

### バックエンド・データベース

- **[PostgreSQL](https://www.postgresql.org/)** - リレーショナルデータベース
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[NextAuth.js](https://next-auth.js.org/)** - 認証ライブラリ

### 開発ツール

- **[TypeScript](https://www.typescriptlang.org/)** - 型安全な開発
- **[Vitest](https://vitest.dev/)** - ユニットテスト
- **[Playwright](https://playwright.dev/)** - E2Eテスト
- **[ESLint](https://eslint.org/)** & **[Prettier](https://prettier.io/)** - コード品質
- **[Husky](https://typicode.github.io/husky/)** - Git フック管理
- **[pnpm](https://pnpm.io/)** - パッケージマネージャー

## 📦 インストール

### 前提条件

- Node.js 22.x 以上
- pnpm 10.x 以上
- PostgreSQL 17.x 以上

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/kengo-mashita/todo-vibe-coding-20250810.git
cd todo-vibe-coding-20250810
```

2. 依存関係をインストール

```bash
pnpm install
```

3. 環境変数を設定

```bash
cp .env.example .env
```

`.env` ファイルを編集し、以下の変数を設定してください：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/todo_vibe"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. データベースのマイグレーション

```bash
pnpm drizzle-kit push
```

5. 開発サーバーを起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが起動します。

## 🔧 利用可能なスクリプト

```bash
# 開発サーバー（Turbopack使用）
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# コードのリント
pnpm lint

# ユニットテスト実行
pnpm test

# ユニットテスト（ウォッチモード）
pnpm test:watch

# E2Eテスト実行
pnpm e2e

# E2EテストUI起動
pnpm e2e:ui

# E2Eテスト（ブラウザ表示）
pnpm e2e:headed

# E2Eテストレポート表示
pnpm e2e:report
```

## 📁 プロジェクト構造

```
todo-vibe-coding-20250810/
├── src/
│   ├── app/              # Next.js App Router
│   ├── db/               # データベース設定・スキーマ
│   ├── lib/              # ユーティリティ関数
│   └── styles/           # グローバルスタイル
├── public/               # 静的ファイル
├── tests/                # E2Eテスト
├── infra/                # インフラ設定
└── ...設定ファイル
```

## 🧪 テスト

### ユニットテスト

Vitestを使用したコンポーネントとユーティリティのテスト：

```bash
pnpm test
```

### E2Eテスト

Playwrightを使用した統合テスト：

```bash
pnpm e2e
```

## 🚀 デプロイ

### Vercelへのデプロイ

このプロジェクトはVercelに最適化されています。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kengo-mashita/todo-vibe-coding-20250810)

### その他のプラットフォーム

1. `pnpm build` でプロダクションビルドを作成
2. `pnpm start` でNode.jsサーバーを起動
3. 環境変数を適切に設定

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - 素晴らしいReactフレームワーク
- [Vercel](https://vercel.com/) - ホスティングプラットフォーム
- [shadcn/ui](https://ui.shadcn.com/) - 美しいUIコンポーネント
