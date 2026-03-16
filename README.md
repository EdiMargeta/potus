# POTUS PARADOX
> Every promise. Every contradiction. On the record.

A presidential accountability tracker with a cyberpunk war-room aesthetic. Built with React + Node/Express + Supabase.

---

## Stack

- **Frontend**: React 18 + Vite + React Router + Recharts
- **Backend**: Node.js + Express
- **Database**: Supabase (Postgres)
- **Fonts**: Barlow Condensed + IBM Plex Mono (Google Fonts)

---

## Setup

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project, open the **SQL Editor**
3. Paste the entire contents of `schema.sql` and run it
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `service_role` key (secret — never expose this on frontend)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
PORT=3001
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev      # development (with nodemon)
npm start        # production
```

### 3. Frontend

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev      # development
npm run build    # production build (outputs to dist/)
```

---

## Development

Run both in parallel (two terminals):

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Timeline — vertical feed of events with filters |
| `/event/:id` | Event detail — full article, reactions, comments |
| `/promises` | Promise Tracker — dashboard + filterable list |
| `/admin` | Admin panel — add/edit events and promises |

---

## Admin Panel

Navigate to `/admin` and enter the password you set in `ADMIN_PASSWORD`.

You can:
- Create, edit, delete **events** (timeline entries)
- Create, edit, delete **promises** (tracker entries)
- Set promise statuses: `kept` / `broken` / `pending` / `reversed`
- Add contradiction links between events (directly in Supabase for now)

---

## Deployment

### Backend → [Railway](https://railway.app) (free tier)

1. Push to GitHub
2. New project → Deploy from GitHub repo
3. Set root directory to `server`
4. Add environment variables (same as `.env`)
5. Copy the deployed URL

### Frontend → [Vercel](https://vercel.com) (free tier)

1. New project → Import from GitHub
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-railway-url`
4. Deploy

---

## Adding More Presidents

The `president` field on both `events` and `promises` tables allows multi-president support.  
All queries default to `trump`. Pass `?president=biden` (or any name) to filter.  
Future: add a president selector to the UI navigation.

---

## Project Structure

```
potus-paradox/
├── schema.sql              ← Run once in Supabase
├── README.md
├── server/
│   ├── index.js            ← Express app entry
│   ├── supabase.js         ← Supabase client
│   ├── package.json
│   ├── .env.example
│   └── routes/
│       ├── events.js
│       ├── promises.js
│       ├── comments.js
│       ├── reactions.js
│       └── admin.js
└── client/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/
        │   └── api.js
        ├── styles/
        │   └── global.css
        ├── components/
        │   ├── Navbar.jsx
        │   ├── EventCard.jsx
        │   ├── FilterBar.jsx
        │   ├── HeroTicker.jsx
        │   ├── CategoryBadge.jsx
        │   ├── SeverityDot.jsx
        │   ├── ReactionsBar.jsx
        │   └── CommentsSection.jsx
        └── pages/
            ├── Timeline.jsx
            ├── EventDetail.jsx
            ├── PromiseTracker.jsx
            └── Admin.jsx
```
