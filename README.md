# Kindergarten Frontend (React + Vite)

## Folder Structure

```
kindergarten-frontend/
├── src/
│   ├── api/                 # Axios client + API services
│   ├── components/
│   │   └── layout/          # Public, Admin layouts
│   ├── pages/
│   │   ├── public/          # Website pages
│   │   ├── admin/           # ERP admin portal
│   │   ├── teacher/         # Teacher portal
│   │   └── auth/            # Login
│   ├── routes/              # Protected route guards
│   ├── store/               # Redux Toolkit slices
│   └── utils/
├── .env.development
├── .env.staging
└── .env.production
```

## Redux Structure

```
store/
├── index.ts          # configureStore
├── hooks.ts          # typed useAppDispatch/Selector
└── slices/
    ├── authSlice.ts  # user, token, roles
    └── uiSlice.ts    # darkMode, sidebar
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run build:staging` | Staging build |
| `npm run build:production` | Production build |

## Portals

- `/` — Public website
- `/login` — Portal login
- `/admin/*` — Admin ERP (super_admin, admin, principal)
- `/teacher/*` — Teacher portal
- `/parent/*` — Parent portal
