# OwnItRight - Property Management Dashboard

## Overview
OwnItRight is a comprehensive full-stack platform for property management and customer discovery for the Indian real estate market. It integrates an admin property management system with a customer-facing property finder, facilitating property search, site visit bookings, and consultation requests. Key capabilities include real-time data integration, RERA compliance features, zoning information, regional categorization, a legal due diligence tracker, and professional property valuation reports. The platform aims to provide a seamless and transparent experience for both property managers and prospective buyers, enhancing efficiency and trust in real estate transactions.

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

### Database Design - City-Wise Architecture (Updated August 2025)
PostgreSQL is the primary database with a hierarchical city-wise structure: City > Zones > Properties. The schema includes comprehensive fields for properties, covering location, specifications, legal compliance, and media storage. Cities contain zones, and properties are linked to both cityId and zoneId for geographical organization and scalability. Data validation is ensured by shared Zod schemas between the frontend and backend, and Drizzle Kit is used for database schema migrations. Complete zone management system implemented with full CRUD operations, including proper handling of decimal fields for market data and infrastructure scoring.

### API Structure
The API follows RESTful principles, providing standard CRUD operations for entities like properties. It supports advanced property search and filtering. Request validation is implemented using Zod schemas, and a centralized error handling system provides appropriate HTTP status codes.

