# Agent Workflow Documentation

This document serves as a comprehensive log of interactions with AI agents, including the prompts provided and the corresponding outputs generated. It facilitates tracking, review, and improvement of agent-assisted development processes.

## Overview

- **Project**: FuelEU-Maritime
- **Date Created**: November 6, 2025
- **Purpose**: Track AI agent interactions for code generation and project development

## Agent Interactions

### Interaction 1: .gitignore File Generation

**Date**: November 7, 2025  
**Agent**: GitHub Copilot - GPT-5 mini
**Task**: Generate a comprehensive `.gitignore` file for a Node.js + TypeScript + Prisma + Express backend project using hexagonal architecture.

**Prompt**:
```
Generate a .gitignore file for a Node.js + TypeScript + Prisma + Express backend project using hexagonal architecture.
```

**Output**:

```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment variables
.env
.env.*
!.env.example

# Build output
/dist
/build

# Prisma
/prisma/migrations/
/prisma/*.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Coverage
coverage/
.nyc_output

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.cache/
.tmp/
.temp/

# Optional eslint cache
.eslintcache

# Optional REPL history
w
```
### Interaction 2: Domain interfaces — assistant provided, user refactor

**Date**: November 8, 2025  
**Agent**: GitHub Copilot - GPT-5 mini  
**Task**: Provide TypeScript domain interfaces and Prisma models for the project.

**Prompt**:
```
I’m setting up the backend for my Fuel EU Maritime project using TypeScript, Prisma, and PostgreSQL.

I need you to generate a Prisma `schema.prisma` file and also define corresponding TypeScript interfaces for each model that I can use in my `core/domain` layer (since this project follows Hexagonal Architecture).

Here’s the database structure I want:

**Tables and columns**

1. routes → stores base route information
   - id (Int, @id, @default(autoincrement()))
   - route_id (String, unique)
   - vesselType (String)
   - fuelType (String)
   - year (Int)
   - ghg_intensity (Float)
   - fuelConsumption (Float)
   - distance (Float)
   - totalEmissions (Float)
   - is_baseline (Boolean, default false)

2. ship_compliance → stores computed compliance balance (CB) data
   - id (Int, @id, @default(autoincrement()))
   - ship_id (String)
   - year (Int)
   - cb_gco2eq (Float)

3. bank_entries → stores banked or applied CB records
   - id (Int, @id, @default(autoincrement()))
   - ship_id (String)
   - year (Int)
   - amount_gco2eq (Float)

4. pools → acts as a pool registry
   - id (Int, @id, @default(autoincrement()))
   - year (Int)
   - created_at (DateTime, @default(now()))

5. pool_members → stores each ship’s allocation in a pool
   - id (Int, @id, @default(autoincrement()))
   - pool_id (Int)
   - ship_id (String)
   - cb_before (Float)
   - cb_after (Float)

**Relationships**
- `ship_compliance.ship_id` → `routes.route_id`
- `bank_entries.ship_id` → `routes.route_id`
- `pool_members.pool_id` → `pools.id`

Use Prisma’s `@relation` syntax and proper `@@map` annotations for table names.  
The datasource is PostgreSQL and the client should be Prisma Client JS.
```

**Assistant Output**: It generated a single file `backend/src/core/domain/models.ts` containing all domain interfaces in one place. Created `schema.prisma`
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     
  directUrl = env("DIRECT_URL")
}

model Route {
  id              Int               @id @default(autoincrement())
  route_id        String            @unique
  vesselType      String
  fuelType        String
  year            Int
  ghg_intensity   Float
  fuelConsumption Float
  distance        Float
  totalEmissions  Float
  is_baseline     Boolean           @default(false)

  // Back-relations
  shipCompliances ShipCompliance[]  
  bankEntries     BankEntry[]      

  @@map("routes")
}

model ShipCompliance {
  id        Int     @id @default(autoincrement())
  ship_id   String
  year      Int
  cb_gco2eq Float

  // Relation to Route via Route.route_id (which is unique)
  route Route @relation(fields: [ship_id], references: [route_id])

  @@map("ship_compliance")
}

model BankEntry {
  id            Int     @id @default(autoincrement())
  ship_id       String
  year          Int
  amount_gco2eq Float

  // Relation to Route via Route.route_id
  route Route @relation(fields: [ship_id], references: [route_id])

  @@map("bank_entries")
}

