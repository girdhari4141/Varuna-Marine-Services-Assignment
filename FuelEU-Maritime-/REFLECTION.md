# Project Reflection – FuelEU Maritime Compliance Dashboard

## Introduction

This project implements a full-stack compliance dashboard for the **FuelEU Maritime Regulation**, specifically focusing on **Article 20 (Banking)** and **Article 21 (Pooling)** logic. The goal was to build a scalable, maintainable system that allows maritime operators to track route compliance, bank surplus compliance balances, and create pooling agreements across vessels. I chose **Hexagonal Architecture** to enforce clean separation between domain logic and infrastructure, which proved invaluable as the project grew in complexity.

---

## Technical Learning

### 1. **Backend Development**
- **Prisma ORM**: This was my first time working extensively with Prisma, and I learned how powerful declarative schema modeling can be. Understanding migrations, seeding, and the generated Prisma Client helped me appreciate type-safe database access.
- **Hexagonal Architecture**: Implementing ports and adapters forced me to think about dependency inversion and testability from the start. Keeping business logic in the `core/domain` layer independent of Express or Prisma made the codebase much easier to reason about.
- **API Design**: Designing RESTful endpoints (`/routes/comparison`, `/banking/bank`, `/pooling/create`) taught me how to structure responses for different frontend needs while maintaining consistency.

### 2. **Frontend Development**
- **React 19 + TypeScript**: Working with strict typing across components improved my understanding of prop interfaces and state management patterns.
- **Tailwind CSS v4**: Migrating to the new Vite plugin and handling breaking changes (like gradient syntax) taught me to read release notes carefully and adapt quickly.
- **Data Visualization**: Integrating Recharts for comparison bar charts was a great learning experience in presenting complex compliance data visually.
- **State Management**: Implementing the tab refresh mechanism (with `isActive` props) helped me understand the trade-offs between component remounting vs. preserving state with CSS toggling.

### 3. **Full-Stack Coordination**
- **Type Consistency**: Maintaining aligned TypeScript types between backend responses and frontend domain models required discipline but paid off in reduced bugs.
- **CORS Configuration**: Learning to properly configure Express CORS for development and production environments was crucial for frontend-backend communication.

---

## How AI Agents Improved Productivity

Using **GitHub Copilot**, **ChatGPT**, **Cursor**, and **Claude Code** significantly accelerated development:

- **Boilerplate Reduction**: AI tools generated repetitive code like Prisma repository methods, Express route handlers, and React component scaffolding, allowing me to focus on business logic.
- **Problem-Solving**: When stuck on issues (e.g., Prisma schema relationships, Tailwind v4 syntax changes), AI provided quick explanations and working examples.
- **Code Review**: AI suggested improvements like adding proper error handling, optimistic UI updates, and accessibility features I might have overlooked.
- **Documentation**: Tools helped draft API documentation and comments, ensuring the codebase remained readable.

**Estimated Time Saved**: ~30-40% compared to manual development, especially during repetitive tasks and debugging.

---

## Challenges Faced

### 1. **Prisma Schema Design**
Initially, I struggled with modeling relationships between `Route`, `ComplianceBalance`, `BankingTransaction`, and `Pool` entities. Understanding when to use `@relation` fields vs. foreign keys took trial and error. Running migrations and fixing breaking changes taught me to plan schema changes more carefully.

### 2. **Frontend-Backend Naming Consistency**
Keeping naming conventions consistent was challenging. For example, the backend used `complianceBalance` while the frontend initially used `CB`, causing confusion. I learned to establish naming conventions early and stick to them across the stack.

### 3. **Tab State Management**
Implementing tab switching without page reloads while ensuring fresh data was tricky. The initial solution caused unnecessary loading screens; refining it to use `isActive` props and conditional refetching required iterative debugging.

### 4. **CORS and API Integration**
During development, CORS errors were frequent. Understanding preflight requests and configuring `cors()` middleware properly took time but improved my grasp of cross-origin security.

---

## Insights on Using AI Responsibly

1. **AI as a Tool, Not a Replacement**: While AI accelerated development, I still needed to understand *why* suggested code worked. Blindly accepting suggestions led to bugs that required deeper debugging later.

2. **Critical Thinking Remains Essential**: AI occasionally suggested outdated patterns or missed edge cases. I learned to validate suggestions against documentation and best practices.

3. **Ownership of Code Quality**: AI can generate code quickly, but maintaining readability, adding meaningful comments, and ensuring testability are still my responsibility. I made sure to refactor AI-generated code when it didn't align with project standards.

4. **Learning Curve**: Using AI didn't eliminate the need to learn fundamentals. Understanding TypeScript, React hooks, and database design was crucial to effectively prompt AI and evaluate its output.

---

## What Could Be Improved Next Time

1. **Testing from Day One**: I focused heavily on feature development and neglected writing unit and integration tests early. Adding Jest/Vitest and Supertest from the start would have caught bugs earlier and improved confidence in refactoring.

2. **Better Git Workflow**: I worked mostly on feature branches but could have used more granular commits with clearer messages. Adopting conventional commits (e.g., `feat:`, `fix:`, `refactor:`) would improve project history readability.

3. **Environment Configuration**: Managing `.env` files manually was error-prone. Using tools like `dotenv-vault` or better documentation for required environment variables would streamline onboarding.

4. **Accessibility**: While the UI is functional, I didn't focus enough on keyboard navigation, screen reader support, or ARIA labels. Building with accessibility in mind from the start would have been better than retrofitting later.

---

## Conclusion

This project was an excellent opportunity to apply full-stack development skills, learn modern tools like Prisma and Tailwind v4, and experience the benefits and limitations of AI-assisted coding. I gained confidence in architecting scalable applications, coordinating frontend-backend systems, and using AI responsibly as a productivity multiplier. Moving forward, I'll prioritize testing, accessibility, and cleaner Git practices to build even more robust software.

**Tanish Jagetiya**  
B.Tech CSE, NIT Delhi  
November 2025