### Key Features
- **Property Management**: Full CRUD operations for detailed property specifications.
- **Customer Property Discovery**: Advanced property finder with intelligent matching, filtering, and persistent search preferences.
- **Indian Market Focus**: Zone-based categorization and regional pricing.
- **Media Support**: Image and video upload capabilities for property listings, with a combined media slider.
- **Booking System**: Site visit and consultation booking with confirmation workflows.
- **Legal Due Diligence**: A 12-step tracker for legal verification, with admin and user panel interfaces, document management, and progress visualization.
- **Professional Property Valuation Reports**: User-facing valuation reports with detailed property specifications, cost breakdowns, market analysis, and risk assessment.
- **Comprehensive Property Valuation Reports**: Complete Bengaluru-focused valuation system with 40+ detailed fields including executive summary, market analysis, location scoring, legal compliance, rental yield calculations, and investment recommendations. Features full CRUD operations, multiple customer assignment system, workflow management (draft → in progress → completed → delivered), comprehensive edit interface with multi-customer assignment dialog, and unified comprehensive create form matching all edit form fields with tabbed navigation for better UX.
- **Property Reports System (Removed)**: Customer-facing property reports page temporarily removed from system pending future planning.
- **Order & Revenue Management**: Comprehensive revenue tracking with monthly trends analysis, payment status monitoring, service-wise revenue breakdown, and financial operation tools.
- **Lead Management System**: Comprehensive lead management with automated scoring, qualification criteria (BANT methodology), conversion funnel visualization, pipeline management, and nurturing campaigns.
- **Blog Management System**: Admin panel for full CRUD operations on blog posts, content categories, and SEO metadata.
- **Branding**: "OwnItRight" brand update across the application with a custom wordmark logo.
- **Enhanced Home Pages & Global Header**: Redesigned customer-facing and admin home pages with modern, mobile-responsive design. Global header with scroll effects, comprehensive navigation, services dropdown, and enhanced mobile menu.
- **Team Management System**: Complete CRUD operations with role-based access control, performance scoring, universal sidebar with filters, and professional UI design.
- **Supabase Integration**: Complete migration to Supabase for unified database and authentication, including email/password authentication, real-time database updates, built-in file storage, automatic API generation, and row-level security. Admin and user dashboards are protected with dedicated authentication forms and role-based access control.
- **Comprehensive Backup System**: Complete backup and recovery system with four backup types (Full System, Database Only, Files & Media, Configuration), real-time progress tracking, ZIP compression, automatic cleanup, and secure download functionality. Integrated into admin panel with professional UI.
- **About Us Brand Story Page**: Compelling brand story page featuring Priti and Zaki's founder story, buyer-first philosophy, and critique-focused approach to builder properties. Integrated into header navigation with professional design and motion animations.
- **Staysaavy-Inspired Design Overhaul**: Complete redesign of all major pages following modern conversion-focused approach with countdown timers, bold benefit-driven headlines, interactive savings demos, social proof indicators, clear pricing structures, testimonials with specific savings amounts, and strong call-to-action elements throughout the user journey.
- **Modern Admin Panel Enhancement**: Complete transformation of admin panel with Staysaavy-inspired design consistency including promotional banners, hero sections, gradient backgrounds, enhanced typography, and conversion-focused layouts across dashboard, analytics, properties, blog management, orders, CIVIL+MEP reports, and all administrative interfaces for unified user experience.
- **User Dashboard Restructure**: Complete redesign of user dashboard with sidebar-based navigation, no header design, comprehensive overview with real-time stats, quick actions, property management, reports tracking, and seamless navigation to home page. Features authenticated user sessions, responsive mobile design, and integrated service access.
- **Enhanced User Panel Design**: Complete transformation of user panel with modern Staysaavy-inspired styling including gradient hero sections, enhanced statistics cards with hover effects, gradient quick action buttons, improved property cards with animations, comprehensive activity tracking, and goal-oriented user journey visualization. Features responsive design with sticky header and professional tab navigation.
- **Automated Supabase Setup System**: Complete commercial distribution system with automated database setup wizard for buyers. Features web-based onboarding that prompts for Supabase credentials, automatically creates schema/tables, seeds initial data, and saves configuration securely. Includes deployment configurations for Vercel, Netlify, Railway, and Docker with one-click setup capabilities for seamless buyer onboarding experience.
- **Complete Zone Management System**: Full CRUD operations for city-wise zone management including zone creation, editing, deletion, and viewing with comprehensive admin interface. Features proper handling of decimal fields (area, appreciation rates, rental yields), infrastructure scoring system (1-10 scale), market data integration, and seamless city-zone relationships. Customer-facing zone pages updated to use real database data instead of hardcoded logic.
- **Intent-Based Property Detail Pages**: Sophisticated business model with specialized property detail pages that serve different content based on user intent. Investment-focused pages show ROI calculations, rental yields, market appreciation, exit strategies, and investment scoring. End-use/family-focused pages emphasize lifestyle amenities, school proximity, family features, commute analysis, and living quality scores. Property results automatically route users to the appropriate specialized page based on their selected intent (investment vs end-use), creating targeted user experiences that match specific buyer motivations and decision-making criteria.
- **Comprehensive Data Transparency System**: Platform-wide data transparency indicators to build visitor trust and communicate data reliability. Includes verification badges throughout property detail pages (RERA Verified, Site Verified, Price Verified, Market Verified), reusable DataTransparencyIndicator component with multiple variants (compact, banner, inline), comprehensive DataTransparencyFooter component explaining data sources, and integration across all major pages (property results, find property, property reports, admin dashboard, home page). Features real-time verification timestamps, data source transparency (RERA database, site verification, market analysis, independent review), and color-coded trust indicators with relevant icons.
- **Expert Credentials System**: Comprehensive professional showcase system with detailed expert profiles including M.E. Structural Engineers, MRICS Chartered Valuers, Property Legal Experts, and Site Verification Specialists. Features qualification display (RERA Certified, Green Building Expert, CFA Level II), verification counts (290-680+ properties), star ratings (4.7-4.9), and professional certifications. Integrated into property detail pages and property reports with compact and full view options, emphasizing peer review process and quality assurance.
- **High-Conversion Homepage**: Complete homepage redesign with conversion-focused, urgency-driven content including market alerts, fear-of-loss messaging, social proof indicators, client success stories with specific savings amounts (₹4.2L, ₹7.8L, ₹12.5L saved), countdown timers, and multiple strong call-to-action elements. Features testimonials from verified clients, urgency banners, and compelling value propositions designed to drive immediate action and reduce bounce rates.

## External Dependencies

### Database & Authentication Services
- **PostgreSQL**: Primary database hosted on Replit with full schema migration completed.
- **Supabase**: Optional authentication platform (gracefully handles missing configuration).
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
- **One-Click Deploy**: Seamless buyer onboarding with automated database setup and initial data seeding.