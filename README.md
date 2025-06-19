# Car Rental Management System

A full-stack MERN application for managing a luxury car rental fleet, including vehicle inventory, customer management, rental transactions, and maintenance scheduling.

## Features

- **Vehicle Management**: Add, edit, and track luxury vehicles in your fleet
- **Customer Management**: Store and manage customer information
- **Rental Processing**: Create and manage rental agreements
- **Maintenance Tracking**: Schedule and track vehicle maintenance
- **User Authentication**: Secure login for admins and fleet managers
- **Dashboard & Reports**: Visual analytics of fleet performance and business metrics

## Technology Stack

- **Frontend**: React.js with hooks, context API, and custom styling
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker and Docker Compose
- **Deployment**: Vercel (frontend) and Render (backend)

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Docker and Docker Compose (optional, for containerized deployment)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/your-username/car-rental-system.git
   cd car-rental-system
   ```

2. Set up environment variables:
   - Create `.env` file in the server directory:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```
   - Create `.env` file in the frontend/fleet directory:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```

3. Install dependencies and start the servers:
   ```
   # Backend
   cd fleett-mern/server
   npm install
   npm run dev

   # Frontend (in a new terminal)
   cd fleett-mern/frontend/fleet
   npm install
   npm start
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Docker Deployment

1. Make sure Docker and Docker Compose are installed

2. Run the application using Docker Compose:
   ```
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to: `fleett-mern/frontend/fleet`
3. Add environment variables:
   - `REACT_APP_API_URL` (pointing to your Render backend URL with /api)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built by Shaheer
- UI/UX design inspired by modern luxury car dealerships 