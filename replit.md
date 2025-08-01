# Property Management Dashboard

## Overview

This is a full-stack property management application built with Express.js backend and React frontend. The system is designed to manage real estate properties with comprehensive CRUD operations, search functionality, and detailed property information tracking. It focuses on Indian real estate market features including RERA compliance, zoning information, and regional categorization.

## User Preferences

Preferred communication style: Simple, everyday language.

## Authentication

- Admin phone number: 9560366601 (authorized for admin access)
- OTP system implemented for secure login
- Development mode: OTP codes are logged to server console
- Production note: Integrate with SMS service (Twilio recommended)

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
- **Indian Market Focus**: RERA compliance tracking, zone-based categorization, and regional pricing
- **Media Support**: Image and video upload capabilities for property listings
- **Advanced Search**: Text search across property names, developers, and locations
- **Filtering System**: Multi-criteria filtering by type, status, zone, and price range
- **Dashboard Analytics**: Property statistics and summary information

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