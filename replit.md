# OwnitWise - Property Management Dashboard

## Overview
OwnitWise is a comprehensive full-stack platform for property management and customer discovery in the Indian real estate market. It integrates an admin property management system with a customer-facing property finder, facilitating property search, site visit bookings, and consultation requests. The platform aims to provide a seamless and transparent experience for property managers and prospective buyers, enhancing efficiency and trust in real estate transactions through features like real-time data integration, RERA compliance, zoning information, legal due diligence tracking, and professional property valuation reports. Its business vision includes providing comprehensive solutions that integrate real data with sophisticated customer experience, focusing on customer-facing features and seamless user workflows.

## User Preferences
Preferred communication style: Simple, everyday language.
Project approach: User appreciates comprehensive solutions that integrate real data with sophisticated customer experience.
Focus areas: Customer-facing features, real data integration, and seamless user workflows.
UI Design preferences: Clean, minimal design without unnecessary panels or borders. Prefer simple layouts that encourage clicking to view details rather than multiple action buttons. Match labels should be displayed in brackets at the top of cards. Strongly prefers compact, table-based interfaces over verbose card layouts for admin panels - values data density and efficiency. NEVER show "Price on request" - always display actual pricing using configurations, valuation reports, or calculated estimates based on market rates.
Messaging preference: Personalized messaging that makes customers "feel us, our message" rather than sounding like an organization. Content should be human-centered and relatable.
Admin Layout Consistency: ALL admin pages MUST maintain admin sidebar and topbar using AdminLayout component. This includes Supabase Migration and all future admin pages.
Admin Sidebar Organization: Grouped menu structure with collapsible sections - Customer Relations (customers, developers, team management, enhanced leads), Reports (civil/MEP reports, valuation reports, legal tracker, property scoring, analytics), Property Management (properties, zones), with single items (dashboard, blog, orders, settings, database migration) remaining ungrouped.

## System Architecture

### Frontend Architecture
The frontend is a React-based single-page application built with TypeScript, utilizing functional components and hooks. Styling is managed with Tailwind CSS and the shadcn/ui component library. State management and caching for server data are handled by TanStack Query (React Query), while Wouter provides lightweight client-side routing. Form management leverages React Hook Form with Zod for type-safe validation. File uploads are integrated using Uppy.

### Backend Architecture
The backend is an Express.js RESTful API server implemented in TypeScript. It includes middleware for logging, error handling, and request parsing. Database integration is managed via Drizzle ORM for PostgreSQL. The system includes an abstracted storage interface with both in-memory and cloud storage capabilities. Development uses Vite for hot module replacement.

### Database Design
PostgreSQL is the primary database with a hierarchical city-wise structure: City > Zones > Properties. The schema includes comprehensive fields for properties, covering location, specifications, legal compliance, and media storage. Cities contain zones, and properties are linked to both cityId and zoneId for geographical organization and scalability. Data validation is ensured by shared Zod schemas between the frontend and backend, and Drizzle Kit is used for database schema migrations.

### API Structure
The API follows RESTful principles, providing standard CRUD operations for entities like properties. It supports advanced property search and filtering. Request validation is implemented using Zod schemas, and a centralized error handling system provides appropriate HTTP status codes.

### Key Features
- **Property Management**: Full CRUD operations for detailed property specifications and city-wise zone management.
- **Customer Property Discovery**: Advanced property finder with intelligent matching, filtering, and persistent search preferences.
- **Booking System**: Site visit and consultation booking with confirmation workflows and WhatsApp notifications.
- **Legal Due Diligence**: A 12-step tracker for legal verification, with admin and user panel interfaces and document management.
- **Professional Property Valuation Reports**: User-facing valuation reports with detailed property specifications, cost breakdowns, market analysis, risk assessment, and workflow management.
- **Order & Revenue Management**: Comprehensive revenue tracking and financial operation tools.
- **Lead Management System**: Comprehensive lead management with automated scoring, conversion funnel visualization, and nurturing campaigns.
- **Blog Management System**: Admin panel for full CRUD operations on blog posts, content categories, and SEO metadata.
- **Team Management System**: Complete CRUD operations with role-based access control and performance scoring.
- **Comprehensive Backup System**: Complete backup and recovery system with four backup types, real-time progress tracking, and secure download functionality.
- **Automated Setup System**: Commercial distribution system with automated database setup wizard for buyers, including schema creation, data seeding, and secure configuration saving.
- **Data Transparency System**: Platform-wide data transparency indicators including verification badges and data source explanations to build user trust.
- **Expert Credentials System**: Professional showcase system with detailed expert profiles, qualifications, and verification counts.
- **Branding & UI/UX**: Premium brand identity with an organic, natural aesthetic inspired by Sprout & Bloom Playschool's friendly design approach. Features a sophisticated teal-green color palette (Blue Black #021C1E, Cadet Blue #004445, Rain #2C7873, Greenery #6FB98F) with an elegant organic logo design including home icon with sprouting elements and serif typography. Enhanced home pages, global header, and a modern admin panel and user dashboard design inspired by a conversion-focused approach. Recently updated (Aug 2025) with organic logo redesign and natural aesthetic refresh.

## External Dependencies

### Database & Authentication Services
- **PostgreSQL**: Primary database.
- **Supabase**: Optional authentication platform, also used for unified database, real-time updates, built-in file storage, and row-level security.
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
- **Uppy**: Modular file uploader with dashboard, drag-drop, and cloud storage integrations.

### Commercial Distribution
- **Automated Setup System**: Web-based onboarding wizard with Supabase credential input, automated schema creation, and secure configuration storage.
- **Deployment Configurations**: Ready-to-use configs for Vercel, Netlify, Railway, and Docker deployment.

### Other Integrations
- **Interakt API**: For WhatsApp notification system.