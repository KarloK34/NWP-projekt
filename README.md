# Katalog AI Alata

Web aplikacija koja služi kao centralizirani katalog, pretraživač i sustav za preporuke AI alata.

## Tehnologije

- **Backend**: Node.js v25.2.1, Express v5.2.1
- **Frontend**: React v19.2, Vite, Tailwind CSS v4, react-i18next (i18n)
- **Baza podataka**: MongoDB v8.2
- **Autentifikacija**: JWT
- **Vanjski API-ji**: Groq (AI opisi)

## Struktura Projekta

```
NWP-projekt/
├── backend/          # Express backend server
├── frontend/         # React frontend aplikacija
└── README.md        
```

## Setup

### Preduvjeti

- Node.js v25.2.1 ili noviji
- npm v11.7.0 ili noviji
- MongoDB v8.2 (lokalno ili MongoDB Atlas)

### Backend Setup

1. Navigirajte u `backend/` direktorij:
```bash
cd backend
```

2. Instalirajte dependencies:
```bash
npm install
```

3. Kreirajte `.env` datoteku:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-tools-catalog
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
# Za generiranje AI opisa alata (admin gumb "Generiraj AI opis"):
GROQ_API_KEY=your-groq-key           # Besplatan, bez kartice (console.groq.com)
```

4. Pokrenite server:
```bash
npm run dev
```

Backend server će biti dostupan na `http://localhost:5000`

### Frontend Setup

1. Navigirajte u `frontend/` direktorij:
```bash
cd frontend
```

2. Instalirajte dependencies:
```bash
npm install
```

3. Pokrenite development server:
```bash
npm run dev
```

Frontend aplikacija će biti dostupna na `http://localhost:3000`

## Funkcionalnosti

- ✅ Pretraga i filtriranje AI alata
- ✅ Recenzije i ocjene alata
- ✅ Watchlist funkcionalnost (stranica Watchlist, dodavanje/uklanjanje na stranici alata, filtriranje po kategorijama)
- ✅ Korisnički profil: osnovni podaci, moje recenzije, pregled watchliste
- ✅ Admin panel za upravljanje katalogom
  ✅ Dashboard sa statistikama (broj alata, korisnika, recenzija, prosječna ocjena, top kategorije)
  ✅ Upravljanje alatima: lista, dodavanje, uređivanje, brisanje (s potvrdom), polje za logo i metapodatke, gumb „Generiraj AI opis“ (Groq)
  ✅ CRUD za kategorije, tagove i modele
  ✅ Upravljanje korisnicima: lista, promjena uloge (user ↔ admin), paginacija i pretraga
- ✅ Integracija s vanjskim API-jima: Groq (generiranje AI opisa alata), Hugging Face, RapidAPI
- ✅ Autentifikacija i autorizacija
- ✅ Reusable UI komponente (Button, Input, Card, Modal, Spinner, Skeleton, Toast)
- ✅ Toast obavijesti (success/error/info/warning)
- ✅ Internacionalizacija (i18n): hrvatski (zadano) i engleski, prekidač jezika u headeru
- ✅ Dark mode: prekidač u headeru (svjetla / tamna / sustav), preferencija se sprema u localStorage

## Autori

Projekt izradili Karlo Kraml i Sven Radić za kolegij Napredno Web Programiranje (NWP). 