model Pool {
  id         Int          @id @default(autoincrement())
  year       Int
  created_at DateTime     @default(now())

  // members relation
  members    PoolMember[]

  @@map("pools")
}

model PoolMember {
  id       Int     @id @default(autoincrement())
  pool_id  Int
  ship_id  String
  cb_before Float
  cb_after  Float

  // Relation to Pool
  pool Pool @relation(fields: [pool_id], references: [id])

  @@map("pool_members")
}

```
```typescript
export interface Route {
  id: number;
  routeId: string; // maps to prisma `route_id`
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // maps to prisma `ghg_intensity`
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean; // maps to prisma `is_baseline`

  // Optional relations (may be omitted in domain DTOs)
  shipCompliances?: ShipCompliance[];
  bankEntries?: BankEntry[];
}

export interface ShipCompliance {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  cbGco2eq: number; // maps to prisma `cb_gco2eq`

  // Optional relation
  route?: Route;
}

export interface BankEntry {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  amountGco2eq: number; // maps to prisma `amount_gco2eq`

  // Optional relation
  route?: Route;
}

export interface Pool {
  id: number;
  year: number;
  createdAt: Date; // maps to prisma `created_at`

  members?: PoolMember[];
}

export interface PoolMember {
  id: number;
  poolId: number; // maps to prisma `pool_id`
  shipId: string; // maps to prisma `ship_id`
  cbBefore: number; // maps to prisma `cb_before`
  cbAfter: number; // maps to prisma `cb_after`

  // Optional relation
  pool?: Pool;
}
```

**My changes (refactor)**: I split the single `models.ts` into multiple per-model files under `backend/src/core/domain/`. Added direct and database url for efficient database generation in `prisma.schema` and similar changes in `prisma.config.ts` file. The new files and their current contents are recorded below (as read from the workspace):

- `prisma.schema`
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     
  directUrl = env("DIRECT_URL")
}
```

- `backend/src/core/domain/BankEntry.ts`

```typescript
import type { Route } from "./Route";

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;

  // Optional relation
  route?: Route;
}
```

- `backend/src/core/domain/Pool.ts`

```typescript
import type { PoolMember } from "./PoolMember";
export interface Pool {
  id: number;
  year: number;
  createdAt: Date;

  members?: PoolMember[];
}
```

- `backend/src/core/domain/PoolMember.ts`

```typescript
import type { Pool } from "./Pool";

export interface PoolMember {
  id: number;
  poolId: number;
  shipId: string;
  cbBefore: number; 
  cbAfter: number; 
  
  // Optional relation
  pool?: Pool;
}
```

- `backend/src/core/domain/Route.ts`

```typescript
import type { ShipCompliance, BankEntry } from "./index"

export interface Route {
  id: number;
  routeId: string; // maps to prisma `route_id`
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // maps to prisma `ghg_intensity`
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean; // maps to prisma `is_baseline`

  // Optional relations (may be omitted in domain DTOs)
  shipCompliances?: ShipCompliance[];
  bankEntries?: BankEntry[];
}
```

- `backend/src/core/domain/ShipCompliance.ts`

```typescript
import type { Route } from "./Route";

export interface ShipCompliance {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  cbGco2eq: number;

  // Optional relation
  route?: Route;
}
```

- `backend/src/core/domain/index.ts` (barrel)

```typescript
export * from "./Route";
export * from "./ShipCompliance";
export * from "./BankEntry";
export * from "./Pool";
export * from "./PoolMember";
```

**Notes about the refactor**:

- The per-file approach improves modularity and makes imports cleaner in other parts of the codebase. Each model file imports just the types it needs (or the barrel `index.ts` when appropriate).
- All interfaces retain the same field names and mapping intent.

---

### Interaction 3: Express API Routes with CORS Issues

**Date**: November 7, 2025  
**Agent**: Cursor Agent  
**Task**: Create Express routes for routes, banking, and pooling endpoints.

**Prompt**:
```
Create Express routes for:
1. GET /routes - fetch all routes
2. POST /routes/baseline - set baseline route
3. GET /routes/comparison - compare routes against baseline
4. GET /banking/cb/:year - get compliance balances
5. POST /banking/bank - bank surplus CB
6. POST /banking/apply - apply banked CB
7. GET /pooling/adjusted/:year - get adjusted CB
8. POST /pooling/create - create pooling agreement

Use hexagonal architecture with controllers in adapters/ and repository pattern in infrastructure/db/
```

