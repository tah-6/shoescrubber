# ShoeScrubber SaaS Application

A modern full-stack SaaS application built with Vite + React (frontend) and Firebase (backend).

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Clerk (Auth), Stripe
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Package Manager**: pnpm

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Firebase account
- Clerk account
- Stripe account

## Environment Variables

Create the following `.env` files:

### Root `.env`
```
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Backend `.env` (packages/server/.env)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend `.env` (packages/web/.env)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=your_clerk_api_url
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up Firebase:
   - Create a new Firebase project in the Firebase Console
   - Enable Firestore Database
   - Enable Authentication
   - Download your service account key and save it as `packages/server/service-account.json`

3. Start the development servers:

In one terminal:
```bash
pnpm dev
```

This will start both the frontend and backend servers in development mode.

## Development

- Frontend runs on: http://localhost:3000
- Firebase Functions run on: http://localhost:5001

## Project Structure

```
packages/
  ├── shared/          # Shared types and utilities
  ├── web/            # Frontend application
  └── server/         # Firebase backend
```

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages
- `pnpm start` - Start production servers
- `pnpm lint` - Run linting
- `pnpm format` - Format code with Prettier 