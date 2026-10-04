# HealthCheck Frontend

**A web interface for health news analysis, article discovery, and personalized notifications.**

HealthCheck Frontend is built with Next.js, React, and TypeScript. It connects to the [HealthCheck backend](https://github.com/AndrewMtz23/HealthcheckBack) to submit news for analysis, browse articles, manage accounts, and review consultation history.

## Features

- Submit news text or links for analysis.
- Browse, search, and interact with health news articles.
- Register, sign in, and manage a user profile.
- Review and clear consultation history.
- Manage notification preferences.
- Use a chatbot to investigate news.
- Access administration pages for statistics, model training, and content collection.

## Technology

| Area | Libraries |
| --- | --- |
| Application | Next.js 15.2.3, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Motion and graphics | Framer Motion, Three.js, React Three Fiber, Drei |
| Icons | Lucide React |
| API requests | Axios and browser fetch |

## Project structure

```text
src/
├── app/          # Pages, layouts, authentication, and administration
├── components/   # News, account, chat, and layout components
├── context/      # Authentication state
├── hooks/        # Shared interaction logic
├── services/     # Backend API clients
└── types/        # Shared TypeScript definitions
public/           # Static assets
```

## Local development

Install Node.js and npm, then clone the repository:

```bash
git clone https://github.com/AndrewMtz23/HealthcheckFront.git
cd HealthcheckFront
npm ci
npm run dev
```

Open `http://localhost:3000`. Start and configure the backend services separately; the frontend does not include the database, model weights, or server processes.

### Backend connections

The current code uses a mixture of direct service URLs and a shared `NEXT_PUBLIC_API_URL` override.

| Feature | Default local destination |
| --- | --- |
| Authentication | `http://localhost:3001/api` |
| News and consultation history | `http://localhost:3003/api` |
| Notifications and preferences | `http://localhost:3004/api` |
| Verification and chat | `http://localhost:4000/api` |
| ML administration | `http://localhost:5000/api` |

For the existing local setup, leave `NEXT_PUBLIC_API_URL` unset so clients use their individual defaults. Setting it replaces the base URL in multiple clients that otherwise target different services; it does not update every hardcoded URL.

Before deploying, review the API clients and administration pages and configure their destinations for your environment. Configure backend CORS and OAuth redirect URLs to match the frontend address. Keep credentials out of the repository; variables prefixed with `NEXT_PUBLIC_` are visible to browser clients.

## Build commands

```bash
npm run build
npm start
```

`npm run build` creates the Next.js production build; `npm start` serves it. These commands are provided by the project and have not been validated as part of the repository separation.

## Repository maintenance

Commit source files and `package-lock.json`. The `.gitignore` excludes local environment files, dependencies, Next.js output, logs, and editor settings. Safe `.env.example` files may be tracked.

This repository starts with a single initial commit containing the current frontend, including consultation history changes. Previous Git history is not imported. The original project copy is retained separately.