**Generated Output**:
```typescript
// backend/src/adapters/routeController.ts
export const getRoutes = async (req: Request, res: Response) => {
  const routes = await routeRepository.findAll();
  res.json(routes);
};

export const setBaseline = async (req: Request, res: Response) => {
  const { route_id } = req.body;
  await routeRepository.setBaseline(route_id);
  res.json({ message: "Baseline set successfully" });
};
```

**Issues & My Corrections**:

1. **Issue**: No CORS middleware configured
   ```typescript
   // Agent didn't include CORS
   const app = express();
   app.use(express.json());
   ```
   **My Correction**:
   ```typescript
   import cors from 'cors';
   
   const app = express();
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   app.use(express.json());
   ```

2. **Issue**: Missing error handling in controllers
   ```typescript
   // Agent's code
   export const getRoutes = async (req: Request, res: Response) => {
     const routes = await routeRepository.findAll();
     res.json(routes);
   };
   ```
   **My Correction**:
   ```typescript
   export const getRoutes = async (req: Request, res: Response) => {
     try {
       const routes = await routeRepository.findAll();
       res.json(routes);
     } catch (error) {
       console.error('Error fetching routes:', error);
       res.status(500).json({ error: 'Failed to fetch routes' });
     }
   };
   ```

3. **Issue**: Inconsistent field naming (snake_case vs camelCase)
   ```typescript
   // Agent used database field names directly
   const { route_id } = req.body;
   ```
   **My Correction**:
   ```typescript
   // Use camelCase in API, map to snake_case in repository
   const { routeId } = req.body;
   await routeRepository.setBaseline(routeId); // Repository handles mapping
   ```

---

### Interaction 4: React Frontend Tab Components with Tailwind v4 Issues

**Date**: November 8, 2025  
**Agent**: Claude Code  
**Task**: Create CompareTab, BankingTab, and PoolingTab components.

**Prompt**:
```
Create a CompareTab component that:
1. Fetches comparison data from /routes/comparison
2. Displays a bar chart using recharts
3. Shows a table with baseline vs route intensity
4. Includes refresh button and loading states
Use Tailwind CSS for styling with gradient backgrounds
```

**Generated Output**:
```tsx
// frontend/src/adapters/ui/CompareTab.tsx
export const CompareTab: React.FC = () => {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  
  useEffect(() => {
    fetchComparisonData();
  }, []);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      {/* Component content */}
    </div>
  );
};
```

**Issues & My Corrections**:

1. **Issue**: Used Tailwind v3 gradient syntax instead of v4
   ```tsx
   // Agent's code (Tailwind v3)
   <div className="bg-gradient-to-r from-blue-500 to-purple-600">
   ```
   **My Correction** (Tailwind v4):
   ```tsx
   <div className="bg-linear-to-r from-blue-500 to-purple-600">
   ```

2. **Issue**: Wrong API endpoint URL
   ```typescript
   // Agent used wrong port
   const API_BASE = 'http://localhost:3001';
   ```
   **My Correction**:
   ```typescript
   const API_BASE = 'http://localhost:3000';
   ```

3. **Issue**: Component didn't refetch data when tab becomes active (stale data)
   ```tsx
   // Agent's initial implementation
   useEffect(() => {
     fetchComparisonData();
   }, []); // Only fetches on mount
   ```
   **My Correction**:
   ```tsx
   interface CompareTabProps {
     isActive: boolean;
   }

   export const CompareTab: React.FC<CompareTabProps> = ({ isActive }) => {
     useEffect(() => {
       fetchComparisonData();
     }, []);

     // Refetch when tab becomes active
     useEffect(() => {
       if (isActive && comparisons.length > 0) {
         handleRefresh();
       }
     }, [isActive]);
   };
   ```

---

### Interaction 5: Tab State Management Bug

**Date**: November 8, 2025  
**Agent**: GitHub Copilot  
**Task**: Fix tab switching causing page reloads and stale data.

**Problem**: When switching tabs, components remounted causing loading screens. When baseline changed in Routes tab, Compare tab showed stale data until page reload.

**Agent's Initial Solution**:
```tsx
// App.tsx - Conditional rendering
<main className="max-w-7xl mx-auto">
  {activeTab === 'routes' && <RoutesTab />}
  {activeTab === 'compare' && <CompareTab />}
  {activeTab === 'banking' && <BankingTab />}
  {activeTab === 'pooling' && <PoolingTab />}
</main>
```

**Issue**: This remounts components on every tab switch, losing state and triggering loading screens.

