# Deployment Guide

Deploy Character Foundry to production for $0-5/month.

---

## Deployment Strategy

**Recommended (Cheapest):**
- Frontend: Vercel Free Tier
- Backend: Render Free Tier or Vercel Serverless

**Total Cost: $0/month** (plus $1/month for Bunny CDN)

---

## Option 1: Vercel (All-in-One)

### Deploy Frontend

```bash
cd client
npm install -g vercel
vercel login
vercel
```

Follow prompts:
- Project name: `character-foundry-web`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

**Set Environment Variables:**
```bash
vercel env add VITE_API_URL production
# Enter: https://your-api-url.vercel.app/api
```

### Deploy Backend

```bash
cd server
vercel
```

Follow prompts:
- Project name: `character-foundry-api`

**Set Environment Variables:**
```bash
vercel env add MONGODB_URI production
vercel env add GEMINI_API_KEY production
vercel env add BUNNY_API_KEY production
vercel env add BUNNY_STORAGE_ZONE production
vercel env add BUNNY_CDN_HOSTNAME production
vercel env add ALLOWED_ORIGINS production
# Enter your frontend URL
```

**Redeploy with env vars:**
```bash
vercel --prod
```

---

## Option 2: Render (Alternative)

### Setup

1. Push code to GitHub
2. Go to https://render.com
3. Sign up with GitHub
4. New → Web Service

### Backend Deployment

1. **Connect Repository**
   - Select your GitHub repo
   - Root directory: `server/`

2. **Configure Service**
   - Name: `character-foundry-api`
   - Environment: Node
   - Region: Choose closest to users
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

3. **Environment Variables**
   Add in Render dashboard:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://...
   GEMINI_API_KEY=...
   BUNNY_API_KEY=...
   BUNNY_STORAGE_ZONE=...
   BUNNY_CDN_HOSTNAME=...
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait ~5 minutes for first deploy
   - Note your API URL: `https://character-foundry-api.onrender.com`

### Frontend Deployment

Use Vercel (easier):
```bash
cd client
vercel
```

Or use Render static site:
1. New → Static Site
2. Connect repo
3. Build command: `cd client && npm install && npm run build`
4. Publish directory: `client/dist`

---

## Option 3: Railway (Alternative Backend)

Railway offers free tier with more generous limits than Render.

1. Go to https://railway.app
2. Start New Project → Deploy from GitHub
3. Select repo → Select `server/` folder
4. Add environment variables
5. Deploy

**Note:** Railway may require credit card for verification.

---

## Post-Deployment Setup

### 1. Update CORS Origins

In your backend `.env` or deployment environment:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com
```

Redeploy backend after updating.

### 2. Update Frontend API URL

In `client/.env` or Vercel environment:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

Redeploy frontend after updating.

### 3. Test Production

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Create character
curl -X POST https://your-backend.onrender.com/api/characters/create \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A brave knight"}'
```

### 4. MongoDB Whitelist

In MongoDB Atlas:
- Network Access → Add IP Address
- Enter: `0.0.0.0/0` (allow all)
- Or add specific IPs from Render/Vercel docs

---

## Custom Domain (Optional)

### Vercel

1. Go to project settings
2. Domains → Add Domain
3. Enter: `characterfoundry.com`
4. Follow DNS instructions
5. Wait for SSL certificate (~5 min)

### Bunny CDN

Update your pull zone:
1. Bunny dashboard → Pull Zones
2. Select your zone
3. Hostnames → Add Custom Hostname
4. Enter: `cdn.characterfoundry.com`
5. Add CNAME record in DNS: `cdn.characterfoundry.com` → `cf-assets.b-cdn.net`

---

## Monitoring

### Vercel

- Dashboard: https://vercel.com/dashboard
- Real-time logs
- Analytics (free tier: 100K requests/month)
- Error tracking

### Render

- Dashboard: https://dashboard.render.com
- Logs tab for each service
- Metrics tab shows usage
- Free tier: 750 hours/month

### MongoDB Atlas

- Monitor database usage
- Set up alerts for quota
- Free tier: 512MB storage

---

## Scaling Strategy

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 100K edge requests
- 10K serverless function invocations/day

**Render:**
- 750 hours/month
- Sleeps after 15 min inactivity (30s wake time)
- 100GB bandwidth/month

**MongoDB Atlas:**
- 512MB storage (~5000-10000 characters)
- Shared compute (no limit on connections)

### When to Upgrade

Upgrade when you hit:
- 1000+ daily active users
- 100GB/month bandwidth
- Need <1s response times (Render free sleeps)

**Paid tier costs:**
- Vercel Pro: $20/month
- Render Standard: $7/month
- MongoDB M2: $9/month
- **Total: ~$35/month for serious production**

---

## CI/CD (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd client && npm install && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client

  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd server && npm install
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_SERVER }}
          working-directory: ./server
```

---

## Troubleshooting

### "Cannot connect to API"

1. Check backend is running (not sleeping on Render)
2. Verify `VITE_API_URL` is correct in frontend
3. Check CORS settings in backend
4. Test API directly with curl

### Images not uploading

1. Verify Bunny CDN credentials
2. Check storage zone permissions
3. Test upload manually:
```bash
curl -X PUT https://storage.bunnycdn.com/your-zone/test.txt \
  -H "AccessKey: your-api-key" \
  --data "test"
```

### MongoDB connection errors

1. Whitelist `0.0.0.0/0` in Atlas (temporary)
2. Check connection string format
3. Verify database user password has no special characters
4. Try reconnecting in Atlas dashboard

### Slow cold starts (Render)

Free tier services sleep after 15 minutes:
- First request takes 30s to wake
- Upgrade to paid ($7/month) for always-on
- Or use Vercel serverless (faster cold starts)

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain
- [ ] MongoDB IP whitelisted
- [ ] Bunny CDN configured with custom domain
- [ ] Health endpoint returns 200 OK
- [ ] Test character creation end-to-end
- [ ] Test chat functionality
- [ ] Test image generation and upload
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure analytics (Google Analytics, Plausible)

**Ready to launch!** 🚀
