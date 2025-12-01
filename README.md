# BrickFund - Real Estate Crowdfunding Platform

A comprehensive real estate crowdfunding platform that democratizes property investment by allowing users to invest in verified real estate projects with as little as $100.

## 🏗️ Architecture

This project follows a **separated frontend-backend architecture**:

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Node.js with Express, TypeScript, and MongoDB
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system

## 📁 Project Structure

```
brickfund/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # User dashboard pages
│   ├── projects/          # Project listing and detail pages
│   ├── signin/           # Authentication pages
│   ├── signup/
│   ├── how-it-works/     # Information pages
│   ├── layout.tsx        # Root layout with AuthProvider
│   └── page.tsx          # Home page
├── backend/              # Backend API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── types/        # TypeScript types
│   │   └── server.ts     # Main server file
│   ├── package.json
│   └── README.md
├── components/           # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Navigation header
│   ├── Footer.tsx       # Site footer
│   └── ...              # Other components
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── lib/                 # Utility libraries
│   ├── api.ts          # API client
│   └── utils.ts        # Utility functions
├── hooks/               # Custom React hooks
├── package.json         # Frontend dependencies
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd brickfund
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start MongoDB (if running locally)
# Using Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From the root directory
cd ..

# Install dependencies
npm install

# Set up environment variables
cp env.local.example .env.local
# Edit .env.local with your configuration

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/brickfund

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎯 Features

### User Features
- **User Registration & Authentication**: Secure JWT-based authentication
- **Profile Management**: Complete user profiles with KYC verification
- **Project Browsing**: Browse and search real estate investment opportunities
- **Investment Management**: Make investments and track portfolio performance
- **Dashboard**: Comprehensive investment dashboard with analytics

### Developer Features
- **Project Creation**: Create and manage real estate projects
- **Project Management**: Update project details, timeline, and documents
- **Investor Tracking**: Monitor project investors and funding progress

### Admin Features
- **User Management**: Manage user accounts and KYC verification
- **Project Approval**: Review and approve developer projects
- **Platform Analytics**: Comprehensive dashboard with platform statistics
- **Investment Oversight**: Monitor all investments and transactions

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui component library
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📊 Database Models

### User Model
- Personal information and contact details
- KYC status and verification documents
- Investment profile and preferences
- Authentication and security fields

### Project Model
- Project details (title, description, location)
- Financial information (target amount, ROI, terms)
- Timeline and milestones
- Risk assessment and investor tracking

### Investment Model
- Investment details (amount, date, status)
- Expected and actual returns
- Distribution tracking
- Related documents

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend integration
- **Security Headers**: Helmet middleware
- **Environment Variables**: Sensitive data protection

## 🚀 Deployment

### Backend Deployment

1. **Build the application**
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Frontend Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```

3. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Or any other hosting platform

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Project Endpoints
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project (developer/admin)
- `PUT /api/projects/:id` - Update project (developer/admin)

### Investment Endpoints
- `POST /api/investments` - Create new investment
- `GET /api/investments/user` - Get user investments
- `GET /api/investments/:id` - Get investment details

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status

## 🧪 Development

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Development Workflow

1. **Start MongoDB** (if running locally)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `npm run dev`
4. **Access Application**: `http://localhost:3000`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@brickfund.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Real-time notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Document management system
- [ ] Advanced search and filtering
- [ ] Social features and reviews
- [ ] Multi-language support
- [ ] Advanced admin tools

---

**Built with ❤️ by the BrickFund Team**