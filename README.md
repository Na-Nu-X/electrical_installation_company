# Voltis Elektro – white-label web for electrical contractors

Full-stack web application for an electrical installation & engineering company
(silnoprúdové a slaboprúdové rozvody, revízie, bleskozvody, smart home, wallboxy).
Codebase is in English; all user-facing content is in Slovak.

```
/backend    Django 6 + Django REST Framework API, Slovak admin, seed data
/frontend   Angular 22 (standalone components, Signals, strict TS), pure SCSS
```

## Requirements

- Python 3.12+ (tested with 3.14)
- Node.js 22+ and npm 10+

## 1. Backend (http://localhost:8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional – defaults work for local dev
python manage.py migrate
python manage.py seed_data         # idempotent – safe to run repeatedly
python manage.py createsuperuser   # account for /admin
python manage.py runserver         # serves on port 8000
```

- Admin: http://localhost:8000/admin/ (Slovak UI – categories, services, references,
  team, incoming quote requests and urgent fault reports with a **PORUCHA** badge)
- Tests: `python manage.py test electrical`

### API endpoints (`/api/`)

| Method | Endpoint | Notes |
| ------ | -------- | ----- |
| GET | `/api/categories/` | categories with `service_count` |
| GET | `/api/services/` | `?category=<slug>&featured=true&search=…&ordering=starting_price_eur` |
| GET | `/api/services/<slug>/` | full dossier incl. scope of work, standards, FAQ |
| GET | `/api/references/` | `?category=<slug>&client_type=rodinny_dom\|bytovy_dom\|firma_priemysel&featured=true` |
| GET | `/api/team/` | licensed electricians and inspection technicians |
| POST | `/api/quotes/` | quote / inspection request / fault report (validated, throttled) |

### Production

Set environment variables (see `backend/.env.example`): `DJANGO_SECRET_KEY`,
`DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `DATABASE_URL=postgres://…`,
`CORS_ALLOWED_ORIGINS`. Install `pip install -r requirements-prod.txt` (adds
psycopg + gunicorn), then `python manage.py collectstatic`.

## 2. Frontend (http://localhost:4200)

```bash
cd frontend
npm install        # .npmrc enables legacy-peer-deps (works around an npm resolver bug)
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/frontend
```

The dev API URL is set in `src/environments/environment.ts`
(`http://localhost:8000/api`). The production build uses
`environment.prod.ts` (`/api`, i.e. the API served behind the same domain via
a reverse proxy). If port 8000 is taken on your machine, run Django on another
port and update `apiUrl` accordingly.

### Pages

| Route | Page |
| ----- | ---- |
| `/` | Home – hero, qualification badges, featured services, cost estimator, trust pillars, references, testimonials, team |
| `/sluzby` | Searchable / filterable service catalog (`?kategoria=&q=&zoradit=`) |
| `/sluzby/:slug` | Service dossier – scope, STN standards, timeline, FAQ, pre-filled quote CTA |
| `/realizacie` | Reference projects filtered by client type and category |
| `/revizie-a-legislativa` | Statutory inspections, interval table, process, FAQ, "Objednať revíziu" CTA |
| `/kalkulacka` | Standalone cost estimator |
| `/dopyt` | Quote & fault report form, pre-fillable via `?type=&object=&area=` |

## Rebranding for a new client

1. **Business data** – edit `frontend/src/app/core/config/site.config.ts`
   (company name, wordmark, phones, emergency hotline, address, region, IČO/DIČ,
   TI SR authorization, partners, trust metrics, badges, testimonials).
2. **Colours & fonts** – edit `$palette` in `frontend/src/styles/_variables.scss`
   (or override the `--color-*` custom properties in `:root`). Fonts are loaded in
   `frontend/src/index.html`.
3. **Prices of the estimator** – `frontend/src/app/shared/components/electrical-cost-estimator/estimator.model.ts`.
4. **Content** – services, references and team are managed in Django admin;
   inspection intervals live in `frontend/src/app/core/content/inspections.content.ts`.

All company details in this repository are fictional placeholders.
