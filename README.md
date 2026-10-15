# pest

React + TypeScript frontend for Pest onboarding. Vite, Ant Design, React Query, Axios, and Zustand — the same stack as Proposalist.

## Getting started

The API in `pest_api` needs to be running on port 3000.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Dev login (seeded by the API):

* Email: `admin@example.com`
* Password: `pass123!!!`

## Project structure

```
src/
├── api/          # Axios clients
├── components/   # Layout and route guards
├── config/       # Routes and env
├── hooks/        # React Query hooks
├── pages/        # Login, reps, and documents
├── stores/       # Zustand session store
├── styles/
├── typings/
└── utils/
```

`npm run dev:local-api` proxies `/api` to the Rails server, matching the Proposalist local-api mode.
