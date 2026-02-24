# ruins.ltd

Meditations on Ruins — landing page.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, GSAP.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel (first time, no account)

### Step 1 — Push to GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository**, name it `ruins-ltd`, set it to **Private**, click **Create repository**
3. In your terminal (from inside this project folder):

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ruins-ltd.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 — Create a Vercel account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → choose **Continue with GitHub** (links your accounts in one step)
3. Authorise Vercel to access your GitHub

### Step 3 — Import your repo

1. From the Vercel dashboard click **Add New → Project**
2. Find `ruins-ltd` in the list and click **Import**
3. Vercel auto-detects Next.js — leave all settings as default
4. Click **Deploy**

That's it. Vercel builds and deploys in ~30 seconds.

### Step 4 — Connect your domain (ruins.ltd)

1. In your Vercel project go to **Settings → Domains**
2. Type `ruins.ltd` and click **Add**
3. Vercel gives you two DNS records to add — either:
   - **A record** pointing to Vercel's IP, and
   - **CNAME** for `www`
4. Log into wherever you bought `ruins.ltd` (Cloudflare, Namecheap, etc.) and add those records
5. DNS propagates in minutes to a few hours — Vercel shows a green tick when live

---

## Deploying future changes

Once set up, every push to `main` auto-deploys:

```bash
git add .
git commit -m "your change"
git push
```

Vercel picks it up instantly. You also get a unique preview URL for every
branch, so you can test changes before merging to main.

---

## Project structure

```
ruins-ltd/
├── app/
│   ├── layout.tsx        # Root layout — font, metadata, global CSS
│   ├── page.tsx          # Home page
│   └── globals.css       # Base styles + Tailwind
├── components/
│   └── MotionBlurText.tsx  # GSAP animation component
├── public/               # Static assets (add images/fonts here)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Adding new pages

Create a folder in `app/` with a `page.tsx` inside:

```
app/
  events/
    page.tsx    → ruins.ltd/events
  about/
    page.tsx    → ruins.ltd/about
```
