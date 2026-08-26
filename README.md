# Service Request Management System

A full-stack, enterprise-grade **Service Request Management System** built with **React**, **Node.js**, **Express**, and **MongoDB (Mongoose)**. The platform enables employees to submit, track, and manage IT/technical service tickets while empowering administrators to review, filter, sort, update status, and manage requests across the entire organization.

---

## 1. Project Overview

In enterprise and mid-market organizations, IT help desks require clear separation of duties, reliable ticket lifecycle tracking, and data isolation between standard personnel and administrative staff. 

The **Service Request Management System** provides:
- A self-service portal for employees to report hardware, software, network, access, and miscellaneous issues.
- A centralized control hub for IT administrators to monitor ticket volumes, update resolution status, filter by urgency, and search requests across employees.
- Complete backend enforcement of security policies (JWT authentication, role-based authorization, request ownership checks).

---

## 2. Features

- **Role-Based Access Control (RBAC):** Strict separation between `employee` and `admin` roles on both the backend API and frontend routing.
- **JWT Authentication:** Secure token-based session handling with bcrypt password hashing.
- **Data Isolation:** Employees can only retrieve, view, and modify their own requests. Admins have global visibility.
- **Advanced Query Engine:** Multi-parameter search (by title or requester name), multi-field filtering (category, priority, status), and multi-criteria sorting (creation date, priority hierarchy) executed at the database level.
- **Dynamic Metrics & Statistics:** Real-time summary cards for Total, Open, In Progress, Resolved, and Closed tickets scoped to the user's role.
- **Responsive Modern UI:** Tailwind CSS dashboard with responsive desktop data tables and mobile card layouts.
- **Automated Verification Suite:** 42 comprehensive automated backend tests covering authentication, authorization, CRUD, query combinations, and validation.
- **Zero-Config Developer Experience:** Automatically connects to standard MongoDB or initializes an embedded in-memory database instance if local MongoDB is unavailable.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 (Vite build system)
- **Routing:** React Router v6
- **HTTP Client:** Axios (with request & response interceptors)
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **Database ODM:** Mongoose (v8+)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Cryptography:** `bcryptjs`
- **CORS & Utilities:** `cors`, `dotenv`
- **Embedded Dev DB:** `mongodb-memory-server`

### Database
- **Engine:** MongoDB
- **Indexes:** Multi-key compound indexes on `status`, `priorityWeight`, `createdAt`, `createdBy`, and text search indexes on `title`.

---

## 4. Architecture

The system follows a clean 3-tier MVC/Service architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  (Vite + React Router + Axios Interceptors + Context)   │
└────────────────────────────┬────────────────────────────┘
                             │  HTTPS / REST API (JWT)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js Backend                     │
│  ├── Middleware (Auth, Role Guard, Error Handler)        │
│  ├── Validators (Input & Type Validation)               │
│  ├── Controllers (Auth, Service Requests)               │
│  └── Mongoose Models (User, ServiceRequest)             │
└────────────────────────────┬────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                     │
│        (Local Mongo Daemon / Atlas / Embedded)          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Folder Structure

