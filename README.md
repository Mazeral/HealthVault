# HealthVault

HealthVault is a comprehensive health management platform designed to help users track and manage their health data efficiently. The project leverages modern web technologies to provide a seamless user experience and robust backend functionality.

## Project Structure

The project is structured as follows:

```
node_modules/       # Node.js modules
package.json        # Node.js project dependencies and scripts
prisma/             # Prisma ORM schema and migrations
src/                # Backend source code
tsconfig.json       # TypeScript configuration
frontend/           # Frontend source code (Vue 3, Vuetify, Pinia)
LICENSE             # Project license
nodemon.json        # Nodemon configuration for backend development
package-lock.json   # Locked versions of Node.js dependencies
README.md           # Project documentation
tests/              # Test cases for the project
```

## Technologies Used

### Frontend

- **Vue 3**: A progressive JavaScript framework for building user interfaces.

  <img src="https://vuejs.org/images/logo.png" alt="Vue 3 Logo" width="150" height="150">

- **Vuetify**: A Material Design component framework for Vue.js.

  <img src="https://cdn.freelogovectors.net/wp-content/uploads/2023/01/vuetify-logo-freelogovectors.net_.png" alt="Vuetify Logo" width="150" height="150">

- **Pinia**: A state management library for Vue.js.

  <img src="https://pinia.vuejs.org/logo.svg" alt="Pinia Logo" width="150" height="150">

### Backend

- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.

  <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" alt="Express.js Logo" width="250" height="150">

- **Redis**: An in-memory data structure store, used as a database, cache, and message broker.

  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Redis_logo.svg/320px-Redis_logo.svg.png" alt="Redis Logo" width="250" height="150">

- **Prisma ORM**: A next-generation ORM for Node.js and TypeScript.

  <img src="https://raw.githubusercontent.com/prisma/presskit/main/Assets/Preview-Prisma-DarkLogo.png" alt="Prisma Logo" width="250" height="150">

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v9 or higher)
- Redis server
- PostgreSQL (or any other database supported by Prisma)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/HealthVault.git
   cd HealthVault
   ```

2. **Install dependencies:**

   ```bash
   npm install
   cd frontend
   npm install
   ```

3. **Set up the database:**

   - Ensure your PostgreSQL server is running.
   - Update the `DATABASE_URL` in the `.env` file with your database credentials.

4. **Run Prisma migrations:**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the backend development server:**

   ```bash
   npm run dev
   ```

6. **Start the frontend development server:**

   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application:**

   Open your browser and navigate to `http://localhost:5173`.

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Vue.js, Vuetify, and Pinia for providing a robust frontend ecosystem.
- Express.js for a lightweight and flexible backend framework.
- Redis for efficient caching and session management.
- Prisma ORM for simplifying database interactions.

## Support

If you encounter any issues or have questions, please open an issue on the [GitHub repository](https://github.com/yourusername/HealthVault/issues).

---

Thank you for using HealthVault! We hope it helps you manage your health data effectively.
