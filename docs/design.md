# design.md

## Architecture Overview

- **Configuration**: Frontend (Next.js) + Backend API (Next.js API Routes) + DB (PostgreSQL/Neon)
- **Hosting**: Vercel
- **Data Persistence**: Neon (PostgreSQL)
- **Email Sending**: Resend (registration confirmation & notification emails)
- **Authentication Session**: NextAuth.js (Credentials + Session)
- DB operations via API (user scope at application layer. Consider RLS as needed)

## Tech Stack

- **Frontend**: Next.js 15 (App Router) / TypeScript / Tailwind CSS / shadcn/ui
- **Backend**: Next.js API Routes / Drizzle
- **DB**: Neon (PostgreSQL)
- **Authentication**: NextAuth.js (Email+Password Credentials)
- **Deployment**: Vercel
- **Email**: Resend (shared domain usage)

## Data Model

### User

| Field          | Type           | Notes                                             |
| -------------- | -------------- | ------------------------------------------------- |
| id             | UUID           | PK                                                |
| email          | string         | unique, required                                  |
| password_hash  | string         | Hashed storage (bcrypt)                           |
| username       | string         | ≤8 characters, unique                             |
| name           | string         | Optional (display name)                           |
| image          | string         | Optional (profile image URL)                      |
| email_verified | timestamp/null | Email verification timestamp (null if unverified) |
| created_at     | timestamp      | default now                                       |

---

### Account (for external providers - future expansion)

| Field               | Type           | Notes                                 |
| ------------------- | -------------- | ------------------------------------- |
| user_id             | UUID           | FK → User.id                          |
| type                | string         | Provider type (oauth/credentials etc) |
| provider            | string         | e.g., google, github                  |
| provider_account_id | string         | User ID within provider               |
| access_token        | string/null    | Optional                              |
| refresh_token       | string/null    | Optional                              |
| expires_at          | timestamp/null | Optional                              |

---

### Session

| Field         | Type      | Notes           |
| ------------- | --------- | --------------- |
| session_token | string    | PK              |
| user_id       | UUID      | FK → User.id    |
| expires       | timestamp | Expiration date |

---

### VerificationToken (for NextAuth processing)

| Field      | Type      | Notes                                     |
| ---------- | --------- | ----------------------------------------- |
| identifier | string    | Email address etc (user identifier)       |
| token      | string    | PK equivalent (composite with identifier) |
| expires    | timestamp | Expiration (e.g., 24h)                    |

---

### Task

| Field        | Type           | Notes            |
| ------------ | -------------- | ---------------- |
| id           | UUID           | PK               |
| user_id      | UUID           | FK → User.id     |
| title        | string         | 1-100 characters |
| is_completed | boolean        | default false    |
| deleted_at   | timestamp/null | For soft delete  |
| created_at   | timestamp      | default now      |
| updated_at   | timestamp      | on update        |

