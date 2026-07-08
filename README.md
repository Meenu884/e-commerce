# Foundry Goods — Full-Stack E-Commerce (React + FastAPI + MongoDB)

A workshop-supply e-commerce demo built for learning full-stack development:
product catalog, cart, mock checkout, user accounts, and an admin panel for
managing products.

```
ecommerce/
├── backend/     FastAPI + MongoDB (Motor async driver)
└── frontend/    React + Vite
```

## 1. Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **MongoDB** running locally, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

If you don't have MongoDB installed locally, the easiest options are:
- macOS: `brew install mongodb-community && brew services start mongodb-community`
- Docker: `docker run -d -p 27017:27017 --name foundry-mongo mongo:7`
- Or sign up for a free Atlas cluster and use its connection string instead of `mongodb://localhost:27017`

## 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then edit .env if needed (Mongo URI, JWT secret, admin login)
```

Seed the database with an admin user and sample products:

```bash
python -m app.seed
```

This prints the admin login it created (defaults to `admin@foundrygoods.test` /
`AdminPass123!` — change these in `.env` before seeding if you want different
credentials).

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

The API is now at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

## 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The site is now at `http://localhost:5173`. It expects the API at
`http://localhost:8000` by default — to point elsewhere, create a
`frontend/.env` with:

```
VITE_API_URL=http://localhost:8000
```

## 4. Try it out

1. Visit `http://localhost:5173` — browse the seeded catalog, search, and filter by category.
2. Register a customer account, add items to your cart, and complete the mock checkout (no real payment is processed).
3. Sign in with the admin account from step 2 to reach `/admin`, where you can create, edit, hide, or delete products, and view all placed orders.

## Notes on this project

- **Checkout is a simulation.** Placing an order decrements stock and creates
  an order record, but no payment processor is involved. That keeps the
  project focused on the full-stack fundamentals (auth, CRUD, state) without
  needing real payment keys.
- **Auth** uses JWT bearer tokens stored in `localStorage` on the frontend.
- **Roles**: every new registration is a `customer`. The only way to get an
  `admin` account in this demo is via the seed script — there's no self-serve
  admin signup, which mirrors how real admin panels are gated.
- Cart data lives server-side per user, so it persists across devices/sessions
  as long as you're logged in.

## Extending it

Natural next steps if you want to keep building: Stripe integration for real
payments, product image uploads (currently just URLs), pagination for large
catalogs, order status transitions (shipped/delivered) in the admin panel, and
email confirmations.
