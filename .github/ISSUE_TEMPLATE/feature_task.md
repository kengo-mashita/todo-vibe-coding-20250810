---
name: Feature Task
about: 実装タスク（機能開発）用テンプレ
title: '[Feature] <機能名>'
labels: ['feature', 'needs-triage']
assignees: ''
---

## 背景 / 目的

- なぜこの機能が必要か（ユーザ価値 / ビジネス理由）
- 関連ドキュメント: [requirements.complete.md](../requirements.complete.md), [design.complete.md](../design.complete.md)

## ゴール / 受け入れ基準 (Acceptance Criteria)

- [ ] 仕様どおりに動作する（UI/UX・API）
- [ ] エッジケースの定義と対応
- [ ] 主要ログ/メトリクスの出力
- [ ] Unit/API テスト作成・更新
- [ ] ドキュメント更新（README/Design/運用手順）

### 代表シナリオ（必要に応じて編集）

- [ ] 未認証ユーザーは主要 API が 403
- [ ] `/api/tasks` の作成で 100 件上限を強制（>100 は 413）
- [ ] `/api/users/me` で関連データが Tx で削除される（204）
- [ ] 認証メール再送 `/api/auth/verify/resend` は未認証のみ 200

## スコープ

- (例) UI: 設定>アカウント削除の導線追加
- (例) API: `DELETE /api/users/me` 実装
- (例) DB: 変更なし

## アウトオブスコープ

- (例) OAuth 連携
- (例) パスワード変更/リセット

## 詳細仕様

- バリデーション:
  - email: RFC 形式
  - password: 8 文字以上
  - username: ≤8, 英数/アンダースコア
  - title: 1–100 文字（トリム）
- エラー整形: `{ error: { code, message } }`

## セキュリティ / 権限

- セッション必須、`session.user.id` と `user_id` の照合
- 未認証 (`email_verified IS NULL`) は主要機能 API を 403

## テスト

- Unit: バリデーション/ロジック
- API: ステータスコード/レスポンスボディ

## リスク / ロールバック

- リスク: 認証状態の誤判定 → 一時的な UX 低下
- ロールバック: デプロイ前のフラグ/環境変数で旧挙動へ切替

## チェックリスト（完了条件）

- [ ] 実装
- [ ] テスト（Unit/API）
- [ ] レビュー
- [ ] ドキュメント更新
