
# OwnItRight - Property Advisory Platform Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [User Roles & Access](#user-roles--access)
5. [Admin Panel](#admin-panel)
6. [Customer Features](#customer-features)
7. [Reports & Analytics](#reports--analytics)
8. [Payment Integration](#payment-integration)
9. [Database & Migration](#database--migration)
10. [SEO & Performance](#seo--performance)
11. [API Documentation](#api-documentation)
12. [Deployment](#deployment)

## Overview

OwnItRight is a comprehensive property advisory platform designed for the Indian real estate market, specifically focused on Bengaluru properties. The platform provides property valuation, engineering assessments, legal due diligence, and investment guidance services.

### Key Capabilities
- **Property Discovery**: Advanced search and filtering for property listings
- **Valuation Reports**: Professional property valuation with market analysis
- **Civil & MEP Reports**: Engineering assessments and compliance checks
- **Lead Management**: Complete customer relationship management
- **Payment Processing**: Integrated Razorpay payment gateway
- **Admin Dashboard**: Comprehensive management interface

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Wouter for routing
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM, Supabase integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **Payment**: Razorpay integration
- **Analytics**: Google Analytics 4
- **Maps**: Google Maps API

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Express backend
├── shared/               # Shared schemas and types
├── migrations/           # Database migrations
└── public/               # Static assets
```

## Features

### Customer-Facing Features

#### Property Search & Discovery
- **Advanced Filtering**: Location, price range, property type, amenities
- **Interactive Maps**: Google Maps integration for location visualization
- **Property Cards**: Detailed property information with images
- **Mobile Responsive**: Optimized for all device sizes

#### Booking & Consultation
- **Site Visit Booking**: Schedule property visits
- **Expert Consultation**: Book advisory sessions
- **First-Time Buyer Onboarding**: Guided process for new investors

#### Reports & Documentation
- **Property Valuation Reports**: Comprehensive market analysis
- **Civil & MEP Reports**: Engineering assessments
- **Legal Audit Reports**: Due diligence documentation
- **Report Documentation**: Detailed explanation of report contents

### Admin Features

#### Property Management
- **CRUD Operations**: Add, edit, view, delete properties
- **Bulk Operations**: Import/export property data
- **Property Scoring**: Automated scoring based on multiple factors
- **Zone Management**: Geographic area management with appreciation rates

#### Lead & Customer Management
- **Lead Tracking**: Complete lead lifecycle management
- **Customer Profiles**: Detailed customer information
- **Communication History**: Track all interactions
- **Lead Scoring**: Automated qualification scoring

#### Revenue & Analytics
- **Order Management**: Track all service orders
- **Payment Processing**: Razorpay integration for secure payments
- **Revenue Analytics**: Financial reporting and trends
- **Performance Metrics**: KPIs and business intelligence

## User Roles & Access

### Customer Role
- Browse properties
- Book consultations and site visits
- Access purchased reports
- Manage account settings

### Admin Role
- Full access to admin panel
- Manage all properties and leads
- Generate and edit reports
- Configure system settings
- Access analytics and revenue data

### Authentication
- Supabase authentication system
- Role-based access control
- Secure session management
- Password reset functionality

## Admin Panel

### Dashboard
- **Key Metrics**: Properties, leads, revenue overview
- **Recent Activity**: Latest bookings and inquiries
- **Performance Charts**: Visual analytics and trends
- **Quick Actions**: Common administrative tasks

### Property Management
- **Properties List**: Paginated view with search/filter
- **Add Property**: Comprehensive form with validation
- **Edit Property**: Update existing property information
- **Property Scoring**: Automated scoring system
- **Zone Management**: Geographic area configuration

### Lead Management
- **Lead Pipeline**: Visual representation of lead stages
- **Lead Details**: Complete customer interaction history
- **Lead Scoring**: BANT methodology implementation
- **Communication Tools**: Email and SMS integration

### Reports Management
- **Civil & MEP Reports**: Engineering assessment reports
- **Valuation Reports**: Property market analysis reports
- **Legal Audit Reports**: Due diligence documentation
- **Report Templates**: Standardized report formats

### System Settings
- **API Keys**: Payment, maps, analytics configuration
- **Business Settings**: Company information and branding
- **User Management**: Team member access control
- **Backup System**: Data backup and restore functionality

## Customer Features

### Property Search
- **Search Interface**: Location-based property search
- **Filter Options**: Price, type, amenities, location filters
- **Property Details**: Comprehensive property information
- **Image Galleries**: High-quality property photos

### Booking System
- **Site Visits**: Schedule property viewing appointments
- **Consultation Booking**: Expert advisory sessions
- **Calendar Integration**: Available slot management
- **Confirmation System**: Email/SMS confirmations

### Report Access
- **My Reports**: Access to purchased reports
- **Download Options**: PDF and web view formats
- **Report History**: Previous report purchases
- **Support Access**: Help and documentation

## Reports & Analytics

### Property Valuation Reports
- **Market Analysis**: Comparative market analysis
- **Financial Projections**: ROI and appreciation forecasts
- **Risk Assessment**: Investment risk evaluation
- **Recommendations**: Expert investment advice

### Civil & MEP Reports
- **Structural Assessment**: Building safety and compliance
- **MEP Systems**: Mechanical, electrical, plumbing evaluation
- **Fire Safety**: Safety system compliance
- **Green Building**: Sustainability assessment

### Analytics Dashboard
- **Revenue Tracking**: Monthly and yearly revenue trends
- **Lead Analytics**: Conversion rates and pipeline analysis
- **Property Performance**: Most viewed and inquired properties
- **User Behavior**: Customer interaction patterns

## Payment Integration

### Razorpay Integration
- **Secure Payments**: Industry-standard security
- **Multiple Methods**: Cards, UPI, net banking, wallets
- **Order Management**: Complete order lifecycle tracking
- **Refund Processing**: Automated refund handling

### Payment Flow
1. Service selection and pricing
2. Secure checkout with Razorpay
3. Payment confirmation and receipt
4. Service delivery and report generation

## Database & Migration

### Current Database
- **PostgreSQL**: Primary database with Drizzle ORM
- **Supabase Integration**: Migration-ready setup
- **Data Backup**: Automated backup system
- **Migration Tools**: Seamless database transitions

### Supabase Migration
- **One-Click Migration**: Automated data transfer
- **Zero Downtime**: Seamless transition process
- **Data Validation**: Complete data integrity checks
- **Rollback Capability**: Safe migration with rollback options

## SEO & Performance

### SEO Optimization
- **Meta Tags**: Dynamic meta tag management
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: Comprehensive sitemap generation
- **Open Graph**: Social media optimization

### Performance Features
- **Service Worker**: Caching for improved load times
- **Image Optimization**: Lazy loading and compression
- **Code Splitting**: Optimized bundle sizes
- **CDN Integration**: Fast content delivery

## API Documentation

### Core Endpoints

#### Properties API
```
GET /api/properties - List all properties
GET /api/properties/:id - Get property details
POST /api/properties - Create new property (Admin)
PUT /api/properties/:id - Update property (Admin)
DELETE /api/properties/:id - Delete property (Admin)
```

#### Leads API
```
GET /api/customers - List all leads (Admin)
POST /api/customers - Create new lead
PUT /api/customers/:id - Update lead (Admin)
GET /api/customers/stats - Lead statistics (Admin)
```

#### Reports API
```
GET /api/valuation-reports - List reports (Admin)
POST /api/valuation-reports - Create report (Admin)
GET /api/civil-mep-reports - List MEP reports (Admin)
POST /api/civil-mep-reports - Create MEP report (Admin)
```

#### Settings API
```
GET /api/settings - Get system settings
PUT /api/settings - Update settings (Admin)
GET /api/settings/api-keys - Get API keys (Admin)
PUT /api/settings/api-keys - Update API keys (Admin)
```

## Deployment

### Replit Deployment
The application is configured for seamless deployment on Replit:

1. **Development**: `npm run dev` - Starts development server on port 5000
2. **Production**: Automatic deployment with optimized build
3. **Environment Variables**: Secure secret management
4. **Custom Domain**: Custom domain configuration support

### Environment Variables
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GOOGLE_ANALYTICS_ID=...
GOOGLE_MAPS_API_KEY=...
```

### Monitoring & Maintenance
- **Health Checks**: Automated application health monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Real-time performance metrics
- **Backup Schedule**: Regular automated backups

---

**Last Updated**: January 5, 2025  
**Version**: 1.0.0  
**Support**: Available through admin panel or contact@ownitright.com
