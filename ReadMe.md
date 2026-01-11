### Development Folder
# for Backend {
<!-- make virtual environment -->
python -m venv venv
<!-- to start venv -->
venv\Scripts\activate
<!-- install django -->
pip install django djangorestframework django-cors-headers psycopg2-binary

# }
# for frontend{
npm install --global yarn
<!-- create react app -->
yarn create vite -react-JS

# }
## Frontend Folder
<!-- to install modules -->
yarn 
<!-- to start app -->
yarn dev

yarn add react-router-dom axios lucide-react
## Backend Folder

A professional, production-ready authentication, authorization, profile management, and dashboard system for the GeoTaste platform. Built with React, Django REST Framework, and Tailwind CSS.

## Project Overview

GeoTaste is a location-based food discovery platform that supports multiple user roles:
- **Normal Users**: Browse restaurants and ingredients
- **Store Users**: Sell ingredients and manage stores
- **Restaurant Users**: Manage restaurant details and menus
- **Admins**: System administration and user management

## Tech Stack

### Frontend
- **React 19.2.0**: User interface framework
- **Vite 7.2.4**: Build tool and dev server
- **Tailwind CSS 4.1.17**: Styling
- **React Router 7.10.0**: Client-side routing
- **Axios 1.13.2**: HTTP client
- **Lucide React 0.555.0**: Icons
- **React Context API**: State management

### Backend
- **Django 6.0**: Web framework
- **Django REST Framework**: RESTful API
- **Django CORS Headers**: Cross-origin requests
- **Django Simple JWT**: JWT authentication
- **SQLite**: Database (development)

## Features Implemented

### ✅ Authentication System
- Email + Password registration
- Email verification with OTP (6-digit code)
- Secure login with JWT tokens
- Password reset with 2-step verification
- Password change functionality
- Logout and session management
- Persistent login with localStorage

### ✅ Authorization & Access Control
- Role-based access control (4 roles)
- Protected routes with route guards
- Role-based redirects
- Admin-only endpoints
- Store/Restaurant user endpoints

### ✅ User Profiles
- Role-agnostic profile fields (name, phone, location, bio, photo)
- Role-specific profiles (store, restaurant)
- Profile editing with validation
- Dark mode preference
- Theme toggle support

### ✅ Dashboards
- User dashboard with statistics
- Admin dashboard with system metrics
- Role-based dashboard access
- User stats and analytics

### ✅ Validation & Security
- Frontend form validation
- Backend validation
- Password strength requirements
- Email format validation
- CSRF protection
- CORS configuration
- Secure password hashing

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

\`\`\`bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`

