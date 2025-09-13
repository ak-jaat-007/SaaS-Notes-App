# Multi-Tenant SaaS Notes Application

This is a multi-tenant notes application built with Next.js, Prisma, NextAuth, and MongoDB, deployed on Vercel.

## Features

- Multi-tenancy with strict data isolation.
- JWT-based authentication with Admin and Member roles.
- Subscription-based feature gating (Free vs. Pro plans).
- Secure CRUD API for managing notes.

## Multi-Tenancy Approach

This project uses a **shared schema with a tenant ID column** approach.

-   The `User` and `Note` models in the Prisma schema both contain a required `tenantId` field.
-   All API queries are filtered using the `tenantId` from the authenticated user's session.
-   This ensures that data from one tenant is never exposed to another, providing strong data isolation within a single database.

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- A `.env` file with the required environment variables (see `.env.example`).

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your `.env` file.
4.  Run the database seed:
    ```bash
    node prisma/seed.js
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

## Test Accounts

All test accounts use the password: `password`

-   **Acme (PRO Plan):**
    -   `admin@acme.test` (Admin)
    -   `user@acme.test` (Member)
-   **Globex (FREE Plan):**
    -   `admin@globex.test` (Admin)
    -   `user@globex.test` (Member)

## API Endpoints

-   `GET /health`: Health check.
-   `POST /notes`: Create a note.
-   `GET /notes`: List notes for the tenant.
-   `GET /notes/:id`: Get a specific note.
-   `PUT /notes/:id`: Update a note.
-   `DELETE /notes/:id`: Delete a note.
-   `POST /tenants/:slug/upgrade`: Upgrade a tenant's plan.