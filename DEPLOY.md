# POTUS PARADOX — Deployment Guide

This guide covers deploying the full stack:
- **Frontend** → Vercel (free)
- **Backend** → Railway (free tier)
- **Database** → Supabase (free tier)

Estimated setup time: ~30 minutes.

---

## Step 1 — Supabase (Database)

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New project**
3. Give it a name (e.g. `potus-paradox`), choose a region close to you, set a database password
4. Wait ~2 minutes for the project to provision

### 1.2 Run the schema
1. In your Supabase project sidebar, click **SQL Editor**
2. Click **New query**
3. Open `schema.sql` from this project, paste the entire contents into the editor
4. Click **Run** (▶)
5. You should see: *Success. No rows returned*

This creates all tables, indexes, RLS policies, and seeds sample data.

### 1.3 Copy your credentials
Go to **Project Settings → API** and copy:

| What | Where to find it | Used in |
|------|-----------------|---------|
| Project URL | "Project URL" field | `SUPABASE_URL` in server `.env` |
| `service_role` key | Under "Project API keys" — click to reveal | `SUPABASE_SERVICE_KEY` in server `.env` |

⚠️ **Never expose the `service_role` key in the frontend.** It bypasses all RLS policies.

---

## Step 2 — Backend on Railway

### 2.1 Prepare your code
Push the project to a GitHub repository. You can push the whole monorepo — Railway will only use the `server/` folder.

### 2.2 Create a Railway project
1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your repository
4. Railway will detect it as a Node.js project

### 2.3 Set the root directory
1. Click on your service in Railway
2. Go to **Settings → Source**
3. Set **Root Directory** to `server`

### 2.4 Add environment variables
Go to **Variables** and add these one by one:

```
SUPABASE_URL          = https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY  = your-service-role-key
ADMIN_PASSWORD        = choose-a-strong-password-and-save-it
PORT                  = 3001
CLIENT_URL            = https://your-app.vercel.app
```

> ⚠️ Leave `CLIENT_URL` as a placeholder for now — you'll fill it in after deploying the frontend in Step 3. Come back and update it.

### 2.5 Deploy
Railway auto-deploys on every push. Click **Deploy** if it hasn't started.

Once deployed, Railway gives you a public URL like:
```
https://potus-paradox-production.up.railway.app
```

Copy this — you'll need it in Step 3.

### 2.6 Verify it's working
Visit `https://your-railway-url.up.railway.app/api/health` in your browser.
You should see: `{"status":"ok","app":"POTUS PARADOX"}`

---

## Step 3 — Frontend on Vercel

### 3.1 Import the project
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repository

### 3.2 Configure the build
In the project setup screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.3 Add environment variable
Click **Environment Variables** and add:

```
VITE_API_URL = https://your-railway-url.up.railway.app
```

Replace with your actual Railway URL from Step 2.5.

### 3.4 Deploy
Click **Deploy**. Vercel will build and deploy in ~1 minute.

Your app will be live at something like:
```
https://potus-paradox.vercel.app
```

### 3.5 Update CORS on the backend
Now go back to Railway → your service → **Variables** and update:
```
CLIENT_URL = https://potus-paradox.vercel.app
```

Click **Deploy** to redeploy the backend with the correct CORS origin.

---

## Step 4 — Verify Everything Works

Visit your Vercel URL and check:

- [ ] Timeline loads with sample events
- [ ] Filter bar (ALL / THREATS / NATO / etc.) works
- [ ] Clicking an event card opens the detail page
- [ ] Reactions can be clicked
- [ ] Comments can be posted
- [ ] Promise Tracker page loads with chart and list
- [ ] `/admin` shows the password gate
- [ ] Admin password works and you can create an event

---

## Custom Domain (Optional)

### Vercel (frontend)
1. Go to your Vercel project → **Settings → Domains**
2. Add your domain (e.g. `potusparadox.com`)
3. Follow the DNS instructions (add a CNAME record at your registrar)

### Railway (backend)
1. Go to your Railway service → **Settings → Networking**
2. Click **Generate Domain** or **Add Custom Domain**
3. If using a custom domain (e.g. `api.potusparadox.com`), update `CLIENT_URL` in Railway and `VITE_API_URL` in Vercel accordingly, then redeploy both.

---

## Local Development

Run both servers simultaneously (two terminals):

**Terminal 1 — Backend:**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials and ADMIN_PASSWORD
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
cp .env.example .env
# .env already points to localhost:3001 — no changes needed for local dev
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Updating the App

### To push a content update (new events/promises):
Use the `/admin` panel on your live site — no redeployment needed.

### To push a code update:
```bash
git add .
git commit -m "your message"
git push
```
Both Vercel and Railway auto-deploy on push to `main`.

---

## Troubleshooting

**"Failed to load events" on the timeline**
- Check Railway logs for errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct in Railway variables
- Check that the schema was run successfully in Supabase

**CORS error in browser console**
- Make sure `CLIENT_URL` in Railway exactly matches your Vercel URL (no trailing slash)
- Redeploy the backend after changing the variable

**`/event/:id` or `/promises` returns 404 on refresh**
- Verify `vercel.json` is present in the `client/` folder — it handles React Router rewrites

**Admin password not working**
- Double-check `ADMIN_PASSWORD` in Railway variables — no spaces, no quotes around the value
- Railway variables are case-sensitive

**Supabase RLS errors in logs**
- The backend uses the `service_role` key which bypasses RLS — if you see RLS errors, the wrong key is being used (check you copied `service_role` and not `anon`)
