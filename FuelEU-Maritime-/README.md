# FuelEU Maritime – Compliance Dashboard

A full-stack web application implementing **FuelEU Maritime Regulation** compliance tracking, focusing on **Article 20 (Banking)** and **Article 21 (Pooling)** logic. The system enables maritime operators to manage route compliance, bank surplus compliance balances, and create pooling agreements across vessels.

Built with **Hexagonal Architecture** for maintainability and clean separation of concerns.

---

## 🚀 Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite 7** (Build tool)
- **Tailwind CSS v4** (Styling)
- **Recharts** (Data visualization)

### Backend
- **Node.js** + **TypeScript**
- **Express.js** (REST API)
- **Prisma ORM**
- **PostgreSQL** (Supabase)

---

## 🏗️ Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** to separate business logic from infrastructure concerns.

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

## 👨‍💻 Contact

**Tanish Jagetiya**  
B.Tech Computer Science & Engineering (3rd Year)  
National Institute of Technology, Delhi  

📧 Email: [tanishjagetiya@gmail.com](mailto:tanishjagetiya@gmail.com)  
🔗 GitHub: [@Tanish196](https://github.com/Tanish196)  
🔗 Repository: [FuelEU-Maritime-](https://github.com/Tanish196/FuelEU-Maritime-)

---

## 📝 License

This project is part of an academic assignment for FuelEU Maritime Regulation implementation.

---

**Built with ❤️ using Hexagonal Architecture**
