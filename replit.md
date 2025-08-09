# OwnItRight - Property Management Dashboard

## Overview
OwnItRight is a comprehensive full-stack platform for property management and customer discovery in the Indian real estate market. It integrates an admin property management system with a customer-facing property finder. The platform aims to provide a seamless and transparent experience for both property managers and prospective buyers, enhancing efficiency and trust in real estate transactions. Key capabilities include real-time data integration, RERA compliance features, zoning information, regional categorization, a legal due diligence tracker, and professional property valuation reports.

## User Preferences
Preferred communication style: Simple, everyday language.
Project approach: User appreciates comprehensive solutions that integrate real data with sophisticated customer experience.
Focus areas: Customer-facing features, real data integration, and seamless user workflows.
UI Design preferences: Clean, minimal design without unnecessary panels or borders. Prefer simple layouts that encourage clicking to view details rather than multiple action buttons. Match labels should be displayed in brackets at the top of cards. Strongly prefers compact, table-based interfaces over verbose card layouts for admin panels - values data density and efficiency. NEVER show "Price on request" - always display actual pricing using configurations, valuation reports, or calculated estimates based on market rates. For detail pages: Use minimal approach with boxed layouts only - simple Card components without complex nested arrangements.
Messaging preference: Personalized messaging that makes customers "feel us, our message" rather than sounding like an organization. Content should be human-centered and relatable.
Admin Layout Consistency: ALL admin pages MUST maintain admin sidebar and topbar using AdminLayout component. This includes Supabase Migration and all future admin pages.
Admin Sidebar Organization: Grouped menu structure with collapsible sections - Customer Relations (customers, developers, team management, enhanced leads), Reports (civil/MEP reports, valuation reports, legal tracker, property scoring, analytics), Property Management (properties, zones), with single items (dashboard, blog, orders, settings, database migration) remaining ungrouped.

## System Architecture

### Frontend
The frontend is a React-based single-page application built with TypeScript, utilizing functional components and hooks. Styling is managed with Tailwind CSS and the shadcn/ui component library. State management and caching for server data are handled by TanStack Query (React Query), while Wouter provides lightweight client-side routing. Form management leverages React Hook Form with Zod for type-safe validation. File uploads are integrated using Uppy.

### Backend
The backend is an Express.js RESTful API server implemented in TypeScript. It includes middleware for logging, error handling, and request parsing. Database integration is managed via Drizzle ORM for PostgreSQL. The system includes an abstracted storage interface with both in-memory and cloud storage capabilities. Development uses Vite for hot module replacement.

### Database Design
PostgreSQL is the primary database with a hierarchical city-wise structure: City > Zones > Properties. The schema includes comprehensive fields for properties, covering location, specifications, legal compliance, and media storage. Cities contain zones, and properties are linked to both cityId and zoneId for geographical organization and scalability. Data validation is ensured by shared Zod schemas between the frontend and backend, and Drizzle Kit is used for database schema migrations.

### API Structure
The API follows RESTful principles, providing standard CRUD operations for entities like properties. It supports advanced property search and filtering. Request validation is implemented using Zod schemas, and a centralized error handling system provides appropriate HTTP status codes.

### Key Features
- **Property Management**: Full CRUD operations for detailed property specifications and zone management.
- **Customer Property Discovery**: Advanced property finder with intelligent matching, filtering, persistent search preferences, and intent-based property detail pages.
- **Indian Market Focus**: Zone-based categorization and regional pricing.
- **Media Support**: Image and video upload capabilities for property listings.
- **Booking System**: Site visit and consultation booking with confirmation workflows.
- **Legal Due Diligence**: A 12-step tracker for legal verification with document management.
- **Professional Property Valuation Reports**: User-facing valuation reports with detailed property specifications, cost breakdowns, market analysis, and risk assessment.
- **Order & Revenue Management**: Comprehensive revenue tracking and financial operation tools.
- **Lead Management System**: Comprehensive lead management with automated scoring and pipeline management.
- **Blog Management System**: Admin panel for full CRUD operations on blog posts.
- **Branding**: "OwnItRight" brand update with custom wordmark logo.
- **Enhanced Home Pages & Global Header**: Redesigned customer-facing and admin home pages with modern, mobile-responsive design.
- **Team Management System**: Complete CRUD operations with role-based access control.
- **Supabase Integration**: Complete migration to Supabase for unified database and authentication, including email/password authentication, real-time database updates, built-in file storage, automatic API generation, and row-level security.
- **Comprehensive Backup System**: Full system backup and recovery with various backup types, real-time progress tracking, and secure download functionality.
- **About Us Brand Story Page**: Compelling brand story page integrated into header navigation.
- **Staysaavy-Inspired Design Overhaul**: Complete redesign of all major pages following modern conversion-focused approach including admin panel and user dashboard.
- **Automated Supabase Setup System**: Commercial distribution system with automated database setup wizard for buyers, including deployment configurations for Vercel, Netlify, Railway, and Docker.
- **Comprehensive Data Transparency System**: Platform-wide data transparency indicators including verification badges and data source explanations to build visitor trust.
- **Expert Credentials System**: Comprehensive professional showcase system with detailed expert profiles integrated into property detail pages and reports.
- **High-Conversion Homepage**: Redesigned homepage with conversion-focused, urgency-driven content, social proof, and strong call-to-action elements.

## External Dependencies

### Database & Authentication Services
- **PostgreSQL**: Primary database.
- **Supabase**: Optional authentication platform.
- **Drizzle ORM**: Database toolkit for type-safe queries.

### Cloud Storage
- **Google Cloud Storage**: Primary file storage service.
- **AWS S3**: Supported as an alternative cloud storage option via Uppy integration.

### UI Components
- **Radix UI**: Accessible component primitives.
- **shadcn/ui**: Pre-built component library for consistent UI.
- **Lucide React**: Icon library.

### Development Tools
- **Vite**: Build tool and development server.
- **ESBuild**: Fast bundler.
- **TypeScript**: Type checking and compilation.
- **Tailwind CSS**: Utility-first CSS framework.

### File Upload
- **Uppy**: Modular file uploader.

### Commercial Distribution
- **Automated Setup System**: Web-based onboarding wizard for Supabase.
- **Deployment Configurations**: For Vercel, Netlify, Railway, and Docker.