Backend runs at \`http://localhost:8000\`

### Frontend Setup

\`\`\`bash
cd Frontend
npm install
npm run dev
\`\`\`

Frontend runs at \`http://localhost:5173\`

## Project Structure

\`\`\`
GeoTaste/
├── backend/
│   ├── users/
│   │   ├── models.py           # CustomUser, UserProfile, StoreUserProfile, etc.
│   │   ├── views.py            # API endpoints (register, login, profile, etc.)
│   │   ├── serializers.py       # Data validation and transformation
│   │   ├── urls.py             # URL routing
│   │   └── admin.py            # Django admin configuration
│   ├── backend/
│   │   ├── settings.py         # Django configuration
│   │   └── urls.py             # Project routing
│   └── manage.py
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormComponents.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── Dashboard/
│   │   │   └── Profile/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── FRONTEND_SETUP.md
├── BACKEND_SETUP.md
└── README.md (this file)
\`\`\`

## API Endpoints Overview

### Authentication
- \`POST /api/register/\` - Register new user
- \`POST /api/login/\` - Login user
- \`POST /api/logout/\` - Logout user
- \`POST /api/verify-email/\` - Verify email with OTP
- \`POST /api/forgot-password/\` - Request password reset
- \`POST /api/reset-password/\` - Reset password with OTP

### User Management
- \`GET /api/me/\` - Get current user
- \`GET /api/profile/\` - Get user profile
- \`PUT /api/profile/\` - Update user profile
- \`POST /api/change-password/\` - Change password

### Role-Specific APIs
- \`GET /api/store-profile/\` - Store user profile
- \`PUT /api/store-profile/\` - Update store profile
- \`GET /api/restaurant-profile/\` - Restaurant user profile
- \`PUT /api/restaurant-profile/\` - Update restaurant profile

### Dashboards
- \`GET /api/user-dashboard/\` - User dashboard data
- \`GET /api/admin-dashboard/\` - Admin dashboard data

## User Roles

### Normal User
- Register and login
- View/edit profile
- Access user dashboard
- Browse restaurants and ingredients

### Store User
- All normal user features
- Manage store details
- Upload business license
- List ingredients for sale

### Restaurant User
- All normal user features
- Manage restaurant details
- Manage menu
- Upload business license

### Admin
- All user management features
- View system statistics
- Manage user roles
- System administration

## Key Components

### FormComponents.jsx
Reusable UI components:
- FormInput
- FormSelect
- FormButton
- Alert
- Card
- Container
- LoadingSpinner

### AuthContext.jsx
Centralized authentication logic:
- State management (user, tokens, loading, error)
- API methods
- Token persistence
- Axios interceptor setup

### ProtectedRoute.jsx
Route protection component:
- Authentication check
- Role-based access control
- Automatic redirects

## Form Validation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)

### Email Validation
- Valid email format required

### Frontend vs Backend
- Frontend: Real-time validation feedback
- Backend: Validation security layer

## Database Models

### CustomUser
- Extends Django AbstractUser
- Email as username field
- Role-based access
- Email verification tracking

### UserProfile
- Common fields for all users
- One-to-one relationship with CustomUser

### StoreUserProfile & RestaurantUserProfile
- Role-specific information
- One-to-one relationships

### OTP & PasswordResetToken
- Secure email verification
- Time-limited tokens (10 minutes)

## Development Workflow

1. **Feature Development**
   - Create backend model
   - Create API endpoint and serializer
   - Create frontend component/page
   - Test integration

2. **Testing**
   - Frontend form validation
   - API endpoint testing
   - Authentication flow
   - Authorization checks

3. **Deployment Checklist**
   - Set DEBUG = False
   - Configure email backend
   - Set secure SECRET_KEY
   - Configure ALLOWED_HOSTS
   - Set up HTTPS
   - Configure CORS for production

## Security Practices

1. **Password Security**
   - bcrypt hashing with salt
   - Never stored in plain text
   - Strength requirements enforced

2. **Token Security**
   - JWT tokens with expiration
   - Refresh token rotation support
   - Secure localStorage storage

3. **Email Security**
   - OTP-based verification
   - 10-minute expiration
   - Single-use tokens

4. **API Security**
   - CSRF protection
   - CORS configuration
   - Permission classes on endpoints
   - Role-based access control

## Error Handling

- Comprehensive error messages
- User-friendly error displays
- Validation feedback
- API error standardization

## Next Steps for Enhancement

1. **Image Upload**
   - Profile photo upload
   - License document upload
   - Image validation

2. **Additional Features**
   - Search and filtering
   - User activity logging
   - Notification system
   - Advanced analytics

3. **Infrastructure**
   - Production database (PostgreSQL)
   - Celery for async tasks
   - Redis for caching
   - Email service integration

4. **Frontend Enhancements**
   - Dark mode implementation
   - Progressive Web App (PWA)
   - Offline support
   - Advanced UI components

## Troubleshooting

### Backend
- Check Django logs for errors
- Verify database migrations
- Ensure all dependencies installed
- Check CORS configuration

### Frontend
- Check browser console for errors
- Verify API base URL
- Check localStorage tokens
- Clear cache and reload

### Authentication Issues
- Verify email verification status
- Check token expiration
- Clear localStorage and relogin
- Check backend is running

## Documentation

- **FRONTEND_SETUP.md**: Detailed frontend setup and usage
- **BACKEND_SETUP.md**: Detailed backend setup and API documentation
- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- React Docs: https://react.dev/

## Performance Optimization

- Lazy loading routes
- Component memoization
- API call caching
- Database query optimization
- Image compression
- Minified builds

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project is proprietary and for educational purposes.

## Contact & Support

For questions or issues, refer to the comprehensive setup guides:
- Backend questions → BACKEND_SETUP.md
- Frontend questions → FRONTEND_SETUP.md

## Contributors

GeoTaste Development Team

---

**Last Updated**: January 10, 2026
**Status**: Production Ready
**Version**: 1.0.0
EOF