## Summary

A simple personal TODO app where users can **create, edit, complete, delete, and restore** tasks.
Provides **email/password authentication (NextAuth Credentials)** for user registration, login, logout, and account deletion.
Adopts the flow: **Registration → Email Verification → Login** (newly registered users remain unverified until email verification).

## Scope

### Goals

- G1: After logging in, users can create, edit, delete, restore, and toggle completion of their own tasks
- G2: A single-screen, intuitive UI (list + add/edit in one main view)
- G3: Email/password **registration, email verification, login, logout, account deletion**
- G4: Basic search/filter features and soft delete (trash bin)

### Non-Goals

- NG1: Notifications/reminders
- NG2: Team sharing/collaboration
- NG3: Tags/subtasks/recurring tasks/attachments
- NG4: Social login (Google, etc.) – planned for future
- NG5: Password change/reset – planned for future

## User Stories

- US-001: A user can register by entering email/password/username
  AC: On success, a verification email is sent; user remains unverified. Duplicate email is rejected.
- US-002: A user can complete verification via the link in the email
  AC: Within the token's validity, `email_verified` is set. Invalid/expired token returns error.
- US-003: A user can log in and log out
  AC: NextAuth session is issued/invalidated.
- US-004: A user can create/edit/toggle completion/delete/restore tasks
  AC: User can only access their own data. Deletion is soft delete.
- US-005: A user can view the trash bin and restore deleted tasks
  AC: List tasks where `deleted_at IS NOT NULL` and allow restore.
- US-006: A user can delete their account
  AC: After confirmation dialog, delete user and related data, then log out.
- US-007: A verification email can be resent
  AC: Available only to unverified users.

## Functional Requirements

### Authentication/Authorization

- FR-001: Registration at `/api/auth/register`, verification at `/api/auth/verify?token=...`.
- FR-002: Resend verification email at `/api/auth/verify/resend` (unverified only).
- FR-003: Login at `/api/auth/login`, logout at `/api/auth/logout`, get session at `/api/auth/session`.
- FR-004: Users with `email_verified` null can log in, but **cannot** use main app features (major APIs return 403).
- FR-005: API must always scope queries to `user_id = session.user.id` and prevent access to other users' data.

### Tasks

- FR-010: Task list `/api/tasks` accepts `status=active|completed|deleted`, `q`, `limit`, `cursor`.
- FR-011: Create `/api/tasks`, edit `/api/tasks/:id`, toggle completion `/api/tasks/:id/toggle`.
- FR-012: Delete `/api/tasks/:id` is **soft delete** (sets `deleted_at`). Restore via `/api/tasks/:id/restore`.
- FR-013: Validation: `title` length 1–100 chars. Trim whitespace.
- FR-014: List sorted by creation date (desc). Search by `title ILIKE`.

### Account Deletion

- FR-020: Provide `DELETE /api/users/me`. Delete related data (sessions/accounts/tasks/users) in a transaction.

### Error Handling / Response

- FR-030: Status codes: 401 (unauthenticated), 403 (forbidden/unverified restriction), 404 (not found/other user’s resource), 409 (duplicate), 413 (limit exceeded), 422 (invalid input), 500 (internal).
- FR-031: Error body format: `{ error: { code, message } }`.

## Business Rules

- BR-001: `email` must be unique. `username` max 8 characters, unique, alphanumeric/underscore only.
- BR-002: Max **100 tasks per user**. Exceeding limit returns 413.
- BR-003: Password must be **8+ characters**. Store as bcrypt hash.
- BR-004: Task deletion is soft delete; no retention limit (future physical delete handled via batch).
- BR-005: Verification token validity = 24 hours.

## Non-Functional Requirements

- NFR-001: Response p95 < 300ms (Neon region close to Vercel).
- NFR-002: Mitigate CSRF/XSS/SQLi. Rate limit (e.g., `/api/auth/*` 60 req/h per IP).
- NFR-003: Logs must not contain PII (no plain-text emails).
- NFR-004: Error messages differ for dev/prod (prod uses generic wording).

## UI/UX

- Settings page includes "Delete Account" link (with confirmation dialog).
- List view: search and tab switch between active/completed/trash.
- Form: disable submit button when `title` is empty.

## Tech Stack / Ops

- Next.js (App Router) / TypeScript / Tailwind / shadcn/ui
- Drizzle + Neon (PostgreSQL)
- NextAuth.js (Credentials)
- Resend (email sending)
- Vercel (hosting/deployment)
- GitHub Actions (lint/test/deploy)

## Test Plan

- E2E (happy path): Register → Verify → Login → Task CRUD → Delete → Restore → Logout → Re-login check
- Error paths: Duplicate registration / invalid token / unverified access to Tasks API / limit exceeded / permission error / delete cancel