---

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : has
    USER ||--o{ SESSION : has
    USER ||--o{ TASK : has
    USER ||--o{ VERIFICATIONTOKEN : has

    USER {
        UUID id PK
        string email
        string password_hash
        string username
        string name
        string image
        timestamp email_verified
        timestamp created_at
    }

    ACCOUNT {
        UUID user_id FK
        string type
        string provider
        string provider_account_id
        string access_token
        string refresh_token
        timestamp expires_at
    }

    SESSION {
        string session_token PK
        UUID user_id FK
        timestamp expires
    }

    VERIFICATIONTOKEN {
        string identifier
        string token
        timestamp expires
    }

    TASK {
        UUID id PK
        UUID user_id FK
        string title
        boolean is_completed
        timestamp deleted_at
        timestamp created_at
        timestamp updated_at
    }
```

## API Endpoints

### Auth

- `POST /api/auth/register` : User registration (hash password → issue verification_token → send verification email)
- `GET  /api/auth/verify?token=...` : Verification link processing (verify token → update `email_verified`)
- `POST /api/auth/verify/resend` : Resend verification email (unverified users only)
- `POST /api/auth/login` : Login (NextAuth Credentials)
- `POST /api/auth/logout` : Logout
- `GET  /api/auth/session` : Get current session (for guards)

### Tasks (login & verification required)

- `GET    /api/tasks` : Task list (`status=active|completed|deleted`, `q`, `limit`, `cursor`)
- `POST   /api/tasks` : Create task (**100 task limit check**)
- `PUT    /api/tasks/:id` : Edit task (title etc)
- `PATCH  /api/tasks/:id/toggle` : Toggle complete/incomplete
- `DELETE /api/tasks/:id` : Delete task (soft delete: set `deleted_at`)
- `PATCH  /api/tasks/:id/restore` : Restore soft delete (`deleted_at = null`)

### Users

- `DELETE /api/users/me` : Delete account (delete related data in transaction → 204)

---

## Process Flow

### Authentication Flow (Registration → Verification → Login)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB
  participant Mail as Resend

  U->>W: Submit signup (email, password, username)
  W->>API: POST /api/auth/register {email, passwordHash, username}
  API->>DB: users INSERT (email unique, username unique, password_hash)
  API->>DB: verification_tokens INSERT {identifier=email, token, expires}
  API->>Mail: Send verification URL
  API-->>W: 201 Created

  U->>W: Click verification link
  W->>API: GET /api/auth/verify?token=...
  API->>DB: verification_tokens SELECT & verify (expiry/match)
  API->>DB: users UPDATE email_verified = now()
  API-->>W: 200 OK (verification complete)

  U->>W: Enter login credentials
  W->>API: POST /api/auth/login
  API->>DB: users SELECT (email/password)
  API-->>W: 200 OK (Session issued)
```

### Verification Email Resend

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB
  participant Mail as Resend

  U->>W: Request verification email resend
  W->>API: POST /api/auth/verify/resend
  API->>DB: users SELECT (check if unverified)
  alt Unverified
    API->>DB: verification_tokens UPSERT (new token / expires)
    API->>Mail: Send verification URL
    API-->>W: 200 OK
  else Verified/Non-existent
    API-->>W: 400/404 Error
  end
```

### Basic Operation Process Flow (Tasks)

#### List Retrieval (GET /api/tasks)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Open task list screen
  W->>API: GET /api/tasks?status=active|completed|deleted&q=...&limit&cursor
  API->>DB: tasks SELECT by user_id + filters
  API-->>W: 200 OK (tasks[], nextCursor)
  W-->>U: Display list
```

#### Creation (POST /api/tasks)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Enter task and save
  W->>API: POST /api/tasks {title}
  API->>DB: tasks COUNT by user_id (**100 task limit**)
  alt Under 100 & valid title
    API->>DB: tasks INSERT {user_id, title}
    API-->>W: 201 Created (task)
  else Constraint violation
    API-->>W: 413/422/409 Error
  end
```

#### Edit (PUT /api/tasks/:id)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Edit existing task
  W->>API: PUT /api/tasks/:id {title}
  API->>DB: tasks UPDATE where id & user_id
  API-->>W: 200 OK (task)
```

#### Complete Toggle (PATCH /api/tasks/:id/toggle)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Check completion
  W->>API: PATCH /api/tasks/:id/toggle
  API->>DB: tasks UPDATE is_completed = NOT is_completed
  API-->>W: 200 OK (task)
```

#### Delete・Restore (DELETE /api/tasks/:id, PATCH /api/tasks/:id/restore)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Delete task
  W->>API: DELETE /api/tasks/:id
  API->>DB: tasks UPDATE deleted_at = now()
  API-->>W: 204 No Content

  U->>W: Restore from trash
  W->>API: PATCH /api/tasks/:id/restore
  API->>DB: tasks UPDATE deleted_at = null
  API-->>W: 200 OK (task)
```

#### Account Deletion (DELETE /api/users/me)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant W as Web App
  participant API as API
  participant DB as DB

  U->>W: Execute account deletion (confirmed)
  W->>API: DELETE /api/users/me
  API->>DB: BEGIN
  API->>DB: tasks DELETE/UPDATE (user-related)
  API->>DB: sessions DELETE, accounts DELETE
  API->>DB: users DELETE
  API->>DB: COMMIT
  API-->>W: 204 No Content
  W-->>U: Logout & redirect to login screen
```

---

## Authentication & Authorization Design

- Authentication: NextAuth Credentials. If `email_verified` is null, main feature APIs return 403.
- Authorization: API handlers always match `session.user.id` with `user_id`.
  Future possibility to introduce Postgres RLS (application layer mapping equivalent to `auth.uid()`).

## Validation

- `email`: RFC format. Unique.
- `password`: 8+ characters. Hashed with bcrypt.
- `username`: Max 8 characters. Alphanumeric/underscore only. Unique.
- `title`: 1-100 characters. Return 422 if empty after trim.

## Error Handling Policy

- Invalid input: 422 Unprocessable Entity (aggregate details with Zod)
- Not logged in: 401 Unauthorized
- Unverified/insufficient permissions: 403 Forbidden
- Resource not found: 404 Not Found
- Duplicate: 409 Conflict (email/username)
- Limit exceeded: 413 Payload Too Large (over 100 tasks)
- Internal server error: 500 Internal Server Error
  Basic return format: `{ error: { code, message } }`

## Test Design

- **E2E**: Registration → Verification → Login → Task CRUD → Delete → Restore → Logout → Re-login
- **Unit**: UI logic, validation, API handlers
- **API**: HTTP response verification with Supertest (permissions, limits, unauthenticated)

## CI/CD

1. Push to GitHub → GitHub Actions
   - lint & format (ESLint, Prettier)
   - unit & api tests
2. Merge to main → Vercel auto-deploy

## Branch Strategy (GitHub Flow)

- **main**: Production equivalent
- **feature/**\*: Branch per feature development
- PR-based review → merge to main for deployment
- Direct push to main is prohibited in principle
