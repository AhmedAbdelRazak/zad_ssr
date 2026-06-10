# ZAD Hotels SSR

Next.js public website for ZAD Hotels.

## Runtime

- Next.js app router
- Server-side data loading from `NEXT_PUBLIC_API_URL`
- Default local port: `3105`

## API Scope

The public site reads only the Zad backend endpoints:

- `/api/zad-website-document`
- `/api/zad/active-hotels`
- `/api/zad/active-hotel-list`
- `/api/zad/distinct-rooms`
- `/api/zad/single-hotel/:slug`
- `/api/zad/room-query-list/:query`
- `/api/zad/hotels/active-with-deals`

The backend owns the hotel scope for `mrgamal@xhoteltest.com`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
```
