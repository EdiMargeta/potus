# POTUS PARADOX — Deployment Guide
**Stack: React → Supabase (direct) → Vercel**
No backend server. No Railway. Two services total.

Estimated time: ~20 minutes.

---

## Step 1 — Supabase

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `potus-paradox`, pick a region, set a DB password
3. Wait ~2 minutes for it to provision

### 1.2 Run the schema
1. Sidebar → **SQL Editor** → **New query**
2. Paste the entire contents of `schema.sql`
3. Click **Run** ▶
4. You should see: *Success. No rows returned*

This creates all tables, RLS policies, indexes, and seeds sample data.

### 1.3 Copy your three keys
Go to **Project Settings → API**:

| Key | Field | Used as |
|-----|-------|---------|
| Project URL | "Project URL" | `VITE_SUPABASE_URL` |
| anon / public | Under "Project API keys" | `VITE_SUPABASE_ANON_KEY` |
| service_role | Under "Project API keys" — reveal it | `VITE_SUPABASE_SERVICE_KEY` |

> ⚠️ The `service_role` key bypasses all RLS. It is only used inside the
> admin panel after the correct password is entered. It will be bundled into
> your Vercel build — this is acceptable for a personal project but be aware
> it is visible in browser devtools to anyone who looks.
> For a higher-security setup in future, move admin writes to a Supabase Edge Function.

---

## Step 2 — Local development (optional but recommended first)

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` and fill in your three Supabase keys and pick an admin password:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_SERVICE_KEY=eyJ...
VITE_ADMIN_PASSWORD=your-strong-password
```

Run locally:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the app should load with sample data.

Test the admin panel at [http://localhost:5173/admin](http://localhost:5173/admin).

---

## Step 3 — Deploy to Vercel

### 3.1 Push to GitHub
Push the entire project to a GitHub repository (public or private).

### 3.2 Import on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. On the configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` *(auto-detected)* |
| **Output Directory** | `dist` *(auto-detected)* |

### 3.3 Add environment variables
In the **Environment Variables** section, add all four:

```
VITE_SUPABASE_URL         = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY    = eyJ...
VITE_SUPABASE_SERVICE_KEY = eyJ...
VITE_ADMIN_PASSWORD       = your-strong-password
```

### 3.4 Deploy
Click **Deploy**. Done in ~1 minute.

Your app is live at `https://your-project.vercel.app`.

---

## Step 4 — Verify

Visit your Vercel URL and check:

- [ ] Timeline loads with 5 sample events
- [ ] Filter bar works (try NATO, THREAT)
- [ ] Click an event card → detail page loads
- [ ] Reactions can be clicked
- [ ] Comments can be posted
- [ ] Promise Tracker shows chart + list
- [ ] `/admin` shows password gate
- [ ] Admin password works, events/promises are editable
- [ ] Refreshing `/promises` or `/event/...` does NOT give a 404
      (vercel.json handles this — if it does 404, check that file is present in `client/`)

---

## Updating the app

### Content updates (new events, promises):
Use the `/admin` panel on your live site — no redeployment needed.

### Code updates:
```bash
git add .
git commit -m "your message"
git push
```
Vercel auto-deploys on every push to `main`.

### Adding a new president:
The `president` column exists on both `events` and `promises`.
All queries default to `trump`. Future: add a president selector to the navbar
and pass the selected president down through context.

---

## Troubleshooting

**Timeline is empty / "failed to load"**
- Open browser devtools → Console — look for Supabase errors
- Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables
- Make sure you redeployed after adding env vars (Vercel doesn't hot-reload them)

**Admin writes fail ("permission denied")**
- Check that `VITE_SUPABASE_SERVICE_KEY` is the `service_role` key, not the `anon` key
- They look similar — the service_role key is longer and starts with `eyJ`
- In Supabase → Project Settings → API, click "Reveal" next to service_role

**`/event/:id` or `/promises` returns 404 on page refresh**
- Make sure `client/vercel.json` exists — it contains the SPA rewrite rule
- If missing, create it with: `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`

**Admin password not working**
- Check `VITE_ADMIN_PASSWORD` in Vercel — no quotes, no extra spaces
- Passwords are case-sensitive
- After changing env vars, redeploy from Vercel dashboard

**"Missing VITE_SUPABASE_URL" error on load**
- The `.env` file was not copied or env vars not set in Vercel
- Locally: make sure you ran `cp .env.example .env` and filled it in
