# Fleett Car Rental System

A comprehensive car rental management solution built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and containerized with Docker.

## 🚀 Features

- **Secure Authentication**
  - Role-based access control (Admin, Fleet Manager, Staff)
  - JWT-based authentication
  - Protected API routes

- **Vehicle Management**
  - Complete vehicle inventory tracking
  - Vehicle status monitoring
  - Detailed vehicle information and history
  - Vehicle availability calendar

- **Customer Management**
  - Customer registration and profiles
  - Rental history tracking
  - Customer documentation management
  - Contact information management

- **Rental Operations**
  - Real-time rental processing
  - Active rentals monitoring
  - Rental history and analytics
  - Automated rental status updates

- **Maintenance Management**
  - Scheduled maintenance tracking
  - Maintenance history
  - Service records management
  - Maintenance status updates

- **Administrative Features**
  - Comprehensive dashboard
  - Analytics and reporting
  - User management
  - System configuration

## 🛠️ Technical Stack

### Frontend
- React.js
- React Router for navigation
- Modern UI components
- Responsive design
- State management with Context API

### Backend
- Node.js
- Express.js framework
- MongoDB database
- JWT authentication
- RESTful API architecture

### Deployment
- Docker containerization
- Docker Compose for service orchestration
- Nginx for reverse proxy
- Environment-based configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docker and Docker Compose
- Git

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shaheeryy/Fleett_Car_Rental_System.git
   cd Fleett_Car_Rental_System
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   # Update the variables in .env with your values
   ```

3. **Using Docker (Recommended)**
   ```bash
   # Build and start containers
   docker-compose up --build
   ```

4. **Manual Setup (Alternative)**
   ```bash
   # Install dependencies for server
   cd fleett-mern/server
   npm install

   # Install dependencies for client
   cd ../frontend/fleet
   npm install

   # Start the server
   cd ../../server
   npm run dev

   # Start the client
   cd ../frontend/fleet
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Client Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
fleett-mern/
├── frontend/
│   └── fleet/
│       ├── public/
│       └── src/
│           ├── components/
│           ├── pages/
│           └── App.js
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── docker-compose.yml
```

## 🔒 Security Features

- Environment-based configuration
- JWT token authentication
- Password hashing
- Protected API routes
- Input validation and sanitization
- CORS protection

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Shaheer Khan** - *Initial work* - [Shaheeryy](https://github.com/Shaheeryy)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Fleett Car Rental System
- Special thanks to the MERN stack community for excellent documentation and resources 