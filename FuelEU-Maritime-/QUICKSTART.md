# 🚀 Quick Start Guide

## Start the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
✅ Server running on: **http://localhost:3000**

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
✅ Frontend running on: **http://localhost:5174**

---

## 🎯 Access the Routes Tab

Open your browser and navigate to:
```
http://localhost:5174
```

You should see:
- **Header**: "Fuel EU Maritime Dashboard"
- **Routes Tab**: Table with all routes from database
- **Filters**: Three dropdowns (Vessel Type, Fuel Type, Year)
- **Set Baseline**: Button on each row

---

## 🧪 Test the Features

### 1. View Routes
- Routes automatically load on page load
- See all 8 columns of data
- Baseline route has green border

### 2. Filter Routes
- Select vessel type (e.g., "Cargo")
- Select fuel type (e.g., "HFO")
- Select year (e.g., "2025")
- Table updates in real-time

### 3. Set Baseline
- Click "Set Baseline" button on any non-baseline route
- See loading spinner
- Success toast appears
- Table refreshes
- Green border moves to new baseline

---

## 📁 Project Structure

```
feulEU/
├── backend/          # Backend API (Node.js + Express + Prisma)
│   └── src/
│       ├── core/
│       ├── adapters/
│       └── infrastructure/
│
└── frontend/         # Frontend (React + TypeScript + Vite)
    └── src/
        ├── core/
        │   ├── domain/       # Route.ts (domain types)
        │   ├── application/  # (use cases - empty for now)
        │   └── ports/        # (interfaces - empty for now)
        ├── adapters/
        │   ├── infrastructure/  # routesApi.ts (API client)
        │   └── ui/             # RoutesTab.tsx (component)
        └── shared/             # (common utilities)
```

---

## 🎨 Hexagonal Architecture

```
┌─────────────────────────────────────┐
│         UI Layer (React)            │
│     RoutesTab.tsx (inbound)         │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      Application Layer              │
│   (Business logic - future)         │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│        Domain Layer                 │
│    Route.ts (pure data)             │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│  routesApi.ts (outbound)            │
└──────────────┬──────────────────────┘
               │
               ↓
      Backend API (HTTP)
```

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5174
- [ ] No console errors in browser
- [ ] Routes table loads with data
- [ ] Filters work correctly
- [ ] Set baseline button functions
- [ ] Toast notifications appear
- [ ] Page is responsive on mobile

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5174
npx kill-port 5174

# Restart frontend
npm run dev
```

### Backend Not Running
```bash
# Check backend is running
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

### Routes Not Loading
1. Check browser console for errors
2. Verify backend is running
3. Check network tab for failed requests
4. Ensure database has route data

### CORS Errors
Add to backend `server/index.ts`:
```typescript
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5174' }));
```

---

## 📚 Useful Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript
npm test         # Run tests (if configured)
```

---

## 🎯 What's Next?

Now that Routes Tab is working, you can:

1. **Test all features thoroughly**
2. **Implement Compare Tab** (next priority)
3. **Implement Banking Tab**
4. **Implement Pooling Tab**
5. **Add navigation between tabs**
6. **Implement use cases in application layer**
7. **Add error boundaries**
8. **Add loading skeletons**
9. **Implement caching**
10. **Add unit tests**

---

## 💡 Pro Tips

### Development Workflow
1. Keep both terminals open (backend + frontend)
2. Changes auto-reload with HMR
3. Check browser console for errors
4. Use React DevTools for debugging

### Code Quality
- Types are your friend - use them!
- Follow hexagonal architecture patterns
- Keep components small and focused
- Test edge cases (empty data, errors, etc.)

### Performance
- Memoize expensive calculations
- Use React.memo for pure components
- Lazy load routes for better code splitting
- Optimize images in assets folder

---

**Happy Coding! 🚀**
