# Deployment Guide

## Quick Start

This mobile React app can be deployed in three ways:

1. **Mobile Subdomain** (m.characterfoundry.io) - Recommended
2. **Mobile App Wrapper** (iOS/Android App Store)
3. **Integrate with Existing Site**

---

## Option 1: Deploy to Mobile Subdomain

### Using Vercel (Easiest)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Configure build:**
```bash
npm run build
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Configure custom domain:**
- Go to Vercel dashboard
- Add domain: `m.characterfoundry.io`
- Update DNS records as instructed

5. **Set environment variables:**
- In Vercel dashboard → Settings → Environment Variables
- Add: `REACT_APP_API_URL=https://api.characterfoundry.io/api`

**Build Settings:**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

### Using Netlify

1. **Connect GitHub repo:**
- Go to Netlify dashboard
- New site from Git
- Select this repository

2. **Configure build:**
- Build command: `npm run build`
- Publish directory: `dist`

3. **Set environment variables:**
- Site settings → Environment Variables
- Add: `REACT_APP_API_URL=https://api.characterfoundry.io/api`

4. **Configure custom domain:**
- Domain settings → Add custom domain
- Set up `m.characterfoundry.io`

---

### Using Your Own Server (nginx)

1. **Build the app:**
```bash
npm run build
```

2. **Copy to server:**
```bash
scp -r dist/* user@your-server:/var/www/m.characterfoundry.io/
```

3. **Configure nginx:**
```nginx
server {
    listen 80;
    server_name m.characterfoundry.io;

    root /var/www/m.characterfoundry.io;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

4. **Enable HTTPS:**
```bash
sudo certbot --nginx -d m.characterfoundry.io
```

---

## Option 2: Deploy as Mobile App

### iOS App Store

1. **Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "Character Foundry" "io.characterfoundry.app"
npx cap add ios
```

2. **Configure Capacitor:**

Edit `capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.characterfoundry.app',
  appName: 'Character Foundry',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e"
    }
  }
};

export default config;
```

3. **Build and sync:**
```bash
npm run build
npx cap sync ios
npx cap open ios
```

4. **In Xcode:**
- Configure app icons
- Set bundle identifier
- Configure signing & capabilities
- Build and submit to App Store

### Android App Store

1. **Add Android platform:**
```bash
npx cap add android
npm run build
npx cap sync android
npx cap open android
```

2. **In Android Studio:**
- Configure app icons (res/mipmap)
- Update app name in `strings.xml`
- Set applicationId in `build.gradle`
- Generate signed APK/AAB
- Submit to Google Play

### App Icon & Splash Screen

Use a tool like [Capacitor Assets Generator](https://github.com/ionic-team/capacitor-assets):
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#1a1a2e'
```

Place your icon at: `resources/icon.png` (1024x1024)

---

## Option 3: Integrate with Existing Site

### Sub-path Integration

If you want the mobile app at `characterfoundry.io/mobile`:

1. **Update `vite.config.js`:**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/mobile/'  // Add this
})
```

2. **Build:**
```bash
npm run build
```

3. **Deploy to sub-path:**
```bash
scp -r dist/* user@server:/var/www/characterfoundry.io/mobile/
```

### Iframe Integration

Load mobile app in your existing site:
```html
<iframe
  src="https://m.characterfoundry.io"
  style="width:100%; height:100vh; border:none;"
></iframe>
```

---

## Environment Variables by Environment

### Development
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Staging
```env
REACT_APP_API_URL=https://staging-api.characterfoundry.io/api
```

### Production
```env
REACT_APP_API_URL=https://api.characterfoundry.io/api
```

---

## DNS Configuration

For `m.characterfoundry.io`:

### If using Vercel/Netlify:
```
Type: CNAME
Name: m
Value: [provided by hosting platform]
```

### If using your own server:
```
Type: A
Name: m
Value: [your server IP]
```

---

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Mobile App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.API_URL }}

    - name: Deploy to Vercel
      run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Add secrets in GitHub repo settings:
- `API_URL`
- `VERCEL_TOKEN`

---

## Performance Optimization

### Before deploying:

1. **Code splitting:**
Already configured with Vite. Components lazy load automatically.

2. **Image optimization:**
If you add images, use WebP format:
```bash
npm install vite-plugin-imagemin --save-dev
```

3. **Bundle analysis:**
```bash
npm run build -- --mode analyze
```

---

## Security Checklist

Before production:

- [ ] HTTPS enabled
- [ ] Environment variables set correctly
- [ ] API_URL points to production
- [ ] CORS configured on Node server
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] Authentication implemented (if required)
- [ ] Input validation on all forms

---

## Monitoring & Analytics

### Add analytics (optional):

```bash
npm install @vercel/analytics
```

In `src/main.jsx`:
```javascript
import { inject } from '@vercel/analytics'
inject()
```

### Error tracking:

```bash
npm install @sentry/react
```

Configure in `src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE
})
```

---

## Rollback Plan

If deployment fails:

### Vercel/Netlify:
- Go to dashboard
- Find previous deployment
- Click "Promote to Production"

### Your own server:
Keep previous build:
```bash
cp -r dist dist-backup-$(date +%Y%m%d)
```

Rollback:
```bash
cp -r dist-backup-20240121/* /var/www/m.characterfoundry.io/
```

---

## Post-Deployment Testing

1. **Check all routes:**
   - [ ] `/` - Landing page loads
   - [ ] `/browse` - Gallery works
   - [ ] `/character/achilles` - Character page works

2. **Test API connections:**
   - [ ] Character data loads
   - [ ] Chat messages work
   - [ ] Error handling displays properly

3. **Mobile testing:**
   - [ ] Test on iOS Safari
   - [ ] Test on Android Chrome
   - [ ] Check responsive design

4. **Performance:**
   - [ ] Lighthouse score > 90
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3s

---

## Support

If you run into issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test API endpoints directly
4. Check CORS configuration on Node server

---

## Quick Reference

| Environment | URL | API URL |
|-------------|-----|---------|
| Local Dev | http://localhost:5173 | http://localhost:3001/api |
| Staging | https://staging-m.characterfoundry.io | https://staging-api.characterfoundry.io/api |
| Production | https://m.characterfoundry.io | https://api.characterfoundry.io/api |
| iOS App | Capacitor native | https://api.characterfoundry.io/api |
| Android App | Capacitor native | https://api.characterfoundry.io/api |