**My Correction**:
```tsx
// App.tsx - CSS display toggling
<main className="max-w-7xl mx-auto">
  <div style={{ display: activeTab === 'routes' ? 'block' : 'none' }}>
    <RoutesTab isActive={activeTab === 'routes'} />
  </div>
  <div style={{ display: activeTab === 'compare' ? 'block' : 'none' }}>
    <CompareTab isActive={activeTab === 'compare'} />
  </div>
  <div style={{ display: activeTab === 'banking' ? 'block' : 'none' }}>
    <BankingTab isActive={activeTab === 'banking'} />
  </div>
  <div style={{ display: activeTab === 'pooling' ? 'block' : 'none' }}>
    <PoolingTab isActive={activeTab === 'pooling'} />
  </div>
</main>
```

**Result**: Components stay mounted (preserve state), but refresh data when tab becomes visible. No loading screens, fresh data guaranteed.

---

### Interaction 6: Prisma Repository Field Mapping Errors

**Date**: November 7, 2025  
**Agent**: ChatGPT (GPT-5)  
**Task**: Create Prisma repository with proper field mapping.

**Prompt**:
```
Create a Prisma repository for Routes that maps database fields to domain interfaces.
Database fields: route_id, ghg_intensity, is_baseline
Domain fields: routeId, ghgIntensity, isBaseline
```

**Generated Output**:
```typescript
// backend/src/infrastructure/db/RouteRepository.ts
async findAll(): Promise<Route[]> {
  const routes = await prisma.route.findMany();
  return routes.map(r => ({
    id: r.id,
    routeId: r.route_id,
    vesselType: r.vesselType,
    fuelType: r.fuelType,
    year: r.year,
    ghgIntensity: r.ghg_intensity, // ✓ Correct
    fuelConsumption: r.fuelConsumption,
    distance: r.distance,
    totalEmissions: r.totalEmissions,
    isBaseline: r.is_baseline // ✓ Correct
  }));
}

async setBaseline(route_id: string): Promise<void> {
  await prisma.route.updateMany({
    where: { is_baseline: true },
    data: { is_baseline: false }
  });
  await prisma.route.update({
    where: { route_id },
    data: { is_baseline: true } // Issue: Missing camelCase mapping
  });
}
```

**Issue**: Inconsistent mapping in `setBaseline` method - used snake_case in queries instead of letting Prisma handle it.

**My Correction**:
```typescript
async setBaseline(routeId: string): Promise<void> {
  // First, unset all baselines
  await prisma.route.updateMany({
    where: { is_baseline: true },
    data: { is_baseline: false }
  });
  
  // Then set the new baseline
  await prisma.route.update({
    where: { route_id: routeId },
    data: { is_baseline: true }
  });
}
```

I also manually verified all 15+ field mappings across all repository methods (RouteRepository, BankingRepository, PoolingRepository) to ensure consistency.

---

### Interaction 7: .gitignore Incomplete Generation

**Date**: November 7, 2025  
**Agent**: GitHub Copilot  
**Task**: Generate comprehensive .gitignore file.

**Generated Output** (last few lines):
```gitignore
# Optional eslint cache
.eslintcache

# Optional REPL history
w
```

**Issue**: The last line was incomplete (`w` instead of `.node_repl_history`)

**My Correction**:
```gitignore
# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Vite cache (added)
.vite/
```

I also added `.vite/` which was causing 40MB+ of build cache to be tracked in git.

---

### Interaction 8: Tab Button Form Submission Bug

**Date**: November 8, 2025  
**Agent**: Cursor Agent  
**Task**: Debug tab buttons causing page reload.

**Problem**: Clicking tab navigation buttons caused page to reload.

**Agent's Diagnosis**: Suggested checking for form submission or `href="#"` attributes.

**My Investigation & Fix**:
```tsx
// Original code (implicit type)
<button
  onClick={() => setActiveTab('routes')}
  className={/* styles */}
>
  Routes
</button>
```

**Issue**: When button is inside a form context (even implicit), clicking it triggers form submission.

**My Correction**:
```tsx
<button
  type="button"  // Explicitly prevent form submission
  onClick={() => setActiveTab('routes')}
  className={/* styles */}
>
  Routes
</button>
```

Applied to all 4 tab buttons (Routes, Compare, Banking, Pooling).

---

*This document will be updated as more agent and user interactions occur. For traceability, include a short description of why structural changes were made when you refactor files.*