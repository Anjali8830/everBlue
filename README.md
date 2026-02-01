# Fintech Dashboard (Ancient Spirit)

A modern, responsive Fintech Dashboard application built to help users track transactions, visualize financial data, and manage their finances effectively.

## Features

- **User Authentication**: Secure Login and Signup functionality using JWT and bcrypt.
- **Dashboard Overview**: comprehensive view of financial metrics.
- **Transaction Management**: 
  - View list of transactions.
  - Add, Edit, and Delete transactions.
  - Categorize expenses and incomes.
- **Financial Reports**: 
  - Visual data representation using Charts (Recharts).
  - Monthly/Weekly breakdowns.
- **Responsive Design**: Optimized for various screen sizes using Material UI.
- **Dark/Light Mode**: (If applicable, based on theme.js).

## Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Library**: [Material UI (MUI)](https://mui.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **State/Data**: React Context / Hooks
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT)
- **Security**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Password Hashing), [cors](https://github.com/expressjs/cors)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or AtlasURI)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ancient-spirit
   ```

2. **Install Dependencies**
   Since the backend and frontend dependencies are managed in the root `package.json`:
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
   *(Adjust variable names based on your actual `.env` usage)*

## Running the Application

To run the full application, you will need two terminal instances.

**Terminal 1: Start the Backend Server**
```bash
node server/index.js
# OR if you have nodemon installed globally or as a dev dependency
npx nodemon server/index.js
```

**Terminal 2: Start the Frontend Development Server**
```bash
npm run dev
```

- The frontend will be available at `http://localhost:5173` (default Vite port).
- The backend API will be running on `http://localhost:3000` (or your defined PORT).

## Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the frontend for production.
- `npm run lint`: Runs ESLint checks.
- `npm run preview`: Previews the built frontend.

## License

[MIT](LICENSE)
