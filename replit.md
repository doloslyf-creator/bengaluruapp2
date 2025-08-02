# OwnItRight - Property Management Dashboard

## Overview
OwnItRight is a comprehensive full-stack platform for property management and customer discovery, specifically tailored for the Indian real estate market. It integrates an admin property management system with a customer-facing property finder, facilitating property search, site visit bookings, and consultation requests. Key capabilities include real-time data integration, RERA compliance features, zoning information, regional categorization, a legal due diligence tracker, and professional property valuation reports. The platform aims to provide a seamless and transparent experience for both property managers and prospective buyers, enhancing efficiency and trust in real estate transactions.

## User Preferences
Preferred communication style: Simple, everyday language.
Project approach: User appreciates comprehensive solutions that integrate real data with sophisticated customer experience.
Focus areas: Customer-facing features, real data integration, and seamless user workflows.
UI Design preferences: Clean, minimal design without unnecessary panels or borders. Prefer simple layouts that encourage clicking to view details rather than multiple action buttons. Match labels should be displayed in brackets at the top of cards. Strongly prefers compact, table-based interfaces over verbose card layouts for admin panels - values data density and efficiency.

## System Architecture

### Frontend Architecture
The frontend is a React-based single-page application built with TypeScript, utilizing functional components and hooks. Styling is managed with Tailwind CSS and the shadcn/ui component library. State management and caching for server data are handled by TanStack Query (React Query), while Wouter provides lightweight client-side routing. Form management leverages React Hook Form with Zod for type-safe validation. File uploads are integrated using Uppy.

### Backend Architecture
The backend is an Express.js RESTful API server implemented in TypeScript. It includes middleware for logging, error handling, and request parsing. Database integration is managed via Drizzle ORM for PostgreSQL. The system includes an abstracted storage interface with both in-memory and cloud storage capabilities. Development uses Vite for hot module replacement.

### Database Design
PostgreSQL is the primary database, accessed through Drizzle ORM for type-safe queries. The schema includes comprehensive fields for properties, covering location, specifications, legal compliance, and media storage. Data validation is ensured by shared Zod schemas between the frontend and backend, and Drizzle Kit is used for database schema migrations.

### API Structure
The API follows RESTful principles, providing standard CRUD operations for entities like properties. It supports advanced property search and filtering. Request validation is implemented using Zod schemas, and a centralized error handling system provides appropriate HTTP status codes.

### Key Features
- **Property Management**: Full CRUD operations for detailed property specifications.
- **Customer Property Discovery**: Advanced property finder with intelligent matching, filtering, and persistent search preferences.
- **Indian Market Focus**: RERA compliance tracking, zone-based categorization, and regional pricing.
- **Media Support**: Image and video upload capabilities for property listings, with a combined media slider.
- **Booking System**: Site visit and consultation booking with confirmation workflows.
- **Legal Due Diligence**: A 12-step tracker for legal verification, with admin and user panel interfaces, document management, and progress visualization.
- **Professional Property Valuation Reports**: User-facing valuation reports with detailed property specifications, cost breakdowns, market analysis, and risk assessment.
- **CIVIL+MEP Report System**: Engineering report ordering with "pay later" functionality and comprehensive order management. Features a compact table-based admin interface for efficient property and report management.
- **Order & Revenue Management**: Comprehensive revenue tracking with monthly trends analysis, payment status monitoring, service-wise revenue breakdown, and financial operation tools including automated payment reminders and invoice generation.
- **Lead Management System**: Comprehensive lead management with automated scoring (15-30 points per activity), qualification criteria (BANT methodology), conversion funnel visualization, pipeline management, and nurturing campaigns with performance analytics.
- **Blog Management System**: Admin panel for full CRUD operations on blog posts, content categories, and SEO metadata.
- **Branding**: "OwnItRight" brand update across the application with a custom wordmark logo.
- **Enhanced Home Pages & Global Header**: Complete redesign of both customer-facing and admin home pages with modern, mobile-responsive design. Global header with scroll effects, comprehensive navigation, services dropdown, and enhanced mobile menu experience.

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL database hosting.
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
- **Uppy**: Modular file uploader with dashboard, drag-drop, and cloud storage integrations for various providers (AWS S3, Google Cloud).