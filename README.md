# Falcon Tiers

Falcon Tiers is a Next.js PvP ranking platform with public rankings and an admin panel.

## Production Requirements

Set these environment variables in your deployment platform:

- `DATABASE_URL` (Prisma database connection)
- `JWT_SECRET` (at least 32 characters, random)
- `ADMIN_USERNAME` (optional fallback admin user)
- `ADMIN_PASSWORD` (optional fallback admin password)
- `NODE_ENV=production`

Notes:

- In production, weak/default admin fallback credentials are blocked.
- Authentication endpoints are rate-limited.
- Build step runs `prisma generate` automatically.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill values.

3. Run Prisma migrations:

```bash
npx prisma migrate deploy
```

4. Start dev server:

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## License

This project is proprietary. See `LICENSE`.
