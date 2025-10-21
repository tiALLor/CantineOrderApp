# Cantina App

Project Name: Cantina App

# Overview

The Cantina App is a full-stack meal ordering and menu management system designed to streamline the process of daily meal services. It provides different user roles—Admin, Chef, and User—with specific permissions to manage menus, create meals, and place orders.

The application is built using a modern stack focused on type safety and efficiency, leveraging Vue 3 (frontend) and Node.js/Express (backend) connected via tRPC (type-safe API layer).

Project is build as a full-stack web application with TypeScript, Express.js, tRPC, PostgreSQL, and Vue 3 (Vite). It is structured as a monorepo with separate `client` and `server` packages.

## Features

- **TypeScript:** throughout the stack
- **PostgreSQL:** database with migration support
- **Express.js:** server with tRPC endpoints
- **Zod:** Schema declaration and validation library.
- **jwt-simple:** For JSON Web Token handling.
- **bcrypt:** For password hashing (with pepper).
- **Robust Authentication:** Utilizes secure token-based authentication with separate refresh tokens and password hashing with salting (pepper).
- Role-based user access (`admin`, `chef`, `user`)
- **User Management:** admin can create other users with any given role (admin, chef, user), user can signup with name, email and password
- **Menu & Order Management:** Chefs can create daily menus and add meals to meal database, and users can place, view, and modify orders for future dates.
- **Monthly Summary:** Users can view a detailed breakdown of their past orders and total monthly spending.
- Comprehensive back-end and front-end testing (Vitest, Playwright)
- Monorepo structure for easy management of client and server
- Linting and formatting with ESLint and Prettier
- ** Efficient Client Caching:** Pinia stores (useMealStore, useMenuStore) implement a 1-minute time-based cache for menu data, reducing API load.
- Users can order meals (`main`, `soup`) for future dates
- Menus are created per day and meal
- Secure password handling (bcrypt + pepper)

| Category           | Technology                      | Purpose                                               |
| :----------------- | :------------------------------ | :---------------------------------------------------- |
| Frontend Framework | Vue 3 (Composition API)         | Reactive user interface                               |
| State Management   | Pinia                           | Centralized, modular store management and caching     |
| API Layer          | tRPC                            | End-to-end type-safe API communication                |
| Styling/UI         | Tailwind CSS, Flowbite Vue      | Rapid, utility-first styling and UI components        |
| Server Runtime     | Node.js with Express            | Fast and scalable backend server                      |
| Database           | PostgreSQL (Managed via Kysely) | Reliable relational data storage                      |
| Utilities          | TypeScript, date-fns, Zod       | Type safety, date manipulation, and schema validation |

## Project Structure

```
.
├── client/   # Front-end (Vue 3 + Vite)
├── server/   # Back-end (Express.js + tRPC)
├── package.json
├── README.md
└── ...
```

## Setup

You must have the following installed on your system:

- Node.js (LTS version recommended)
- npm or yarn
- Docker or a locally running PostgreSQL instance or database service as Neondb

1. **Installation:**

Clone the repository and install dependencies for both the client and server:

```bash
git clone <repository_url>
cd cantina-app
npm install # Install main dependencies
cd client
npm install # Install client dependencies
cd server
npm install # Install server dependencies
```

2. **Create a PostgreSQL database** and update `.env` files in both `client` and `server` based on their `.env.example` files.

- **Run all pending migrations:**

  ```bash
  npm run migrate:latest -w server
  ```

- **Optional: generate database types:**
  ```bash
  npm run gen:types -w server
  ```

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
- **Take back one latest migration:**
  ```bash
  npm run migrate:oneDown -w server
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

## Operational Flow and Roles

The application supports three primary user roles: Admin, Chef, and User.

1. Admin Actions (Initial Setup)

|     Step      |                                                                      Detail                                                                       |
| :-----------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
|  Admin Login  |           Log in with the default credentials set in your .env file (if provided) or: Email: admin@admin.com, Password: changeAdminPass           |
| User Creation | The Admin's primary task is to use the Admin panel to create other users, including the necessary Chef accounts. Admin as also privileges as User |

2. Chef Actions (Menu Management)

|     Step      |                                                 Detail                                                 |
| :-----------: | :----------------------------------------------------------------------------------------------------: |
| Meal Creation |      Log in as a chef. Create new reusable Meal items (e.g., "Tomato Soup," "Chicken Stir-fry").       |
| Menu Creation | Assign created Meal items to specific dates, forming the daily Menu. Chef has also privileges as User. |

3. User Actions (Ordering)

| Step               | Detail                                                                     |
| :----------------- | :------------------------------------------------------------------------- |
| Order Placement    | Sign up/Log in as a user. View the available menus and place daily orders. |
| Order Modification | Change or cancel existing orders before the cutoff time.                   |
| Order History      | View the SummaryTable to check past orders and track monthly spending.     |

### API Exploration

- Use the [tRPC panel](http://localhost:3000/api/v1/trpc-panel) for interactive API testing.
- Alternatively, use the REST Client requests in `/server/tests/rest.http`.

## Code Structure & Patterns

### Pinia Caching Strategy

The client-side uses two key Pinia stores for efficiency:

useMenuStore: Caches the menus for a specific date and meal type. Crucially, it uses the string representation of the date (dateAsString(date)) to check cache validity, avoiding failed comparisons between Date object instances.

useMealStore: Caches the full list of available meals (soup or main). It implements a 1-minute expiration and handles client-side searching on top of the cached list, preventing repeated full fetches.

### TRPC Error Handling

The application uses standard tRPC query/mutation patterns. When performing read operations, the .query() method is used (e.g., fetching monthly costs). In case of a fetching error, the components include a fallback to return existing cached data if available, ensuring a smooth user experience.

## Additional Notes

- Ensure your `.env` files are correctly set up for both client and server.
- See [client/README.md](client/README.md) and [server/README.md](server/README.md) for more detailed instructions for each package.
- The project aims for at least 70% back-end test coverage.

### GitHub action setup

Setup repository `Repository secrets`:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- PROD_ADMIN_EMAIL as email
- PROD_INITIAL_ADMIN_PASSWORD as secret
- PROD_DATABASE_URL as database connection string
- PROD_TOKEN_KEY as string
- PROD_PASSWORD_PEPPER as string

Setup repository `Repository variables`:

- AWS_LIGHTSAIL_SERVICE - as LightSail service name
- AWS_REGION
- PROD_TOKEN_EXPIRES_IN as e.g."1h", "30m", "7d" valid units ms|s|m|h|d|w|y
- PROD_REFRESH_TOKEN_EXPIRES_IN as e.g."1h", "30m", "7d" valid units ms|s|m|h|d|w|y
- PROD_PASSWORD_COST as number

for more details see .env.examples

## License

MIT
