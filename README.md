# Bramble & Bowl — Meal Subscription API

A full-stack meal subscription platform where users can register, manage delivery addresses, subscribe to weekly meal plans, track upcoming deliveries, and leave reviews on meals. Built as a DBMS course project.

## Features

- **Authentication** — JWT-based register/login, session persisted in the browser
- **Menu plans** — browse weekly meal plans and subscribe to one
- **Meals & reviews** — browse individual meals, read and leave star ratings/comments
- **Subscriptions** — view active subscriptions, pause/resume/cancel, see delivery schedule and payment history
- **Address management** — add, remove, and set a default delivery address

## Tech Stack

- **Backend:** Node.js, Express.js (run with `nodemon` in dev, entry point `src/server.js`)
- **Database:** PostgreSQL 18
- **Auth:** JSON Web Tokens (JWT)
- **Frontend:** Single-page vanilla HTML/CSS/JavaScript (`meal-subscription-frontend.html`) — no framework, no build step, no dependencies. Talks to the API directly via `fetch`.

## Database

Schema and seed data are defined in `schema.sql` and `seed.sql`. Core tables:

| Table | Purpose |
|-------|---------|
| `users` | Registered accounts |
| `addresses` | Delivery addresses per user, with a default flag |
| `meal_plans` | Subscription plans (e.g. Veg Weekly Basic) |
| `meals` | Individual meal items |
| `plan_meals` | Mapping of meals to plans |
| `subscriptions` | A user's active/past plan subscriptions |
| `payments` | Payment record created per subscription |
| `deliveries` | Scheduled meal deliveries per subscription |
| `reviews` | User ratings/comments on meals |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/plans` | List meal plans |
| GET | `/api/meals` | List meals |
| GET | `/api/meals/:id/reviews` | Get all reviews for a meal |
| POST | `/api/reviews` | Submit a review for a meal |
| GET | `/api/addresses` | List the logged-in user's addresses |
| POST | `/api/addresses` | Add a delivery address |
| DELETE | `/api/addresses/:id` | Remove a delivery address |
| GET | `/api/subscriptions` | List the logged-in user's subscriptions |
| GET | `/api/subscriptions/:id` | Get subscription detail (plan, deliveries, payments) |
| POST | `/api/subscriptions` | Create a subscription to a meal plan |
| PATCH | `/api/subscriptions/:id/status` | Update subscription status (active/paused/cancelled) |
| GET | `/api/deliveries/upcoming` | Get upcoming scheduled deliveries |

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL 18

### Backend Setup

```bash
git clone https://github.com/<your-username>/meal-subscription-api.git
cd meal-subscription-api
npm install
```

Create the database and load the schema/seed data:

```bash
createdb -U postgres meal_subscription
psql -U postgres -d meal_subscription -f schema.sql
psql -U postgres -d meal_subscription -f seed.sql
```

Copy the example env file and fill in your own values:

```bash
copy .env.example .env
```

```env
PORT=4000
DATABASE_URL=postgres://postgres:<password>@localhost:5432/meal_subscription
JWT_SECRET=<your_secret_key>
```

Run the server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### Frontend Setup

The frontend is a single static file — no install step needed.

1. Make sure the backend is running on `http://localhost:4000` (the frontend calls this URL directly).
2. Open `meal-subscription-frontend.html` in a browser (double-click it, or serve it with any static file server).
3. Register or sign in, then browse plans, subscribe, manage addresses, and leave reviews.


## License

This project was built for academic purposes.
