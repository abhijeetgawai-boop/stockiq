# StockIQ — Deployment Guide
## Get your app live in ~10 minutes, completely free

---

## What you need
- A free GitHub account (github.com)
- A free Netlify account (netlify.com)
- A free Anthropic API key (console.anthropic.com)
- That's it — no coding, no credit card required for hosting

---

## Step 1 — Get your Anthropic API key

1. Go to **console.anthropic.com**
2. Sign up for a free account
3. Click **"API Keys"** in the left sidebar
4. Click **"Create Key"** — name it "StockIQ"
5. COPY the key that appears (starts with `sk-ant-...`)
   ⚠ You only see this once — paste it somewhere safe temporarily

---

## Step 2 — Put the files on GitHub

1. Go to **github.com** and sign in (or create a free account)
2. Click the **"+"** icon top right → **"New repository"**
3. Name it: `stockiq`
4. Make sure it's set to **Public**
5. Click **"Create repository"**
6. On the next page, click **"uploading an existing file"**
7. Upload ALL THREE files from this folder:
   - `index.html`
   - `netlify.toml`
   - `netlify/functions/analyze.js`
   
   ⚠ For the functions file: first create a folder called `netlify`, 
     then inside that a folder called `functions`, then upload `analyze.js` there.
     
   Easier method: drag all files at once and GitHub will preserve the folder structure.
8. Click **"Commit changes"**

---

## Step 3 — Deploy on Netlify

1. Go to **netlify.com** and sign up with your GitHub account
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** and authorize Netlify
4. Select your **`stockiq`** repository
5. Leave all settings as default
6. Click **"Deploy site"**
7. Wait 1–2 minutes — Netlify builds it automatically
8. You'll get a free URL like `amazing-fox-123456.netlify.app`
   (You can rename this in Site Settings → Site details → Change site name)

---

## Step 4 — Add your API key (IMPORTANT)

Without this step, the AI analysis won't work.

1. In Netlify, go to your site dashboard
2. Click **"Site configuration"** (left sidebar)
3. Click **"Environment variables"**
4. Click **"Add a variable"**
5. Key: `ANTHROPIC_API_KEY`
6. Value: paste your key from Step 1 (the `sk-ant-...` one)
7. Click **"Save"**
8. Go to **"Deploys"** and click **"Trigger deploy"** → **"Deploy site"**
   (This restarts the app with your new key active)

---

## Step 5 — Open on your phone

1. Visit your Netlify URL (e.g. `my-stocks.netlify.app`)
2. On iPhone: tap the Share icon → "Add to Home Screen"
3. On Android: tap the 3-dot menu → "Add to Home Screen"

Your app now lives on your phone like a native app — tap the icon anytime!

---

## API Cost estimate

Each AI analysis tap costs roughly $0.01–0.03.
Normal daily use: under $1/month.
Anthropic gives new accounts some free credits to start.

---

## Updating stocks / customizing

To update the stock list or any content, just edit `index.html` in GitHub
(click the file → click the pencil icon to edit → commit).
Netlify auto-redeploys within 60 seconds.

---

## Need help?

If you get stuck, the most common issues are:
- Forgot to add the API key in Netlify environment variables → Step 4
- Folder structure wrong for the functions file → re-upload with correct path
- Site says "Page not found" → check netlify.toml was uploaded

---

*StockIQ is for educational purposes only. Not financial advice.*
