# SmartSpend — Personal Expense Tracker

A full-stack personal finance web app: React (Vite) on the frontend, an Express REST API on the backend, and MySQL for storage. No MongoDB, no Firebase, no third-party finance APIs, no AI APIs — every calculation is plain SQL/JS.

```
React Frontend  →  Express REST API  →  MySQL Database
```

## Features

- **Authentication** — register/login/logout, bcrypt-hashed passwords, JWT-protected routes, each user scoped strictly to their own data
- **Expense management** — add, edit, delete, search, filter (category, payment method, date range, amount range, description), sort by date or amount
- **Dashboard** — total / this-month / today / average-daily summary cards, spending-by-category and monthly-spending breakdowns, recent transactions
- **Budgets** — set a monthly budget per category, see spent/remaining/percent-used, get a warning at 80%+ usage
- **Recurring expenses** — rent, bills, subscriptions; the backend automatically logs them as real expenses and rolls the due date forward
- **Spending insights** — month-over-month comparisons, highest category, average daily spend — all computed with SQL aggregates, no AI involved

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios, Vite, plain CSS3 (no UI framework) |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MySQL (mysql2, parameterized queries) |

## Architecture

```
Request → CORS → JSON body parser → Auth middleware (verifies JWT)
        → Validation middleware   → Controller (thin)
        → Service (business logic + SQL) → MySQL
        → Controller shapes { success, data } → Error-handling middleware (on failure)
```

Every query that touches `expenses`, `budgets`, or `recurring_expenses` is scoped with `WHERE user_id = ?`, where `user_id` comes from the verified JWT — never from the request body — so one user can never read or modify another user's data.

## Database schema

See [`backend/database/schema.sql`](backend/database/schema.sql) for the full DDL. Summary:

- **users** `(id, name, email UNIQUE, password, created_at)`
- **expenses** `(id, user_id → users, amount, category, description, expense_date, payment_method, created_at)`
- **budgets** `(id, user_id → users, category, amount, month, year, created_at)` — unique on `(user_id, category, month, year)`
- **recurring_expenses** `(id, user_id → users, amount, category, description, frequency, start_date, next_due_date, active, created_at)`

All child tables `ON DELETE CASCADE` from `users`. Indexes on `(user_id, expense_date)` and `(user_id, category)` support the dashboard/filter queries; `(next_due_date, active)` supports the recurring-expense processor.

## API documentation

All responses follow `{ success: true, data }` or `{ success: false, message }`.

**Auth**
| Method | Route | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | – | `name, email, password` |
| POST | `/api/auth/login` | – | `email, password` |
| POST | `/api/auth/logout` | ✓ | – |
| GET | `/api/auth/me` | ✓ | – |

**Expenses** (all ✓ auth)
| Method | Route |
|---|---|
| GET | `/api/expenses?category=&payment_method=&date=&start_date=&end_date=&min_amount=&max_amount=&search=&sort_by=date|amount&sort_dir=asc|desc` |
| GET | `/api/expenses/:id` |
| POST | `/api/expenses` |
| PUT | `/api/expenses/:id` |
| DELETE | `/api/expenses/:id` |

**Budgets** (all ✓ auth) — `GET /api/budgets?month=&year=`, `POST`, `PUT /:id`, `DELETE /:id`

**Recurring expenses** (all ✓ auth) — `GET /api/recurring-expenses`, `POST`, `PUT /:id`, `DELETE /:id`

**Dashboard** (all ✓ auth) — `GET /api/dashboard/summary`, `/category-summary`, `/monthly-summary`, `/insights`

## Folder structure

```
smartspend/
├── backend/
│   ├── controllers/   # thin request handlers
│   ├── routes/        # Express routers
│   ├── middleware/    # auth, validation, error handling
│   ├── services/      # business logic + SQL queries
│   ├── database/       # db.js pool, schema.sql
│   ├── utils/          # ApiError, response helpers
│   ├── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # ExpenseForm, ExpenseTable, BudgetCard, Sidebar, ...
        ├── pages/       # Login, Dashboard, Expenses, Budgets, Recurring, Insights, Profile
        ├── layouts/     # AppLayout
        ├── services/    # api.js + one file per resource
        ├── context/     # AuthContext, ToastContext
        └── utils/       # constants, formatting helpers
```

## Installation & setup

### 1. Database

Install MySQL locally if you don't have it, then:

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates the `smartspend` database and all four tables.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set DB_PASSWORD to your MySQL root password, and set JWT_SECRET to any long random string
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env already points VITE_API_URL at http://localhost:5000/api — change it if your backend runs elsewhere
npm run dev
```

The app runs at `http://localhost:5173`. Register a new account and start adding expenses.

### Environment variables

**backend/.env**
| Variable | Purpose |
|---|---|
| `PORT` | Express port (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signing secret for JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_ORIGIN` | Allowed CORS origin (frontend URL) |

**frontend/.env**
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Security notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored or returned in plaintext
- All SQL is parameterized (`mysql2` placeholders) — no string-concatenated queries anywhere, so it's not vulnerable to SQL injection
- JWT is verified on every protected route; `user_id` for data access always comes from the token, never from the client-supplied body
- `.env` files are gitignored; `.env.example` documents required variables without real secrets

## Testing checklist

**Auth** — register, login, invalid login, logout, hitting a protected route without a token
**Expenses** — add, edit, delete, search by description, filter by category/payment method/date range/amount range, sort by date and amount
**Budgets** — create, update, delete, verify percent-used and the 80%+ warning
**Security** — call `/api/expenses` with no token (expect 401), try to fetch/edit another user's expense id (expect 404, not someone else's data)
**Dashboard** — totals match a manual sum of seeded expenses, monthly and category breakdowns add up correctly

## Future improvements

- CSV export of expenses
- Multi-currency support
- Server-side pagination for very large expense histories
- Email reminders for upcoming recurring expenses
- Editable profile (name/password change)
