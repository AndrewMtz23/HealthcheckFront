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
- Manage users, sources, topics and source reports through the administrative panel; inspect news, activity, model records and notification records. Legacy training/scraping pages remain in source but are not linked in the new sidebar; they are blocked in the local diagnostic runtime.

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
| Personal preferences, topics and notifications | `http://localhost:4000/api/auth/profile/*` |
| Administrative users | `http://localhost:4000/api/auth/admin/users` |
| Other administrative modules | `http://localhost:3003/api/admin/*` |
| Legacy notification clients (not used by the current profile) | `http://localhost:3004/api` |
| Verification and chat | `http://localhost:4000/api` |
| ML administration | `http://localhost:5000/api` |

Current local profile and administrative clients default to the gateway for Auth and directly to news for content. `NEXT_PUBLIC_API_URL=http://localhost:4000/api` is used by the local setup; `NEXT_PUBLIC_NEWS_API_URL` configures the administrative news client. Some legacy clients still share the general override or hardcode service URLs: inspect each consumer before changing these variables for deployment. The current profile uses `profileService.ts`, not the legacy preferences/notification clients.

Before deploying, review the API clients and administration pages and configure their destinations for your environment. Configure backend CORS and OAuth redirect URLs to match the frontend address. Keep credentials out of the repository; variables prefixed with `NEXT_PUBLIC_` are visible to browser clients.

## Build commands

```bash
npm run build
npm start
```

`npm run build` creates the Next.js production build; `npm start` serves it. The production build was validated on 2026-10-06 (21/21 pages); the frontend test suite passed 13/13. Existing non-blocking lint warnings remain. Browser visual and end-to-end interaction verification is still pending.

## Informational pages

`/about`, `/terms`, `/privacy`, and `/contact` compose their sections from
`src/components/<route>/<route>Hero.tsx`, `<route>Content.tsx`, and `<route>CTA.tsx`.
Shared presentation lives in `src/components/info`.

Set `HEALTHCHECK_CONTACT_EMAIL` to the public support address before building
to enable the email link on `/contact`. Without it, the page explains that
direct contact is unavailable and points to the existing source reporting flow.
There is no contact submission API or simulated delivery confirmation.

Terms and privacy content are explicitly preliminary. Complete the service
operator details, retention periods, processors, and privacy request channel,
and review the copy before using it as a definitive legal notice.

## Repository maintenance

Commit source files and `package-lock.json`. The `.gitignore` excludes local environment files, dependencies, Next.js output, logs, and editor settings. Safe `.env.example` files may be tracked.

This repository starts with a single initial commit containing the current frontend, including consultation history changes. Previous Git history is not imported. The original project copy is retained separately.

## Current interface and roles

- `/admin/dashboard` and `/admin/[section]`: active administrators only. The shared shell includes the real logo, collapsible desktop sidebar, mobile navigation and AdminFooter.
- `/profile`: image by URL, editable name/phone, notification preferences, selected topics and notification history. The server owns validation and record ownership checks.
- `admin` and `usuario` are the only roles; active/inactive is an account status. Dashboard appears in the administrator account menu.
- Navbar centers desktop links and groups about/contact/privacy/terms under More.
- Home keeps HeroSection, HealthResources, NewsVerifier, NewsFeed, InformedDecisions and HomeGuide. Do not replace existing sections when adding new ones.
- Shared color tokens live in `src/app/globals.css`; admin/profile/auth styles consume them. Blue is the brand; green/amber/red express states; gray means inactive/unclassified.
- Home photographs are local assets. Pexels IDs 5215008 (Antoni Shkraba), 4266936 (Cedric Fauntleroy), 7088834 (MART PRODUCTION); original source links are recorded in the local Docs/Admin/home-fotografias.md. `doctors.png` remains the hero image.

## Published feature branch

`feat/admin-profile-home` was pushed with six feature commits on 2026-10-06; last verified remote commit: `8020f03`. No merge or PR was performed in that session. Documentation edits are local only and must not be included in a future push without explicit authorization.


## Actualización local — 2026-10-07

Dashboard personal disponible en `/dashboard` y seis módulos. El login de usuario y el menú Mi espacio apuntan al dashboard; admin conserva `/admin/dashboard`. News e historial usan `NEXT_PUBLIC_NEWS_API_URL` (por defecto `http://localhost:3003/api`), configurada antes del build. Nuevas preferencias solo por correo; históricos SMS conservados. Detalles en `../Docs/User/verificacion.md` (local).