```text
service-request-management/
├── backend/
│   ├── scripts/
│   │   ├── seed.js            # Seed script populating demo users & tickets
│   │   └── verify-api.js      # Comprehensive automated API test runner (42 tests)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Resilient MongoDB connection handler
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, me endpoints
│   │   │   └── requestController.js # CRUD, search, filter, sort & stats
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & role authorization
│   │   │   └── errorHandler.js      # Centralized error handler
│   │   ├── models/
│   │   │   ├── ServiceRequest.js    # ServiceRequest schema & priority weighting
│   │   │   └── User.js              # User schema & bcrypt pre-save hashing
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   └── requestRoutes.js     # /api/requests routes
│   │   ├── validators/
│   │   │   ├── authValidator.js     # Register & login validation
│   │   │   └── requestValidator.js  # Request creation & update validation
│   │   ├── app.js             # Express application & route configuration
│   │   └── server.js          # Server entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmModal.jsx        # Confirmation modal dialog
│   │   │   │   ├── EmptyState.jsx          # Zero-state placeholder
│   │   │   │   ├── LoadingSpinner.jsx      # Animated spinner
│   │   │   │   ├── Navbar.jsx              # Header navigation & user profile
│   │   │   │   ├── PriorityBadge.jsx       # Color-coded priority pill
│   │   │   │   ├── SearchFilterToolbar.jsx # Search, filter, & sort toolbar
│   │   │   │   ├── Sidebar.jsx             # Responsive sidebar
│   │   │   │   ├── StatCards.jsx           # Metric counters
│   │   │   │   └── StatusBadge.jsx         # Lifecycle status pill
│   │   │   └── requests/
│   │   │       └── RequestForm.jsx         # Reusable create/edit form
│   │   ├── context/
│   │   │   └── AuthContext.jsx             # Global user & token state
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx         # App frame with Navbar & Sidebar
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx          # Admin overview & management
│   │   │   ├── CreateRequestPage.jsx       # Ticket submission page
│   │   │   ├── EditRequestPage.jsx         # Edit ticket details page
│   │   │   ├── EmployeeDashboard.jsx       # Employee portal & ticket list
│   │   │   ├── LoginPage.jsx               # Sign in page (with 1-click demo buttons)
│   │   │   ├── NotFoundPage.jsx            # 404 page
│   │   │   ├── RegisterPage.jsx            # Employee registration page
│   │   │   └── RequestDetailsPage.jsx      # Ticket detail & status actions
│   │   ├── routes/
│   │   │   ├── AdminRoute.jsx              # Route guard for admin role
│   │   │   ├── AppRoutes.jsx               # Master route tree
│   │   │   └── ProtectedRoute.jsx          # Route guard for authenticated users
│   │   ├── services/
│   │   │   ├── api.js                      # Axios instance with interceptors
│   │   │   ├── authService.js              # Auth API calls
│   │   │   └── requestService.js           # Request CRUD API calls
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 6. Requirements

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **NPM**: v9.0.0 or higher
- **MongoDB**: Optional (standard local MongoDB, MongoDB Atlas connection URI, or automatic development in-memory database)

---

## 7. Installation Steps

### Clone or Open the Repository
```bash
cd service-request-management
```

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 8. Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/service_request_db
JWT_SECRET=supersecret_jwt_service_request_key_2026_dev
NODE_ENV=development
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 9. MongoDB Setup

- **Option A (Standard Local MongoDB):** Start your local `mongod` service on port `27017`.
- **Option B (MongoDB Atlas):** Replace `MONGO_URI` in `backend/.env` with your Atlas connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/service_requests?retryWrites=true&w=majority`).
- **Option C (Embedded In-Memory Mode):** If no local or remote MongoDB instance is available, the backend automatically boots a local embedded MongoDB instance without requiring any configuration.

---

## 10. Running Backend

From the `backend/` directory:

```bash
# Start backend in development mode with hot-reloading
npm run dev

# Or start in standard production mode
npm start
```

The backend will listen on `http://localhost:5000`.

---

## 11. Running Frontend

From the `frontend/` directory:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`.

---

## 12. Seed Data

To populate the database with demo users and realistic service requests across all categories, priorities, and statuses:

```bash
cd backend
npm run seed
```

### Demo Credentials

> [!WARNING]
> These credentials are for local development and demonstration only.

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin123!` | Global visibility, all status updates, delete, all tickets |
| **Employee** | `employee@example.com` | `Employee123!` | Personal tickets only, create, update details |
| **Employee** | `sarah@example.com` | `Employee123!` | Personal tickets only, create, update details |

*Tip: The Login page also provides One-Click demo buttons to autofill credentials instantly.*

---

## 13. API Endpoints

### Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new employee (role is strictly enforced as employee) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Get currently authenticated user profile |

