# Cluster Frontend

A Next.js application for cluster heads to manage and view schools in their assigned cluster.

## Features

- **Authentication**: Secure JWT-based login and signup
- **Cluster Dashboard**: Overview of cluster statistics and schools
- **Schools Management**: Browse and view detailed information about schools
- **Student Statistics**: View student counts (total, boys, girls) for each school
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Role-Based Access**: Cluster heads can only view their assigned cluster data

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Authentication**: JWT tokens stored in localStorage

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000` (or configure via environment variable)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (already created):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3002`

## Project Structure

```
cluster_frontend/
├── app/                      # Next.js app router pages
│   ├── dashboard/           # Main dashboard
│   ├── schools/             # Schools list and detail pages
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── waiting/             # Waiting for cluster assignment
│   └── profile/             # User profile
├── components/              # Reusable UI components
│   ├── Navigation.tsx       # Top navigation bar
│   ├── ProtectedRoute.tsx   # Route protection wrapper
│   ├── StatCard.tsx         # Statistics display card
│   ├── SchoolCard.tsx       # School information card
│   ├── LoadingSpinner.tsx   # Loading indicator
│   └── Toast.tsx            # Notification toast
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication state management
├── lib/                     # Utilities and helpers
│   ├── api.ts              # Axios client with interceptors
│   ├── auth.ts             # Token management functions
│   └── types.ts            # TypeScript type definitions
└── hooks/                   # Custom React hooks
```

## User Flow

1. **Signup**: User creates an account with email, password, and full name
2. **Waiting**: User sees a waiting page (no cluster assigned yet)
3. **Admin Assignment**: System administrator assigns user to a cluster from admin dashboard
4. **Access Granted**: User can now access the cluster dashboard and view schools
5. **Browse Schools**: View list of schools with search and filter capabilities
6. **School Details**: Click on any school to see detailed information

## API Endpoints Used

- `POST /auth/register` - User signup
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info
- `GET /api/clusters/{id}/details` - Get cluster details with statistics
- `GET /api/clusters/{id}/schools` - Get list of schools in cluster
- `GET /api/clusters/{id}/students` - Get student data by school

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:8000`)

## Development

```bash
# Run development server (port 3002)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Color Scheme

The application uses an orange/amber color scheme to distinguish it from the main frontend:

- Primary: Orange (#F97316)
- Accent: Amber (#FBBF24)
- Background: Amber-50 (#FFFBEB)
- Success: Green (#10B981)
- Error: Red (#EF4444)

## Security

- JWT tokens stored in localStorage with key `cluster_auth_token`
- Automatic token refresh on app mount
- 401 errors automatically redirect to login
- Protected routes check authentication and cluster assignment
- Backend enforces cluster access control (users can only access their assigned cluster)

## Testing the Application

1. Start the backend server: `cd backend && uvicorn main:app --reload`
2. Start the cluster frontend: `cd cluster_frontend && npm run dev`
3. Open `http://localhost:3002` in your browser
4. Sign up with a new account
5. You'll see the waiting page (no cluster assigned)
6. Use the admin dashboard to assign the user to a cluster
7. Refresh the cluster frontend - you should now see the dashboard

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Internal use only
