# Issue Backlog

Priority: P1 = Highest priority / P2 = Normal. "Depends" indicates suggested implementation order.

| ID  | Title | Labels | Priority | Depends |
| --- | ----- | ------ | -------- | ------- |

| A-01 | [Auth] NextAuth (Credentials) initial setup & session wiring | `auth,backend,P1` | P1 | - |

| A-02 | [Auth] Register: POST /api/auth/register + send verification email | `auth,backend,email,P1` | P1 | A-01 |

| A-03 | [Auth] Verify: GET /api/auth/verify?token=... | `auth,backend,P1` | P1 | A-02 |

| A-04 | [Auth] Resend verification email: POST /api/auth/verify/resend | `auth,backend,email,P2` | P2 | A-02 |

| A-05 | [Auth] Login/Logout (Credentials) | `auth,backend,frontend,P1` | P1 | A-01 |

| A-06 | [Auth] Feature restriction for unverified users (403) | `auth,backend,P1` | P1 | A-03 |

| T-01 | [Tasks] Prepare Drizzle schema/migrations | `tasks,backend,db,P1` | P1 | A-01 |

| T-02 | [Tasks] Create: POST /api/tasks (enforce limit of 100) | `tasks,backend,P1` | P1 | T-01,A-06 |

| T-03 | [Tasks] List: GET /api/tasks (filter/search/pagination) | `tasks,backend,P1` | P1 | T-01,A-06 |

| T-04 | [Tasks] Edit: PUT /api/tasks/:id | `tasks,backend,P2` | P2 | T-01 |

| T-05 | [Tasks] Toggle completion: PATCH /api/tasks/:id/toggle | `tasks,backend,P2` | P2 | T-01 |

| T-06 | [Tasks] Delete/Restore: DELETE /api/tasks/:id & PATCH /api/tasks/:id/restore | `tasks,backend,P1` | P1 | T-01 |

| T-07 | [Tasks] Ownership guard (404 response) | `tasks,backend,security,P1` | P1 | T-01 |

| U-01 | [Users] Delete account: DELETE /api/users/me | `users,backend,P1` | P1 | A-01,T-01 |

| UI-01 | [UI] Auth pages (register/login/verification notice/resend) | `frontend,ui,auth,P1` | P1 | A-02,A-05,A-04 |

| UI-02 | [UI] Task screen (list + add/edit/search/filter/pagination) | `frontend,ui,tasks,P1` | P1 | T-02..T-06 |

| UI-03 | [UI] Settings page (account deletion flow) | `frontend,ui,users,P2` | P2 | U-01 |

| EM-01 | [Email] Verification email template & Resend integration | `email,backend,P2` | P2 | A-02,A-04 |

| ERR-01 | [API] Error formatter & Zod validation unification | `backend,quality,P1` | P1 | A-01 |

| SEC-01 | [Security] Rate limit `/api/auth/*` (60 req/h/IP) | `security,backend,P2` | P2 | A-01 |

| SEC-02 | [Security] Review CSRF/XSS headers & cookie settings | `security,backend,frontend,P2` | P2 | A-01 |

| OPS-01 | [Ops] Audit/app logs (no PII output) | `ops,backend,quality,P2` | P2 | A-01 |

| CI-01 | [CI] GitHub Actions (lint/test/build/deploy) | `ci,quality,P2` | P2 | - |

| DOC-01 | [Docs] Update README/design/test documentation | `docs,quality,P2` | P2 | All |

| TEST-01 | [Test] Initial Playwright setup | `test,e2e,P1` | P1 | UI-01,UI-02 |

| TEST-02 | [Test] API baseline with Supertest | `test,api,P1` | P1 | A-01,T-02..T-06 |

| TEST-03 | [Test] Unit test foundation (validation/utilities) | `test,unit,P2` | P2 | ERR-01 |

---

## A-01 [Auth] NextAuth (Credentials) initial setup & session wiring

**Summary:** Configure NextAuth with the Credentials provider so that `auth()` is usable. Ensure session retrieval API works.

**Acceptance Criteria:**

- [x] Enable NextAuth Credentials with bcrypt password verification
- [x] `GET /api/auth/session` returns login state
- [x] Cookie/Secure settings differ for production vs development

## A-02 [Auth] Register: POST /api/auth/register + send verification email

**Summary:** User registration → issue `verification_token` → send verification email via Resend.

**Acceptance Criteria:**

- [x] Duplicate email/username returns 409
- [x] On success (201), token is saved and email sending is logged
- [x] Input validation (email/password/username)

## A-03 [Auth] Verify: GET /api/auth/verify?token=...

**Summary:** Validate token → update `email_verified`. Expired/invalid tokens return 400.

**Acceptance Criteria:**

- [x] Valid token returns 200, invalid/expired returns 400
- [x] One-time use (cannot be reused)

## A-04 [Auth] Resend verification email: POST /api/auth/verify/resend

**Summary:** Resend verification email only to unverified users.

**Acceptance Criteria:**

- [x] Unverified users only → 200
- [x] Verified/non-existent user → 400/404

## A-05 [Auth] Login/Logout (Credentials)

**Summary:** Connect login/logout UI & API, control session.

**Acceptance Criteria:**

- [x] Correct credentials → 200 / mismatch → 401
- [x] Logout success → 200
- [x] UI integration (form/button)

## A-06 [Auth] Feature restriction for unverified users (403)

**Summary:** For users with `email_verified IS NULL`, major APIs return 403.

**Acceptance Criteria:**

- [x] `/api/tasks*` returns 403 if unverified
- [x] Frontend shows verification-required notice

