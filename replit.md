# SpyGuard - Anti-Hacking & Spyware Detector

## Overview

SpyGuard is a mobile security application that detects spyware, predatory loan apps, and hidden trackers on user devices. Built with React Native/Expo for cross-platform mobile support and an Express backend server. The app uses a freemium model where free users can scan but see blurred threat names, while premium users get full access to threat details and removal features.

Key features:
- Device security scanning with animated radar UI
- Threat detection for spyware, loan apps, hidden trackers, and data leaks
- Multi-language support (English, Urdu, Hindi, Pashto, Sindhi) with RTL layout support
- Freemium monetization with mock in-app purchase
- Dark/hacker-themed UI with neon green (safe) and red (danger) colors

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack navigator (stack-only, no tabs)
- **State Management**: React Context API for global app state (language, premium status, scan results)
- **Animations**: React Native Reanimated for smooth UI animations (radar pulse, scan effects)
- **Styling**: StyleSheet-based with centralized theme constants in `client/constants/theme.ts`

### Screen Flow
1. Language Selection (first launch only) → Dashboard → Scan Results → Threat Details
2. Modal screens: Premium upgrade, Settings
3. No authentication required - app opens directly to dashboard

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (schema in `shared/schema.ts`)
- **API Pattern**: REST endpoints prefixed with `/api`
- **Storage**: Abstracted storage interface supporting both in-memory and database implementations

### Data Layer
- **Threat Database**: Local JSON-based blacklist/whitelist in `client/data/threatDatabase.ts`
- **Persistence**: AsyncStorage for user preferences (language, premium status, scan history)
- **Query Management**: TanStack React Query for server state management

### Localization System
- 5 language files in `client/locales/` (en, ur, hi, ps, sd)
- RTL support for Urdu, Pashto, and Sindhi
- Translation function `t()` provided via AppContext

### Path Aliases
- `@/` → `./client/`
- `@shared/` → `./shared/`

## External Dependencies

### Mobile Framework
- **Expo SDK 54**: Managed workflow with expo-image, expo-haptics, expo-blur, expo-linear-gradient
- **React Native 0.81**: Core mobile framework with gesture handler, reanimated, safe-area-context

### Database
- **PostgreSQL**: Primary database (connection via DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations

### Build & Development
- **tsx**: TypeScript execution for server
- **esbuild**: Server bundling for production
- **Babel with module-resolver**: Path alias resolution

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN`: API base URL for client-server communication
- `REPLIT_DEV_DOMAIN`: Development domain (Replit-specific)