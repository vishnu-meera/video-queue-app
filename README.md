# Video Queue App

A React Native + Expo video player application that fetches YouTube URLs from a Gist and plays them in a queue.

## Features

- ✅ Fetch YouTube URLs from a public Gist file
- ✅ Queue-based video playback (one video at a time)
- ✅ Local storage persistence (loads from storage first, then Gist when empty)
- ✅ Auto-remove watched videos from queue and storage
- ✅ Cross-platform support (iOS, Android, Web)
- ✅ Responsive design that adapts to different screen sizes
- ✅ Minimal YouTube overlays (no related videos, share buttons, etc.)
- ✅ Navigation controls (Previous, Next, Restart) visible on all platforms

## How It Works

1. **Initial Load**: App checks local storage for saved video queue
2. **Gist Fetching**: If no videos in storage, fetches from the configured Gist URL
3. **Queue Management**: Videos are played one at a time in sequence
4. **Auto-Cleanup**: When a video finishes playing, it's automatically removed from queue and storage
5. **Smart Reloading**: When queue becomes empty, automatically fetches new videos from Gist

## Project Structure

```
video-queue-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation configuration
│   │   ├── index.tsx            # Main video player screen
│   │   └── explore.tsx          # Queue list screen (hidden)
│   └── +not-found.tsx           # 404 error page
├── components/
│   ├── VideoPlayer.tsx          # YouTube video player component
│   └── VideoQueueManager.tsx    # Main queue management component
├── services/
│   ├── gistService.ts           # Gist fetching and video ID extraction
│   └── storageService.ts        # Local storage operations
├── hooks/
│   └── useResponsive.ts         # Responsive design hook
├── app.json                     # Expo configuration
├── metro.config.js              # Metro bundler configuration
└── README.md                    # This file
```

## Dependencies

### Core Dependencies
- `expo`: ^53.0.0
- `expo-router`: ^4.0.0
- `react-native-youtube-iframe`: ^2.0.2
- `@react-native-async-storage/async-storage`: ^2.1.0

### Web Dependencies
- `react-native-web-webview`: ^0.0.1
- `react-native-webview`: ^14.0.0

## Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- Expo CLI: `npm install -g @expo/cli`

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start
```

### Platform-Specific Commands
```bash
# iOS Simulator
npm run ios
# or
npx expo start --ios

# Android Emulator
npm run android
# or
npx expo start --android

# Web Browser
npm run web
# or
npx expo start --web
```

## Web Publishing Guide

### 1. Build for Web
```bash
# Create production build
npx expo export --platform web
```

This creates a `dist/` folder with static files ready for deployment.

### 2. Deployment Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from dist folder
cd dist
vercel --prod

# Or deploy directly from project root
vercel --prod --cwd dist
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from dist folder
cd dist
netlify deploy --prod --dir=.
```

#### Option C: GitHub Pages
1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings > Pages
4. Set source to "GitHub Actions"
5. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx expo export --platform web
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Option D: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Build and deploy
npx expo export --platform web
firebase deploy
```

#### Option E: AWS S3 + CloudFront
```bash
# Install AWS CLI and configure credentials
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 3. Custom Domain Setup

After deploying, you can set up a custom domain:

1. **Vercel**: Go to Project Settings > Domains
2. **Netlify**: Go to Site Settings > Domain Management
3. **GitHub Pages**: Go to Repository Settings > Pages
4. **Firebase**: Go to Hosting > Custom Domains

### 4. Environment Variables (Optional)

If you want to make the Gist URL configurable:

1. Create `.env` file:
```
GIST_URL=https://gist.githubusercontent.com/vishnu-meera/be8676f942b4d59685a4ddb7e0ab10f9/raw/08779ebe39431cc3431547b7e8b503110e93814d/tabs_2025-08-14_youtube.json
```

2. Update `services/gistService.ts`:
```typescript
const GIST_URL = process.env.GIST_URL || 'https://gist.githubusercontent.com/vishnu-meera/be8676f942b4d59685a4ddb7e0ab10f9/raw/08779ebe39431cc3431547b7e8b503110e93814d/tabs_2025-08-14_youtube.json';
```

3. Add environment variables to your deployment platform.

## Configuration

### Gist URL
The app fetches YouTube URLs from this Gist:
```
https://gist.githubusercontent.com/vishnu-meera/be8676f942b4d59685a4ddb7e0ab10f9/raw/08779ebe39431cc3431547b7e8b503110e93814d/tabs_2025-08-14_youtube.json
```

### YouTube Player Settings
The app configures the YouTube player with minimal overlays:
- No related videos (`rel: 0`)
- No YouTube branding (`modestbranding: 1`)
- No video info (`showinfo: 0`)
- No annotations (`iv_load_policy: 3`)
- No fullscreen button (`fs: 0`)

## Troubleshooting

### Web Issues
- **Module resolution errors**: Ensure `react-native-web-webview` and `react-native-webview` are installed
- **Metro bundling errors**: Check `metro.config.js` and `app.json` web configuration
- **YouTube player not loading**: Check browser console for CORS or iframe issues

### iOS Issues
- **Controls not visible**: Ensure proper flex layout and minimum heights
- **Video not playing**: Check iOS simulator settings and network connectivity

### Android Issues
- **App crashes**: Check Android emulator settings and permissions
- **Video not loading**: Ensure proper internet connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all platforms (iOS, Android, Web)
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
