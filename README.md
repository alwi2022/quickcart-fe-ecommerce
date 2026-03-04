# quickcart-fe-ecommerce

Frontend e-commerce QuickCart (Next.js).

## Prasyarat

- Node.js >= 18.18 (disarankan 20 LTS)
- Backend berjalan di `http://localhost:4000`

## Setup

```bash
npm install
```

Buat `.env.local` (opsional jika backend memang di port default):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## Run (Development)

```bash
npm run dev
```

Berjalan di `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```
