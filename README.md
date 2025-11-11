# FuelEU Maritime – Compliance Dashboard

A full-stack web application designed to streamline compliance tracking under the FuelEU Maritime Regulation, with a particular focus on Article 20 (Banking) and Article 21 (Pooling). It allows maritime operators to efficiently manage route compliance, bank surplus compliance balances, and establish pooling agreements among vessels.

The system is built using a Hexagonal Architecture, ensuring high maintainability, scalability, and a clear separation of concerns across all layers.

---

🚀 Tech Stack
Frontend

React 19 with TypeScript

Vite 7 for fast builds and development

Tailwind CSS v4 for modern, responsive styling

Recharts for dynamic data visualization

Backend

Node.js with TypeScript

Express.js for building RESTful APIs

Prisma ORM for type-safe database interactions

PostgreSQL (hosted on Supabase) for reliable data storage

🏗️ Architecture

The application is built using a Hexagonal Architecture (Ports & Adapters) pattern, promoting clean separation between core business logic and external infrastructure. This design ensures maintainability, scalability, and ease of testing across both frontend and backend systems.

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/          # Business entities (Route, ComplianceBalance, Pool)
│   │   ├── application/     # Use cases (CreatePool, BankSurplus, etc.)
│   │   └── ports/           # Interfaces for external dependencies
│   ├── adapters/            # Controllers (REST endpoints)
│   ├── infrastructure/
│   │   ├── db/              # Prisma repositories
│   │   └── server/          # Express server setup
│   └── shared/              # Shared utilities
└── prisma/
    └── schema.prisma        # Database schema

frontend/
├── src/
│   ├── core/
│   │   ├── domain/          # TypeScript types (Route, Banking, Pooling)
│   │   ├── application/     # Business logic
│   │   └── ports/           # API interfaces
│   ├── adapters/
│   │   ├── infrastructure/  # API clients (HTTP)
│   │   └── ui/              # React components (RoutesTab, BankingTab, etc.)
│   └── shared/              # Shared utilities
└── index.html
```

**Key Benefits:**
- Domain logic independent of frameworks
- Easy to test and maintain
- Swap infrastructure without affecting business rules

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database (or Supabase account)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/routes` | Fetch all routes with compliance data |
| `POST` | `/routes/baseline` | Set a route as baseline |
| `GET` | `/routes/comparison` | Compare routes against baseline |
| `GET` | `/banking/cb/:year` | Get compliance balances for a year |
| `POST` | `/banking/bank` | Bank surplus compliance balance |
| `POST` | `/banking/apply` | Apply banked balance to deficit |
| `GET` | `/pooling/adjusted/:year` | Get adjusted CB for pooling |
| `POST` | `/pooling/create` | Create a pooling agreement |

---

## 🎨 Features

### 1. Routes Management
- View all maritime routes with GHG intensity metrics
- Set baseline route for comparison
- Filter by vessel type, fuel type, and year

### 2. Compare Tab
- Visual comparison of routes against baseline
- Bar charts showing GHG intensity differences
- Compliance status indicators (compliant/non-compliant)

### 3. Banking Operations (Article 20)
- View compliance balances by year
- Bank surplus CB for future use
- Apply banked CB to cover deficits
- Track borrowed amounts and banking history

### 4. Pooling Operations (Article 21)
- Multi-ship selection for pooling
- Calculate pooled compliance balance
- Create pooling agreements
- View pooling results and distribution

---

## 📚 Documentation

- `AGENT_WORKFLOW.md` – AI agent workflow documentation
- `REFLECTION.md` – Project reflection and learnings
- `TAB_DATA_REFRESH.md` – Technical details on tab state management

---

## college and name
Girdhari Lal Sharma
B.Tech Biomedical Engineering (2026)  
National Institute of Technology, Rourkela 

---

## 📝 License

This project is part of an academic assignment for FuelEU Maritime Regulation implementation.

---

