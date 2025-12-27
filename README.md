# Katalog AI Alata

Web aplikacija koja služi kao centralizirani katalog, pretraživač i sustav za preporuke AI alata.

## Tehnologije

- **Backend**: Node.js v25.2.1, Express v5.2.1
- **Frontend**: React v19.2, Vite
- **Baza podataka**: MongoDB v8.2
- **Autentifikacija**: JWT
- **Vanjski API-ji**: Hugging Face API, RapidAPI

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
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
RAPIDAPI_KEY=your-rapidapi-key-here
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
- ✅ Watchlist funkcionalnost
- ✅ Admin panel za upravljanje katalogom
- ✅ Integracija s vanjskim API-jima (Hugging Face, RapidAPI)
- ✅ Autentifikacija i autorizacija

## Autori

Projekt izradili Karlo Kraml i Sven Radić za kolegij Napredno Web Programiranje (NWP). 
