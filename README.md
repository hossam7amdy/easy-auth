# Easy Auth

A robust, full-stack authentication module designed to provide secure user sessions and management. Built with a modern tech stack, it serves as a solid foundation for scalable web applications.

## Features

### Core Modules

- **Authentication**:
  - Secure **Sign Up** and **Sign In** flows.
  - **Email Verification** - Users must verify their email before signing in (15-minute token expiry).
  - **JWT-based** stateless authentication.
  - Protected API routes using `Passport` and `Guards`.
  - Secure password hashing with `Bcrypt`.
- **User Management**:
  - User profile retrieval (`/users/me`).
  - Type-safe DTOs for data validation.
- **System Health**:
  - Dedicated health check endpoints for monitoring.

### Technical Stack

- **Backend**:
  - [NestJS](https://nestjs.com/) - Progressive Node.js framework.
  - [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) - NoSQL Database and ODM.
  - **Swagger UI** - Auto-generated API documentation.
  - **Helmet** - Security headers middleware.
  - **Throttler** - Rate limiting for API protection.
- **Frontend**:
  - [React](https://react.dev/) with [Vite](https://vitejs.dev/) - Fast, modern UI development.
  - [TailwindCSS v4](https://tailwindcss.com/) - Utility-first styling.
  - [React Query](https://tanstack.com/query/latest) - Server state management.
  - [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) - Form handling and schema validation.
  - [Radix UI](https://www.radix-ui.com/) / [ShadCN](https://ui.shadcn.com/) - Accessible UI components.
- **Shared**:
  - Monorepo workspace using `pnpm`.
  - Shared `DTOs` and `Types` for end-to-end type safety.

### Infrastructure

- **Docker Compose**: Orchestrates MongoDB, Mongo Express, and Mailpit for easy local development.
  - **Mailpit**: Email testing tool for intercepting and viewing emails in development ([http://localhost:8025](http://localhost:8025)).
- **GitHub Actions**: CI pipeline for automated Linting, formatting, type-checking, testing, and building on Pull Requests.
- **Dockerfile**: Multi-stage build for optimized production deployment of the backend.

---

## Production Readiness Checklist

The following core authentication features are required to make this module complete and production-ready:

- **Password Management**:
  - **Forget & Reset Password**: Secure flows for recovering lost passwords.
  - **Change Password**: Allow authenticated users to update their password.
- **OAuth Login**: Support for social login providers (e.g., Google, GitHub).
- **Session Security**: Implementation of **Refresh Tokens** and token rotation for secure, long-lived sessions.
- **Profile Management**: Endpoints to update authenticated user details (e.g., name, avatar).

---

## Local Development Walkthrough

Follow these steps to clone, start, and test the application locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd easy-auth
```

### Step 2: Install Dependencies

We use `pnpm` workspaces. Install dependencies for all packages at once:

```bash
pnpm install
```

### Step 3: Environment Setup

Copy the template environment file to create your local configuration:

```bash
# In packages/backend
cp packages/backend/.env.template packages/backend/.env
```

_Review the `.env` file to ensure the configuration matches your local setup (defaults usually work)._

### Step 4: Start Infrastructure

Spin up the database and admin tools using Docker Compose:

```bash
docker compose up -d
```

### Step 5: Start Development Servers

Run the backend and frontend in development mode:

```bash
pnpm dev
# This will start both the NestJS backend and Vite frontend
```

### Verification

Once everything is running:

1.  **Frontend**: Open [http://localhost:5173](http://localhost:5173) to see the application.
2.  **API Docs**: Open [http://localhost:3000/api](http://localhost:3000/api) to explore the Swagger UI.
3.  **Health Check**: Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to confirm the backend is online.
4.  **DB Admin**: Open [http://localhost:8081](http://localhost:8081) to manage MongoDB via Mongo Express.
5.  **Email Testing**: Open [http://localhost:8025](http://localhost:8025) to view verification emails sent via Mailpit.

---

## Technical Details & Trade-offs

### Architecture: Monorepo

- **Decision**: Put Frontend, Backend, and Shared code in a single repository.
- **Trade-off**: Increases build complexity but significantly improves developer velocity by allowing code sharing (DTOs) and atomic commits across the stack.

### Database: MongoDB

- **Decision**: Use a NoSQL document store.
- **Trade-off**: Offers flexibility during the MVP phase where schemas evolve rapidly. However, it lacks the rigid consistency guarantees of SQL, which might be needed for complex financial transactions later. To support transactions, a Replica Set is required.

### Authentication: JWT (Stateless)

- **Decision**: Use short-lived JSON Web Tokens signed with a secret.
- **Trade-off**: Highly scalable as the server doesn't store session state. The downside is that revoking a specific token right now requires a "Denylist" (state) or waiting for it to expire. We chose a 1-day expiration for simplicity in this MVP, but production systems typically use short-lived Access Tokens (15m) + Refresh Tokens.
