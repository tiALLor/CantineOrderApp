# Full Stack Capstone Project

This project is a full-stack web application built with TypeScript, Express.js, tRPC, PostgreSQL, and Vue 3 (Vite). It is structured as a monorepo with separate `client` and `server` packages.

## Features

- TypeScript throughout the stack
- PostgreSQL database with migration support
- Express.js server with tRPC endpoints
- User authentication
- Comprehensive back-end and front-end testing (Vitest, Playwright)
- Monorepo structure for easy management of client and server
- Linting and formatting with ESLint and Prettier

## Project Structure

```
.
├── client/   # Front-end (Vue 3 + Vite)
├── server/   # Back-end (Express.js + tRPC)
├── .env.example
├── package.json
├── README.md
└── ...
```

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create a PostgreSQL database** and update `.env` files in both `client` and `server` based on their `.env.example` files.

## Running the project in development

- **Server (back end):**
  ```bash
  npm run dev -w server
  ```
- **Client (front end):**
  ```bash
  npm run dev -w client
  ```

## Tests

- **Front end unit and E2E tests:**
  ```bash
  npm test -w client
  ```
- **Front end unit tests only:**
  ```bash
  npm run test:unit -w client
  ```
- **Front end E2E tests only:**
  ```bash
  npm run test:e2e -w client
  ```
- **Back end tests:**
  ```bash
  npm test -w server
  ```

## Migrations

- **Prepare a new migration:**
  ```bash
  npm run migrate:new myMigrationName -w server
  ```
- **Run all pending migrations:**
  ```bash
  npm run migrate:latest -w server
  ```

## Running the project in production

- **Client:**
  ```bash
  npm run build -w client
  npm run preview -w client
  ```
- **Server:**
  ```bash
  npm run build -w server
  npm run start -w server
  # or migrate + start
  npm run prod -w server
  ```

## Linting

- **Lint the codebase:**
  ```bash
  npm run lint
  ```

## Additional Notes

- Ensure your `.env` files are correctly set up for both client and server.
- See [client/README.md](client/README.md) and [server/README.md](server/README.md) for more detailed instructions for each package.
- The project aims for at least 70% back-end test coverage.

## License

MIT
