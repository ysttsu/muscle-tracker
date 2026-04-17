# muscle-tracker

週3回の腹筋習慣を「ポチッとボタン1つ」で記録する個人用トラッカー。

## Why

- 継続の摩擦を最小化したい。フォーム入力やアプリ起動の手間は続かない理由になる
- 習慣トラッカーSaaSは多機能すぎる。自分が欲しいのは「やった/やってない」の1ビットだけ
- 週3回のしきい値を視覚的に見たい

## Stack

| 層 | 採用 | 理由 |
|---|---|---|
| Web framework | React Router v7 (SSR) | loader/action でサーバーサイド実装が自然に書ける。Remixフォークの流れを継承 |
| DB | Turso (libsql) | SQLite互換でVercel Edge/Serverlessと相性◎、Hobby無料枠で十分 |
| ORM | Drizzle ORM | 型推論が強くマイグレーションが軽い |
| Hosting | Vercel (Hobby) | React Router presetでゼロ設定デプロイ |
| Auth | GitHub OAuth + username allowlist | publicリポ前提で自分専用アクセスを成立させるための最小構成 |
| Styling | Tailwind v4 + daisyUI v5 | プリセットが豊富で個人アプリの見た目を素早く整える |

## Security model

このリポは public だが、デプロイ先は **所有者のみアクセス可能** という設計。

- 認可: `ALLOWED_GITHUB_USERS` 環境変数に含まれる GitHub ユーザーのみログイン可。それ以外は 403
- 認証: GitHub OAuth。access token はサーバー側でしか扱わず、ブラウザにはセッション Cookie のみ渡す
- セッション: `createCookieSessionStorage` による署名付き Cookie (`httpOnly`, `secure`, `sameSite=Lax`, 30日)
- CSRF: OAuth フローでは `state` パラメータを Cookie と照合
- シークレット管理: Vercel 環境変数のみ。`.env` は `.gitignore` 済み。gitleaks による secret scanning を CI で実行

## Setup

### 1. GitHub OAuth App を作成

`https://github.com/settings/developers` から "New OAuth App":

- **Homepage URL**: `https://muscle-tracker-ten.vercel.app`
- **Authorization callback URL**: `https://muscle-tracker-ten.vercel.app/auth/github/callback`

ローカル開発でも使いたい場合は `http://localhost:5173/auth/github/callback` も追加する (OAuth App は複数 callback URL を登録可能)。

Client ID と Client Secret を取得。

### 2. Turso データベース

`https://turso.tech/app` でデータベース作成 → "Generate Token" (scope: read-and-write, 対象は当該DB限定)。URL と token を控える。

### 3. Vercel 環境変数

Vercel Dashboard → Project → Settings → Environment Variables に以下を登録 (`.env.example` 参照):

| Key | 備考 |
|---|---|
| `DB_URL` | Turso database URL |
| `DB_AUTH_TOKEN` | Turso token (read-and-write) |
| `GITHUB_OAUTH_CLIENT_ID` | OAuth App の Client ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | OAuth App の Client Secret |
| `SESSION_SECRET` | `openssl rand -base64 32` で生成 |
| `ALLOWED_GITHUB_USERS` | 許可する GitHub username (comma-separated) |

Production / Preview / Development の各環境で個別に設定推奨 (特に `SESSION_SECRET` は環境ごとに分ける)。

### 4. ローカル開発

```bash
cp .env.example .env
# .env を編集
pnpm install
pnpm dev
```

ローカルではスキーマを atlas で適用:

```bash
atlas schema apply --env dev
```

## Deploy

```bash
pnpm ship
```

master ブランチに push すると Vercel が自動デプロイ。

## Rotation

- **`SESSION_SECRET`**: 6ヶ月ごと or 漏洩時。rotate すると既存セッションは全て無効化される
- **Turso token**: 月次 rotate 推奨。Turso dashboard から新規発行 → Vercel env 更新 → 旧トークン削除
- **GitHub OAuth Client Secret**: 漏洩時のみ rotate (GitHub 側で regenerate)

## License

MIT
