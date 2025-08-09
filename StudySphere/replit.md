# LearnBox - Academic Material Sharing Platform

## Overview

LearnBox is a full-stack web application designed for academic institutions to facilitate material sharing between students and administrators. The platform allows students to upload study materials (documents, images, videos) organized by books/subjects, while providing administrators with approval workflows and user management capabilities. Built with a modern tech stack including React, Express, PostgreSQL, and Firebase authentication.

## Admin Authentication
- Admin email: mughalsohaib240@gmail.com
- Admin password: "@sohaibofficial66"
- Only admin email gets elevated privileges and access to admin panel in header
- Regular users sign in with Gmail and get student role automatically

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Firebase Authentication with Google OAuth integration
- **Mobile-First Design**: Responsive layout with dedicated mobile navigation component

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based access control
- **File Handling**: Multer middleware for file uploads with type validation and size limits
- **Development**: Hot module replacement via Vite integration for seamless development

### Database Design
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Structure**:
  - Users table with role-based permissions (admin/student)
  - Books table for organizing materials by subject
  - Materials table with file metadata, approval status, and tagging system
  - Announcements table for admin communications
- **Relationships**: Foreign key constraints ensuring data integrity across entities
- **Migration System**: Drizzle Kit for schema versioning and database migrations

### Authentication & Authorization
- **Authentication Provider**: Firebase Auth with Google Sign-In
- **Session Management**: JWT tokens stored in localStorage
- **Role-Based Access**: Middleware-enforced permissions distinguishing admin and student capabilities
- **Route Protection**: Authentication guards preventing unauthorized access

### File Management System
- **Upload Processing**: Server-side file validation and storage in local uploads directory
- **Supported Formats**: PDF, Word documents, images (JPEG, PNG, GIF), and MP4 videos
- **Size Limits**: 10MB maximum file size with configurable restrictions
- **Metadata Storage**: File information stored in database with path references

### Admin Features
- **Comprehensive Admin Panel**: Full-featured dashboard with tabbed interface for managing all aspects
  - Overview tab with statistics and quick actions
  - Materials management with approve/reject workflow and bulk operations
  - Books management with create, edit, delete functionality
  - Announcements management with type-based categorization
  - User management showing active students and user activity logs
  - Book requests handling for students requesting new subjects
- **Content Moderation**: Approval workflow for student-uploaded materials with status tracking
- **User Management**: Complete user dashboard showing login records, upload history, and activity tracking
- **Analytics**: Real-time material statistics, user engagement metrics, and content distribution
- **Announcements**: System-wide communication with info/warning/success/error types and priority levels
- **Book Management**: Full CRUD operations for subject books with material count tracking
- **Book Request System**: Students can request new books, admins approve/reject with automatic book creation

## UI/UX Features
- **Responsive Design**: Mobile-first approach with slide-out sidebar navigation replacing bottom nav
- **Dark Theme**: Full dark mode support with theme toggle in header
- **Footer**: "Developed by Sohaib" with WhatsApp contact link (https://wa.me/923476856605)
- **Material Design**: Clean, intuitive interface using shadcn/ui components
- **Navigation Structure**: 
  - Dashboard: Latest announcements and recent materials only
  - Books: Grid view of all books, click to view materials within each book
  - Upload: Form for uploading to existing books with book request feature
  - Admin Panel: Comprehensive management interface (admin only)

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon Database serverless driver for PostgreSQL connections
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management and caching solution
- **wouter**: Minimalist routing library for React applications

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Type-safe utility for creating component variants
- **lucide-react**: Modern icon library with consistent design

### Authentication & File Handling
- **firebase**: Google Firebase SDK for authentication services
- **multer**: Express middleware for handling multipart/form-data file uploads
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development Tools
- **vite**: Fast build tool with hot module replacement
- **typescript**: Static type checking for enhanced developer experience
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### Utility Libraries
- **date-fns**: Modern date utility library for timestamp formatting
- **react-hook-form**: Performant forms with minimal re-renders
- **zod**: TypeScript-first schema validation library
- **clsx & tailwind-merge**: Conditional CSS class utilities for dynamic styling