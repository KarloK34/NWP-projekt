# Katalog AI Alata

Projekt iz kolegija **Napredno Web Programiranje (NWP)**. Web aplikacija koja služi kao centralizirani katalog, pretraživač i sustav za preporuke AI alata.

---

## Tehnologije

| Sloj | Tehnologije |
|------|-------------|
| **Backend** | Node.js, Express 5, Mongoose, JWT, express-validator, bcryptjs, helmet, morgan, axios |
| **Frontend** | React 19, Vite 7, React Router 7, Tailwind CSS v4, react-i18next |
| **Baza** | MongoDB 8.2 |
| **Autentifikacija** | JWT (Bearer token) |
| **Vanjski API-ji** | Groq (AI opisi), Hugging Face (modeli), GitHub (AI-Catalog) |

---

## Struktura projekta

```
NWP-projekt/
├── backend/
│   ├── src/
│   │   ├── config/       # Povezivanje na MongoDB
│   │   ├── controllers/  # Logika zahtjeva (auth, tools, reviews, watchlist, ...)
│   │   ├── middleware/   # auth.js (JWT, admin), errorHandler.js
│   │   ├── models/       # Mongoose modeli (User, Tool, Category, Tag, AIModel, Review, Watchlist)
│   │   ├── routes/       # API rute (/api/auth, /api/tools, ...)
│   │   ├── services/     # aiDescriptionService (Groq), githubCatalogService, huggingFaceService
│   │   └── server.js     # Entry point
│   ├── seed-database.js  # Popunjavanje baze iz ai-catalog.md
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Auth, Filter, Layout, Review, Search, Tool, UI
│   │   ├── context/     # AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/       # useTools, useTool, useDebounce, useWatchlist, useReviews, ...
│   │   ├── pages/       # Home, Login, Register, Profile, Watchlist, ToolDetails, admin/*
│   │   ├── services/    # api.js (axios s JWT)
│   │   ├── locales/     # hr.json, en.json (i18n)
│   │   └── App.jsx
│   └── vite.config.js   # Proxy /api → localhost:5000
├── docker-compose.yml   # MongoDB kontejner
├── ai-catalog.md        # Izvor podataka za seed
└── README.md
```

---

## Setup

### Preduvjeti

- Node.js v25+ (ili noviji)
- npm
- MongoDB 8.2 (lokalno ili Docker)

### 1. MongoDB

Lokalno ili preko Docker-a:

```bash
docker-compose up -d
```

MongoDB će biti dostupan na `localhost:27017`.

### 2. Backend

```bash
cd backend
npm install
```

Kreirajte `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-tools-catalog
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Opcionalno – za gumb "Generiraj AI opis" u admin formi:
GROQ_API_KEY=your-groq-key   # Besplatan na console.groq.com

# Opcionalno – za Hugging Face pretragu modela:
HUGGINGFACE_TOKEN=your-hf-token
```

Pokretanje:

```bash
npm run dev
```

Backend: `http://localhost:5000`

### 3. Popunjavanje baze (opcionalno)

```bash
cd backend
npm run seed
```

Parsira `ai-catalog.md` i puni bazu alatima i kategorijama. Kreira admin korisnika `system` / `system-password-123`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000` (Vite proxy šalje `/api` na backend).

---

## Funkcionalnosti

### Korisničke

- **Pretraga i filtriranje** – po nazivu, kategoriji, tagovima, cijeni (free/paid/freemium), minimalnoj ocjeni; sortiranje
- **Detalji alata** – opis, website, logo, kategorija, modeli, tagovi, ocjena, recenzije
- **Recenzije** – dodavanje, uređivanje, brisanje vlastitih; ocjena 1–5, komentar, pros/cons
- **Watchlist** – dodavanje/uklanjanje alata; stranica Watchlist s filtriranjem po kategorijama
- **Profil** – osnovni podaci, moje recenzije, pregled watchliste
- **Autentifikacija** – registracija, prijava, JWT, zaštićene rute

### Admin

- **Dashboard** – statistike (broj alata, korisnika, recenzija, prosječna ocjena, top kategorije)
- **Alati** – CRUD, lista s pretragom, brisanje s potvrdom, pregled recenzija
- **Forma alata** – polja za logo, metapodatke (GitHub, Hugging Face, API docs), gumb **„Generiraj AI opis“** (Groq)
- **Kategorije, tagovi, modeli** – CRUD
- **Korisnici** – lista, promjena uloge (user ↔ admin), paginacija i pretraga

### Integracije

- **Groq** – generiranje AI opisa alata (admin gumb u formi)
- **GitHub AI-Catalog** – import alata iz `https://github.com/mehmetkahya0/AI-Catalog` (API: `POST /api/tools/import-from-github`)
- **Hugging Face** – pretraga modela po tasku (backend servis)

### UI/UX

- **i18n** – hrvatski (zadano) i engleski, prekidač u headeru
- **Dark mode** – svjetla / tamna / sustav, spremanje u localStorage
- **Reusable komponente** – Button, Input, Card, Modal, Spinner, Skeleton, Toast
- **Toast obavijesti** – success, error, info, warning
- **Responsive** – prilagođeno mobilnim uređajima

---

## API pregled

| Metoda | Ruta | Opis |
|--------|------|------|
| POST | `/api/auth/register` | Registracija |
| POST | `/api/auth/login` | Prijava |
| GET | `/api/auth/me` | Trenutni korisnik (JWT) |
| GET | `/api/tools` | Lista alata (paginacija, filteri) |
| GET | `/api/tools/:id` | Detalji alata |
| POST | `/api/tools` | Dodaj alat (admin) |
| PUT | `/api/tools/:id` | Uredi alat (admin) |
| DELETE | `/api/tools/:id` | Obriši alat (admin) |
| POST | `/api/tools/:id/enrich` | Generiraj AI opis (admin) |
| POST | `/api/tools/import-from-github` | Import iz GitHub kataloga (admin) |
| GET | `/api/reviews/tools/:toolId/reviews` | Recenzije alata |
| POST | `/api/reviews/tools/:toolId/reviews` | Dodaj recenziju |
| GET | `/api/watchlist` | Watchlist korisnika |
| POST/DELETE | `/api/watchlist/:toolId` | Dodaj/ukloni iz watchliste |
| GET | `/api/categories`, `/api/tags`, `/api/models` | Lista entiteta |

---

## Autori

Karlo Kraml i Sven Radić – Napredno Web Programiranje (NWP).