## T-01 [Tasks] Prepare Drizzle schema/migrations

**Summary:** Define schema and migrations for User/Task/Session/Account/VerificationToken.

**Acceptance Criteria:**

- [x] Tables created per ER diagram
- [x] Unique constraints (email/username)
- [x] Indexes (tasks.user_id, created_at)

## T-02 [Tasks] Create: POST /api/tasks (enforce limit of 100)

**Summary:** Implement title validation and limit check of 100 tasks.

**Acceptance Criteria:**

- [x] 201 for creation, 101st task → 413
- [x] Title length 1–100 chars, trimmed non-empty, else 422

## T-03 [Tasks] List: GET /api/tasks (filter/search/pagination)

**Summary:** Implement status, q, limit, cursor. Sorted by creation date (desc).

**Acceptance Criteria:**

- [x] status=active|completed|deleted
- [x] ILIKE search, use nextCursor for pagination

## T-04 [Tasks] Edit: PUT /api/tasks/:id

**Summary:** Validate title update and check ownership.

**Acceptance Criteria:**

- [x] 200 on update, others’ resources → 404
- [x] `updated_at` reflects change

## T-05 [Tasks] Toggle completion: PATCH /api/tasks/:id/toggle

**Summary:** Flip `is_completed`.

**Acceptance Criteria:**

- [x] 200 on toggle, others’ resources → 404

## T-06 [Tasks] Delete/Restore: DELETE /api/tasks/:id & PATCH /api/tasks/:id/restore

**Summary:** Implement soft delete and restore. Support trash view.

**Acceptance Criteria:**

- [x] Delete → 204 (set deleted_at)
- [x] Restore → 200 (deleted_at=null)

## T-07 [Tasks] Ownership guard (404 response)

**Summary:** Return 404 when accessing other users’ IDs.

**Acceptance Criteria:**

- [x] GET/PUT/PATCH/DELETE all return 404 if not owner
- [x] No PII in logs

## U-01 [Users] Delete account: DELETE /api/users/me

**Summary:** Delete related data in a transaction, return 204. Auto logout.

**Acceptance Criteria:**

- [x] 204 No Content
- [x] Verify deletion of tasks/sessions/accounts/users

## UI-01 [UI] Auth pages (register/login/verification notice/resend)

**Summary:** Implement forms & validation in App Router. Include resend flow.

**Acceptance Criteria:**

- [x] 4 screens: register/login/unverified notice/resend
- [x] Connect to API (toast/error handling)

## UI-02 [UI] Task screen (list + add/edit/search/filter/pagination)

**Summary:** Single-screen main operation. Consider keyboard navigation.

**Acceptance Criteria:**

- [x] Tabs: active/completed/trash
- [x] Search/filter/pagination work as intended

## UI-03 [UI] Settings page (account deletion flow)

**Summary:** Confirmation dialog → call delete API → redirect to login.

**Acceptance Criteria:**

- [x] On success, redirect to `/login`
- [x] On failure, show generic error

## EM-01 [Email] Verification email template & Resend integration

**Summary:** Switch between prod/dev domains. Simple branded template.

**Acceptance Criteria:**

- [x] Include expiration time (24h) in body
- [x] Test link click-through in dev

## ERR-01 [API] Error formatter & Zod validation unification

**Summary:** Standardize `{ error: { code, message } }`. Share Zod schemas.

**Acceptance Criteria:**

- [x] Cover formatting for 422/401/403/404/409/413/500
- [x] Frontend can handle uniformly

## SEC-01 [Security] Rate limit `/api/auth/*` (60 req/h/IP)

**Summary:** Add rate limiting to auth APIs.

**Acceptance Criteria:**

- [ ] Over limit → 429
- [ ] Log threshold exceeded (no PII)

## SEC-02 [Security] Review CSRF/XSS headers & cookie settings

**Summary:** Apply required headers/CSP, confirm SameSite/Secure cookie attributes.

**Acceptance Criteria:**

- [ ] Apply CSP to major pages
- [ ] Proper Secure/SameSite/Lax settings

## OPS-01 [Ops] Audit/app logs (no PII output)

**Summary:** Logging for register/verify/login/logout/task_crud/account_delete.

**Acceptance Criteria:**

- [ ] Structured logs without PII
- [ ] Add info/error logs for main flows

## CI-01 [CI] GitHub Actions (lint/test/build/deploy)

**Summary:** On PR: lint/test. On main merge: deploy.

**Acceptance Criteria:**

- [ ] Run ESLint/TypeCheck/Unit/API/E2E
- [ ] Report results to PR on failure

## DOC-01 [Docs] Update README/design/test documentation

**Summary:** Keep README consistent with design/requirements.

**Acceptance Criteria:**

- [ ] Include setup steps/env vars/start method
- [ ] Test execution steps (Playwright/Supertest)

## TEST-01 [Test] Initial Playwright setup

**Summary:** Prepare E2E environment and run one smoke test.

**Acceptance Criteria:**

- [x] Works in headless/headed modes
- [x] Save screenshots/video recordings

## TEST-02 [Test] API baseline with Supertest

**Summary:** Add one test each for main Auth/Tasks endpoints.

**Acceptance Criteria:**

- [x] At least 1 success & 1 failure case each
- [x] Integrated into CI

## TEST-03 [Test] Unit test foundation (validation/utilities)

**Summary:** Unit tests for Zod schemas and utilities.

**Acceptance Criteria:**

- [x] Minimum coverage (>60%)
- [x] Verify digest for failure cases
