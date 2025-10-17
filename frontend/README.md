# Frontend (Vite + React)

This is a minimal Vite + React frontend in JavaScript.

To install dependencies:

```bash
cd frontend
npm install
```

To run the dev server:

```bash
npm run dev
```

Dev proxy (optional):

Create `frontend/.env` to proxy `/api` to your backend in development:

```
VITE_DEV_API_TARGET=http://localhost:4000
```

Environment:

- By default, API requests are relative to the current origin using `/api`.
- Optionally override with a `.env` entry (Vite):

```
VITE_API_BASE=/api
```

Or point to a full URL if you truly need cross-origin during development:

```
VITE_API_BASE=http://localhost:4000/api
```
