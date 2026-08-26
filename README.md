# 🛠️ Service Request Management System

A modern and full-stack **Service Request Management System** designed to streamline technical support requests within an organization.

The application allows employees to submit, track, search, filter, and manage service requests. Administrators can monitor and manage all requests through role-based access control.

---

## 🚀 Live Demo

🌐 **Live Application:** [Click Here](YOUR_DEPLOYED_APPLICATION_LINK)

💻 **GitHub Repository:** [Service Request Management System](YOUR_GITHUB_REPOSITORY_LINK)

> Replace the links above with your actual deployed application and GitHub repository links.

---

## 📌 Project Type

**Full-Stack Web Application**

---

## 📖 Project Overview

The **Service Request Management System** provides a centralized platform for managing technical assistance and service requests.

Employees can create accounts, log in securely, submit technical service requests, and track the progress of their requests.

Administrators have additional privileges to manage and monitor service requests across the system.

The application includes authentication, authorization, request management, search, filtering, sorting, dashboard statistics, and responsive user interfaces.

---

# ✨ Features

## 👨‍💻 Employee Features

- Employee Registration
- Secure Login
- JWT Authentication
- Employee Dashboard
- Submit New Service Requests
- View Personal Requests
- View Request Details
- Edit Requests
- Search Requests
- Filter by Status
- Filter by Priority
- Filter by Category
- Sort Requests by Date
- Track Request Status
- Dashboard Statistics

---

## 👨‍💼 Admin Features

- Secure Admin Login
- Separate Admin Access
- View All Service Requests
- Manage Employee Requests
- Update Request Status
- View Request Details
- Edit Requests
- Delete Requests
- Search Requests
- Filter Requests
- Sort Requests
- Monitor Request Statistics

---

# 🔐 Authentication & Authorization

The application implements secure authentication and authorization using:

- JWT (JSON Web Token)
- bcryptjs Password Hashing
- Protected Routes
- Role-Based Access Control (RBAC)

---

## 👥 User Roles

| Role | Permissions |
|---|---|
| 👨‍💻 Employee | Create and manage their own service requests |
| 👨‍💼 Admin | View and manage all service requests |

For security purposes, users cannot register directly as administrators.

All normal registrations create an **Employee account**.

Administrator accounts are created manually by the system administrator or using seeded data.

---

# 🛠️ Technologies Used

## 🎨 Frontend

- React.js
- Vite
- React Router
- Axios
- Tailwind CSS

## ⚙️ Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- bcryptjs

## 🗄️ Database

- MongoDB
- Mongoose

## 🧰 Development Tools

- Git
- GitHub
- npm

---

# 📂 Project Structure

```text
service-request-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── scripts/
│   │   └── seed.js
│   │
│   ├── package.json
│   └── .env.example
│
├── screenshots/
│
└── README.md