### Service Request APIs (`/api/requests`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Private | Create new service request (`status` defaults to `Open`, `createdBy` set from JWT) |
| `GET` | `/api/requests` | Private | List requests (scoped to user's role) with search, filter, and sorting |
| `GET` | `/api/requests/:id` | Private | Get request details (employees restricted to own requests) |
| `PUT` | `/api/requests/:id` | Private | Update request (employees update own details; admin can update all including `status`) |
| `DELETE` | `/api/requests/:id` | Admin Only | Permanently delete a service request |

---

## 14. Authentication Explanation

1. **Password Hashing:** Passwords are never stored in plain text. A Mongoose pre-save hook computes a bcrypt hash with a salt factor of 10 whenever a password is set or modified.
2. **JWT Issuance:** Upon valid login or registration, the backend signs a JSON Web Token containing the user's `id` and `role`, valid for 7 days.
3. **Request Authentication:** The frontend Axios client includes the token in the `Authorization: Bearer <token>` header for all protected requests.
4. **Token Verification:** The `authenticate` middleware verifies token integrity and expiration against `JWT_SECRET` and attaches the user document to `req.user`.

---

## 15. Authorization Explanation

Authorization is strictly enforced on the backend server at both the route and controller levels:
- **Registration Guard:** The registration controller overrides any `role` value sent from the client and forces `role: 'employee'`. Admin accounts can only be created via the controlled seed process or environment initialization.
- **Tenant Scoping:** On `GET /api/requests`, if `req.user.role === 'employee'`, the database query is hard-scoped to `{ createdBy: req.user._id }`.
- **Detail View Guard:** On `GET /api/requests/:id`, employees attempting to access another employee's request receive a `403 Forbidden` response.
- **Update Permission Guard:** Employees cannot update `status` or alter other employees' requests.
- **Delete Guard:** The `DELETE /api/requests/:id` route is wrapped with `authorize('admin')`, rejecting non-admin tokens with `403 Forbidden`.

---

## 16. Database Schema

### User Schema (`users`)
```javascript
{
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  createdAt: { type: Date },
  updatedAt: { type: Date }
}
```

### ServiceRequest Schema (`servicerequests`)
```javascript
{
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  description: { type: String, required: true, trim: true, minlength: 5, maxlength: 3000 },
  category: { 
    type: String, 
    enum: ['Hardware', 'Software', 'Network', 'Access', 'Other'], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium',
    required: true 
  },
  priorityWeight: { type: Number, default: 2 }, // Low=1, Medium=2, High=3, Urgent=4
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open', 
    required: true 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date },
  updatedAt: { type: Date }
}
```

---

## 17. Search, Filtering, and Sorting Behavior

All search, filtering, and sorting calculations are executed as native MongoDB queries:

### Search (`?search=term`)
- **Employee View:** Searches `title` with case-insensitive regex.
- **Admin View:** Performs an `$or` query matching either the request `title` or any user whose `name` matches the search string.

### Filtering (`?category=Hardware&priority=High&status=Open`)
- Supports exact match against indexed fields.
- Multiple filters can be combined arbitrarily.

### Sorting (`?sortBy=priority&order=desc`)
- **Priority Sorting:** Uses the indexed numeric `priorityWeight` field so that `order=desc` produces `High > Medium > Low`, and `order=asc` produces `Low > Medium > High`.
- **Date Sorting:** Uses `createdAt` timestamp.

---

## 18. Testing Instructions

### Run the Automated Backend Verification Suite
The repository includes a comprehensive 42-step automated verification suite:

```bash
cd backend
npm run test:api
```

The test runner will verify:
- Registration & role escalation prevention
- Login, password hashing & JWT verification
- Request creation & default `Open` status assignment
- Role-based data isolation & cross-tenant access rejection
- Title & Requester name search queries
- Category, Priority, and Status filter combinations
- Priority hierarchy sorting (`High > Medium > Low`)
- Employee permission limits (cannot change status)
- Admin status updates & request deletion
- Scoped statistics calculation

### Manual UI Verification Steps
1. Start backend (`cd backend && npm start`) and frontend (`cd frontend && npm run dev`).
2. Open `http://localhost:3000` in your browser.
3. Click **Employee Demo** on the login page to sign in as Alex Johnson (`employee@example.com`).
4. Submit a new service request: "Broken USB-C dock in Room 204".
5. Verify the request appears in your dashboard with `Open` status and priority badge.
6. Test filtering by category "Hardware" and sorting by priority.
7. Click **Sign Out**.
8. Click **Admin Demo** to sign in as System Administrator (`admin@example.com`).
9. Verify all requests across all employees are displayed.
10. Use the search bar to search for "Alex" or "dock".
11. Change the status of a request to `In Progress` and `Resolved` using the inline dropdown.
12. Click the trash icon on a request to test the confirmation modal and delete operation.

---

## 19. Assumptions

1. Service request creation by employees automatically assigns the ticket lifecycle status to `Open`.
2. Only administrators can transition ticket statuses through `In Progress`, `Resolved`, and `Closed`.
3. Normal public registration creates standard employee accounts. Admin accounts are provisioned securely through seeding or administrative tools.
4. If a local MongoDB daemon is not running on the system, the application falls back to an embedded in-memory database to allow immediate testing without external dependencies.

---

## 20. Known Limitations

1. File attachments (such as screenshots or diagnostic logs) are not yet integrated into the request form.
2. Email notifications (SMTP integration) on ticket status changes are not enabled in this baseline version.
3. Multi-factor authentication (MFA) is not currently implemented.

---

## 21. Future Improvements

1. **File Attachments:** AWS S3 or Cloudinary integration for attaching logs and screenshots to tickets.
2. **Real-time Notifications:** WebSockets (Socket.io) or Server-Sent Events (SSE) for instant alerts when ticket status is updated.
3. **Comments & Activity Audit Log:** Timeline of comments and status transitions between employee and IT support staff.
4. **SLA Tracking:** Configurable resolution deadlines based on priority level with escalation warnings.
5. **Department & Asset Management:** Linking requests to specific company hardware asset tags.
