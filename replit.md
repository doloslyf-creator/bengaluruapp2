# Property Management Dashboard

## Overview

This is a comprehensive full-stack property management and customer discovery platform built with Express.js backend and React frontend. The system combines admin property management with a sophisticated customer-facing property finder that enables property search, booking site visits, and consultation requests. It focuses on Indian real estate market features including RERA compliance, zoning information, and regional categorization with real-time integration between admin panel data and customer experience.

## Recent Changes (August 2025)

**Single Property Detail Page (Completed - August 2025)**
- Created comprehensive property detail page at `/property/:id` route
- Designed unique layout with combined video/image slider and tabbed information
- Implemented clickable property cards in results page with hover effects (removed separate "View Details" button)
- Integrated all property data including configurations, tags, RERA info, and investment metrics
- Built responsive design with mobile-friendly sticky header and action buttons
- Added property comparison features and similar property recommendations
- **YouTube Video Integration**: Added YouTube video field (videoUrl) to property schema and updated database to support property overview videos
- **Combined Media Slider**: Unified video and image display with navigation arrows, thumbnails, and media indicators
- **Image Upload System**: Added drag-and-drop image upload functionality to admin panel with preview and delete options
- **Functional Share Button**: Implemented native sharing with Web Share API fallback to clipboard copy
- **WhatsApp Direct Sharing**: Added dedicated WhatsApp share button with formatted message including property details
- **Dynamic Similar Properties**: Implemented intelligent property matching algorithm with weighted scoring based on zone, type, developer, status, and tags

**Enhanced Property Detail Widgets (Completed - August 2025)**
- **Property Score Widget**: Overall rating system with detailed breakdowns for location, amenities, and value for money with real database scoring
- **Price Comparison Widget**: Comparative analysis against area and city averages with value assessment indicators and admin-managed data

**Legal Due Diligence System (Completed - August 2025)**
- **Comprehensive Legal Metadata**: 16 structured legal fields covering title clearance, ownership, RERA compliance, documentation, and approvals
- **4-Tab Admin Interface**: Extended admin panel with dedicated Legal tab for managing all legal metadata with proper form validation
- **Legal Tab in Property Detail**: Professional display of legal information with status badges, document links, and compliance indicators
- **Database Schema Integration**: Added all legal fields to PostgreSQL schema with proper types and relationships

**Authentication Removal (Completed - August 2025)**
- Completely removed Firebase and all authentication systems from the application
- Made admin panel directly accessible without login requirements at /admin-panel
- Updated all admin pages to remove authentication dependencies and logout functionality
- Fixed TypeScript errors in leads.tsx that were preventing application from running
- Removed Firebase package from dependencies and cleaned up all authentication imports

**Lead Management System (Previously Completed)**
- Built comprehensive lead management dashboard with filtering, search, and detailed lead views
- Implemented automatic lead generation from customer bookings and consultations
- Created lead scoring system (60 points for site visits, 75 points for consultations)
- Added activity tracking, note-taking, and lead qualification workflows  
- Integrated lead statistics and conversion tracking with real-time analytics
- Updated admin navigation across all pages to include leads management
- System automatically converts every customer interaction into qualified leads with complete contact information

**Customer Property Finder System (Previously Completed)**
- Built complete 4-page customer journey: Find Property → Property Results → Book Visit → Consultation
- Implemented advanced property matching algorithm with weighted scoring (type 30%, zone 25%, budget 25%, tags 15%, BHK 5%)
- Added localStorage caching system for search preferences that persist across navigation
- Enhanced property results with multiple sorting options (Best Match, Price Low/High, Name A-Z)
- Created advanced filtering panel with budget slider, zone selection, property type, and feature filters
- Integrated real admin panel data extraction for zones, property types, and tags (no hardcoded options)
- Fixed property selection dropdowns to dynamically populate from actual database properties
- Implemented comprehensive booking system for site visits and consultations with confirmation workflows

## User Preferences

Preferred communication style: Simple, everyday language.
Project approach: User appreciates comprehensive solutions that integrate real data with sophisticated customer experience.
Focus areas: Customer-facing features, real data integration, and seamless user workflows.

## Authentication

- **Firebase OTP Authentication**: Complete client-side authentication system
- Admin phone number: +91 95603 66601 (authorized for admin access)
- Firebase phone number verification with reCAPTCHA
- Environment variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID, VITE_FIREBASE_PROJECT_ID
- No server-side authentication routes needed (Firebase handles everything)
- Secure OTP delivery via Firebase SMS service

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **File Uploads**: Uppy integration for file upload capabilities with cloud storage support

### Backend Architecture
- **Express.js**: RESTful API server with middleware for logging, error handling, and request parsing
- **TypeScript**: Type-safe server implementation with shared schemas
- **Database Integration**: Drizzle ORM configured for PostgreSQL with schema-first approach
- **Storage Layer**: Abstracted storage interface with in-memory implementation and cloud storage capabilities
- **Development Setup**: Vite integration for hot module replacement in development

### Database Design
- **PostgreSQL**: Primary database with Drizzle ORM for type-safe queries
- **Schema Structure**: Properties table with comprehensive fields including location, specifications, legal compliance, and media storage
- **Data Validation**: Shared Zod schemas between frontend and backend for consistent validation
- **Migration Support**: Drizzle Kit for database schema migrations

### API Structure
- **RESTful Endpoints**: Standard CRUD operations for properties (`/api/properties`)
- **Search & Filtering**: Advanced property search with multiple filter criteria
- **Validation Layer**: Request validation using Zod schemas
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Request/response logging for API monitoring

### Key Features
- **Property Management**: Full CRUD operations with detailed property specifications
- **Customer Property Discovery**: Advanced property finder with intelligent matching and filtering
- **Indian Market Focus**: RERA compliance tracking, zone-based categorization, and regional pricing
- **Media Support**: Image and video upload capabilities for property listings
- **Advanced Search**: Text search across property names, developers, and locations
- **Intelligent Filtering**: Dynamic multi-criteria filtering by type, status, zone, price range, and features
- **Booking System**: Site visit and consultation booking with confirmation workflows
- **Dashboard Analytics**: Property statistics and summary information
- **Persistent Preferences**: Customer search preferences cached across sessions
- **Real-time Data Integration**: Customer dropdowns populated from actual admin panel data

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL database hosting via `@neondatabase/serverless`
- **Drizzle ORM**: Database toolkit with PostgreSQL dialect for type-safe queries

### Cloud Storage
- **Google Cloud Storage**: File storage service via `@google-cloud/storage`
- **AWS S3**: Alternative cloud storage support through Uppy integration

### UI Components
- **Radix UI**: Accessible component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind CSS
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and development server with React plugin
- **ESBuild**: Fast bundler for production builds
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### File Upload
- **Uppy**: Modular file uploader with dashboard, drag-drop, and cloud storage integrations
- **Multiple Providers**: Support for AWS S3, Google Cloud, and other storage backends