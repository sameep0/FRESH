# Personal Finance Tracker

A comprehensive full-stack web application for managing personal finances with user authentication, transaction tracking, budgeting, and detailed financial reporting.

## Features

### User Features
- **Dashboard**: Overview of financial health with charts and statistics
- **Transaction Management**: Add, edit, delete, and categorize transactions
- **Account Management**: Track multiple bank accounts and balances
- **Category Management**: Customize income and expense categories
- **Reports & Analytics**: Detailed financial reports with charts
- **Data Export**: Export financial data in CSV and JSON formats
- **Backup & Restore**: Create and restore data backups
- **Settings**: User profile and application preferences

### Admin Features
- **Admin Dashboard**: System overview with key metrics
- **User Management**: View, edit, and manage user accounts
- **System Statistics**: Detailed system analytics and trends
- **User Analytics**: Track user activity and engagement

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **CORS** - Cross-origin requests

## Project Structure

```
personalFT/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/     # Admin-specific components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── layout/    # Layout components
│   │   │   └── user/      # User-specific components
│   │   ├── contexts/      # React contexts
│   │   └── ...
│   ├── public/
│   └── package.json
├── backend/           # Node.js backend application
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your_jwt_secret_here
DB_PATH=./database.sqlite
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### User Routes
- `GET /user/dashboard` - Dashboard data
- `GET /user/transactions` - Get transactions
- `POST /user/transactions` - Create transaction
- `PUT /user/transactions/:id` - Update transaction
- `DELETE /user/transactions/:id` - Delete transaction
- `GET /user/accounts` - Get accounts
- `GET /user/categories` - Get categories
- `GET /user/export/:format` - Export data
- `POST /user/backup` - Create backup
- `POST /user/restore` - Restore backup

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Get all users
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/stats` - System statistics

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Dashboard**: View your financial overview and recent activity
3. **Add Transactions**: Record income and expenses with categories
4. **Manage Accounts**: Add and track multiple bank accounts
5. **View Reports**: Analyze spending patterns and trends
6. **Export Data**: Download your financial data for backup

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@personalfinancetracker.com or create an issue in the repository. 