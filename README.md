# HealthCheck Frontend

**A web interface for health news analysis, article discovery, and personalized notifications.**

HealthCheck Frontend is built with Next.js, React, and TypeScript. It connects to the [HealthCheck Backend](https://github.com/AndrewMtz23/HealthcheckBack) to submit news for analysis, browse articles, manage accounts, and review consultation history.

## Features

- Submit news text or links for analysis.
- Browse, search, and interact with health news articles.
- Register, sign in, and manage a user profile.
- Review and clear consultation history.
- Manage notification preferences.
- Use a chatbot to investigate news.
- Access an administrative panel to manage users, sources, topics, reports, news, and activity records.
- Access a personalized dashboard with user-specific features.

## Technology

| Area | Libraries |
| --- | --- |
| Application | Next.js 15.2.3, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Motion and graphics | Framer Motion, Three.js, React Three Fiber, Drei |
| Icons | Lucide React |
| API requests | Axios and browser fetch |

## Project Structure

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

## Local Development

Install Node.js and npm, then clone the repository:

```bash
git clone https://github.com/AndrewMtz23/HealthcheckFront.git
cd HealthcheckFront
npm ci
npm run dev
```

Open `http://localhost:3000`.

Start and configure the backend services separately. The frontend does not include the database, model weights, or server processes.

### Backend Connections

The application communicates with several backend services for authentication, news management, verification, notifications, and administration.

| Feature | Default local destination |
| --- | --- |
| Authentication | `http://localhost:3001/api` |
| News and consultation history | `http://localhost:3003/api` |
| Personal preferences and notifications | `http://localhost:4000/api/auth/profile/*` |
| Administrative users | `http://localhost:4000/api/auth/admin/users` |
| Other administrative modules | `http://localhost:3003/api/admin/*` |
| Legacy notification clients | `http://localhost:3004/api` |
| Verification and chat | `http://localhost:4000/api` |
| ML administration | `http://localhost:5000/api` |

The current local environment uses `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_NEWS_API_URL` for configurable API connections.

Some legacy clients may use direct service URLs. Review API configurations before deploying.

Configure backend CORS and OAuth redirect URLs to match the frontend address. Never store credentials in the repository, as variables prefixed with `NEXT_PUBLIC_` are accessible to browser clients.

## Build Commands

```bash
npm run build
npm start
```

`npm run build` generates the production build, while `npm start` serves the application.

## Informational Pages

The application includes the following informational pages:

- `/about` — Project information.
- `/terms` — Terms of service.
- `/privacy` — Privacy information.
- `/contact` — Contact information.

These pages use reusable components located in `src/components/` and shared presentation elements in `src/components/info`.

Set `HEALTHCHECK_CONTACT_EMAIL` to configure the public contact address before building.

The terms and privacy content are preliminary and require review before production use.

## Authors

This project was developed collaboratively by:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/AndrewMtz23">
        <img src="https://wsrv.nl/?url=github.com/AndrewMtz23.png&w=120&h=120&fit=cover&mask=circle" width="40" height="40" alt="AndrewMtz23" />
        <br />
        <b>AndrewMtz23</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/zudno">
        <img src="https://wsrv.nl/?url=github.com/zudno.png&w=120&h=120&fit=cover&mask=circle" width="40" height="40" alt="zudno" />
        <br />
        <b>zudno</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/UrielSC24">
        <img src="https://wsrv.nl/?url=github.com/UrielSC24.png&w=120&h=120&fit=cover&mask=circle" width="40" height="40" alt="UrielSC24" />
        <br />
        <b>UrielSC24</b>
      </a>
    </td>
  </tr>
</table>
  
**Repository:** [HealthCheck Frontend](https://github.com/AndrewMtz23/HealthcheckFront)

**Backend:** [HealthCheck Backend](https://github.com/AndrewMtz23/HealthcheckBack)
