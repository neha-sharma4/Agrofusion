# AgroFusion AI

AI-powered farmer advisory platform for **crop suitability**, **irrigation**, and **preliminary plant disease assessment** (PRD v2.1).

## Stack

- **Web:** React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, PWA
- **API:** Node.js, Express, TypeScript, Prisma, **SQLite**, JWT
- **LLM:** Google Gemini (vision) via `GEMINI_API_KEY`
- **Weather:** OpenWeatherMap-compatible via `WEATHER_API_KEY`

No Docker or PostgreSQL required.

## Quick start

```bash
cp .env.example .env
```

Put your real keys in `.env`:

- `GEMINI_API_KEY`
- `WEATHER_API_KEY`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (16+ characters)

Then:

```bash
npm install

cd apps/api
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run seed:admin

cd ../..
npm run dev:api
npm run dev:web
```

- App: http://localhost:5173
- API: http://localhost:4000/api/health

`npm run seed:admin` prints the admin username and a generated password **once**. To rotate the password later: `npm run seed:admin:reset`.

## Tests and build

```bash
npm test
npm run typecheck
npm run build
```

## Farmer flow

Sign up → email OTP → **My Fields** → add field → suitability → Field home → **Irrigation Advice** / **Scan Crop** / **History**. Change crop with **Start New Crop Cycle**.

Disease assessment uses Gemini vision behind `DiseaseAssessmentService`. Treatment/dosage come only from the verified knowledge base. Weak evidence returns **UNCERTAIN**.

Irrigation volume is always `area_m² × depth_mm` litres. If weather fetch fails, enter temperature and humidity manually — weather is never invented.
