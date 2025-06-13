# Dopamine Dashboard

A modern web application for tracking and visualizing dopamine-related activities and habits. This project consists of a React-based frontend and a Node.js/Express backend.

## 🚀 Features

- Real-time activity tracking
- Interactive data visualization
- User authentication with Google OAuth
- Responsive and modern UI
- Secure session management
- MongoDB database integration

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Material-UI (MUI)
- TailwindCSS
- React Query
- Socket.IO Client
- Recharts & Nivo for data visualization
- Framer Motion for animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js for authentication
- JWT for session management
- Socket.IO for real-time features

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dopamine-dashboard.git
cd dopamine-dashboard
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

## 🚀 Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development

- Frontend development server runs on port 5173
- Backend server runs on port 3000
- MongoDB connection is required for full functionality

## 📝 Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## 🔐 Authentication

The application uses Google OAuth 2.0 for authentication. Make sure to:
1. Set up a Google Cloud Project
2. Configure OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Update the environment variables with your credentials

## 📊 Data Visualization

The dashboard uses multiple visualization libraries:
- Recharts for basic charts
- Nivo for advanced visualizations
- Custom components for specific data representations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Material-UI for the component library
- MongoDB for the database
- All other open-source contributors 