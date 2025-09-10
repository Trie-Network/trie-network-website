# Deployment Guide

## Environment Variables Required

The wallet connection issue in production is caused by missing environment variables. You need to set the following environment variable in your production deployment:

### Required Environment Variable:
```bash
VITE_NETWORK=devnet
```

### Supported Values:
- `mainnet` - Production network
- `testnet` - Test network (default fallback)
- `devnet` - Development network (recommended for testing)

### How It Works:
```typescript
// Simple and clean implementation
export const CURRENT_NETWORK: string = import.meta.env.VITE_NETWORK || 'testnet';

// Boolean flags derived from CURRENT_NETWORK
export const isMainnet = CURRENT_NETWORK === 'mainnet';
export const isTestnet = CURRENT_NETWORK === 'testnet';
export const isDevnet = CURRENT_NETWORK === 'devnet';
```

## Deployment Platforms

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `VITE_NETWORK` = `devnet`

### Netlify
1. Go to Site settings
2. Navigate to "Environment variables"
3. Add: `VITE_NETWORK` = `devnet`

### GitHub Pages / Static Hosting
Create a `.env.production` file in your project root:
```
VITE_NETWORK=devnet
```

### Docker
Add to your Dockerfile or docker-compose.yml:
```dockerfile
ENV VITE_NETWORK=devnet
```

## Why This Fixes the Issue

1. **Local Development**: Your local environment has `VITE_NETWORK` set, so wallet connection works
2. **Production**: Without `VITE_NETWORK`, the app defaults to `TESTNET` network
3. **Network Mismatch**: Different networks use different:
   - API endpoints
   - Contract addresses
   - WebSocket connections
   - Token configurations

## Verification

After setting the environment variable:
1. Redeploy your application
2. Check browser console for network configuration logs
3. Test wallet connection functionality

## Network Configuration Details

The app uses different configurations based on `VITE_NETWORK`:

- **devnet**: Development endpoints and contracts
- **testnet**: Test network endpoints and contracts  
- **mainnet**: Production endpoints and contracts

Without this variable, the app defaults to testnet configuration, which may not match your expected network setup.
