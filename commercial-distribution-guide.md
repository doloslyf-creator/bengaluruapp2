# Commercial Distribution Guide - OwnItRight Platform

## Overview
This guide explains how to distribute and deploy the OwnItRight platform for commercial buyers, including automated Supabase setup for seamless onboarding.

## Distribution Methods

### 1. One-Click Deploy Platforms

#### Vercel Deployment
```bash
# Add to your repository root
# vercel.json
{
  "build": {
    "env": {
      "SETUP_MODE": "auto"
    }
  },
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "server/index.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

#### Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  SETUP_MODE = "auto"
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200
```

#### Railway Deployment
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 2. Docker Distribution

Create a Docker container for easy deployment:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/setup/status || exit 1

# Start the application
CMD ["npm", "start"]
```

### 3. Manual Installation

Provide buyers with this installation script:

```bash
#!/bin/bash
# install.sh

echo "Installing OwnItRight Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required. Please install Node.js 18+ first."
    exit 1
fi

# Clone repository (replace with your actual repo)
git clone https://github.com/your-org/ownitright-platform.git
cd ownitright-platform

# Install dependencies
npm install

# Start the application
npm run dev

echo "Installation complete! Please visit http://localhost:5000/setup to configure your platform."
```

## Automated Setup Process

### How It Works

1. **First Launch Detection**: When the application starts, it checks for required environment variables
2. **Setup Redirect**: If setup is needed, users are automatically redirected to `/setup`
3. **Credential Collection**: Users provide their Supabase project URL and service role key
4. **Automated Configuration**: The system:
   - Validates the Supabase connection
   - Creates all required database tables and schemas
   - Seeds initial data (zones, settings, etc.)
   - Saves configuration securely
5. **Ready to Use**: Platform is immediately ready for use

### Setup Flow for Buyers

```mermaid
graph TD
    A[Deploy Platform] --> B[First Launch]
    B --> C{Setup Required?}
    C -->|Yes| D[Redirect to /setup]
    C -->|No| E[Go to Dashboard]
    D --> F[Enter Supabase Credentials]
    F --> G[Validate Connection]
    G --> H[Create Database Schema]
    H --> I[Seed Initial Data]
    I --> J[Save Configuration]
    J --> K[Setup Complete]
    K --> E[Go to Dashboard]
```

## Environment Variables

### Required for Production
```bash
# Supabase Configuration (set during setup)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Database Connection (automatically generated)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Application Settings
NODE_ENV=production
PORT=5000

# Optional: Analytics & Payments
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Platform-Specific Variables

#### Vercel
```bash
VERCEL_URL=your-app.vercel.app
```

#### Netlify
```bash
NETLIFY_SITE_URL=your-app.netlify.app
```

#### Railway
```bash
RAILWAY_STATIC_URL=your-app.railway.app
```

## Buyer Onboarding Instructions

### Step 1: Deploy the Platform
Choose your preferred deployment method:
- **Vercel**: Click "Deploy" button on your sales page
- **Netlify**: Fork repository and connect to Netlify
- **Railway**: One-click deploy from template
- **Manual**: Download and run installation script

### Step 2: Prepare Supabase Project
Before setup, buyers need:
1. Create a new Supabase project at https://supabase.com
2. Note the project URL and service role key from Settings > API
3. Optionally set up a custom domain

### Step 3: Complete Automated Setup
1. Visit your deployed platform URL
2. You'll be automatically redirected to the setup wizard
3. Enter your Supabase credentials
4. Wait for automatic database creation and configuration
5. Access your admin panel when setup completes

### Step 4: Configure Your Platform
1. Update business information in Settings
2. Add your API keys (payments, analytics, etc.)
3. Customize branding and colors
4. Add initial property data

## Support & Troubleshooting

### Common Issues

#### Setup Fails During Database Creation
- **Solution**: Check Supabase service role key permissions
- Ensure the key has full database access

#### Environment Variables Not Saved
- **Vercel**: Add variables in dashboard under Settings > Environment Variables
- **Netlify**: Add in Site Settings > Build & Deploy > Environment Variables
- **Railway**: Add in project Settings > Variables

#### Connection Timeout
- **Solution**: Check if Supabase project is paused (reactivate it)
- Verify project URL format

### Getting Help
- Documentation: Included in `/docs` folder
- Video Tutorial: Link to setup walkthrough
- Support Email: support@ownitright.com
- Live Chat: Available in admin panel

## Security Considerations

### Production Checklist
- [ ] Use HTTPS only
- [ ] Set secure environment variables
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Configure CORS properly
- [ ] Use strong passwords
- [ ] Regular security updates

### Data Protection
- All sensitive data is encrypted
- Database credentials are secured in environment variables
- Supabase provides built-in security features
- Regular automated backups included

## Scaling & Performance

### Optimization Tips
1. **Database**: Supabase auto-scales based on usage
2. **CDN**: Use platform CDN (Vercel, Netlify) for static assets
3. **Caching**: Redis cache available as add-on
4. **Monitoring**: Built-in analytics and error tracking

### Usage Limits
- **Free Tier**: Suitable for small agencies (up to 500MB database)
- **Pro Tier**: Recommended for growing businesses
- **Team Tier**: For enterprises with multiple users

## Post-Purchase Support

### What's Included
- ✅ Complete platform setup
- ✅ 90 days of technical support
- ✅ Feature updates and bug fixes
- ✅ Documentation and video tutorials
- ✅ Community access

### Additional Services
- 🔧 Custom branding and design
- 🔧 Additional integrations
- 🔧 Training and onboarding
- 🔧 Priority support

---

**Note**: This platform is designed for property consultants and real estate professionals in the Indian market, with specific focus on Bengaluru property regulations and RERA compliance.