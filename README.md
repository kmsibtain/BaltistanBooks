<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<div align="center">

[![Stars](https://img.shields.io/github/stars/kmsibtain/BaltistanBooks?style=for-the-badge)](https://github.com/kmsibtain/BaltistanBooks/stargazers)
[![Forks](https://img.shields.io/github/forks/kmsibtain/BaltistanBooks?style=for-the-badge)](https://github.com/kmsibtain/BaltistanBooks/network/members)
[![Issues](https://img.shields.io/github/issues/kmsibtain/BaltistanBooks?style=for-the-badge)](https://github.com/kmsibtain/BaltistanBooks/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/kmsibtain/BaltistanBooks">
    <img src="https://via.placeholder.com/120x120/4B0082/FFFFFF?text=📚" alt="Logo" width="120" height="120">
  </a>

  <h1 align="center">📚 Baltistan Book Depot</h1>
  <p align="center">
    A complete Point of Sale (POS) & Inventory Management System for bookshops in Gilgit-Baltistan
    <br />
    <br />
    <a href="https://baltistan-book-depot.web.app"><strong>🌐 Live Demo</strong></a>
    ·
    <a href="https://github.com/kmsibtain/BaltistanBooks/issues">🐛 Report Bug</a>
    ·
    <a href="https://github.com/kmsibtain/BaltistanBooks/issues">✨ Request Feature</a>
  </p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary><strong>📑 Table of Contents</strong></summary>
  <ol>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-screenshots">Screenshots</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#-api-endpoints">API Endpoints</a></li>
    <li><a href="#-firebase-setup">Firebase Setup</a></li>
    <li><a href="#-contributing">Contributing</a></li>
    <li><a href="#-license">License</a></li>
    <li><a href="#-contact">Contact</a></li>
  </ol>
</details>
<br />

---

## ⭐ Features

| Feature | Description |
|---------|-------------|
| 🛒 **Full POS System** | Cash & credit sales with fast checkout |
| 📦 **Real-time Inventory** | Track stock levels with low stock alerts |
| 📒 **Creditors Ledger** | Udhari management with transaction history |
| 🏭 **Supplier Tracking** | Monitor supplier payments & balances |
| 📊 **Sales Reports** | Daily & monthly revenue analytics |
| ✏️ **Product Management** | Add/edit products with price & stock history |
| 🖨️ **Receipt Printing** | Thermal receipts & A4 invoices |
| 📱 **Responsive Design** | Works perfectly on mobile, tablet & desktop |
| ⚡ **Offline-capable** | Firebase powered – no MongoDB needed |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js + Vite + Tailwind CSS + Shadcn/ui |
| **Backend** | Node.js + Express.js |
| **Database** | Firebase Firestore (replaces MongoDB) |
| **Auth** | Firebase Authentication (optional) |
| **Hosting** | Firebase Hosting / Vercel |
| **CI/CD** | GitHub Actions (coming soon) |

> 💡 **MERN but better**: We replaced MongoDB with **Firebase Firestore** for faster development, real-time sync, and zero server maintenance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 📸 Screenshots

<div align="center">

### 🏠 Dashboard Overview
![Dashboard](https://via.placeholder.com/800x450/1e293b/ffffff?text=Dashboard+Preview)  
*Today's sales, monthly revenue, outstanding credits & low stock alerts*

---

### 🛒 Point of Sale (New Sale)
![POS](https://via.placeholder.com/800x450/0f172a/ffffff?text=New+Sale+Screen)  
*Fast product search, cart system, cash/credit toggle*

---

### 📦 Inventory Management
![Inventory](https://via.placeholder.com/800x450/1e293b/ffffff?text=Inventory+List)  
*Stock levels, price history, quick actions*

---

### 📒 Creditors Ledger
![Creditors](https://via.placeholder.com/800x450/0f172a/ffffff?text=Creditors+Ledger)  
*Track udhari, record payments, view transaction history*

---

### 📊 Sales History & Reports
![Sales History](https://via.placeholder.com/800x450/1e293b/ffffff?text=Sales+History+Filters)  
*Filter by date, payment type, creditor*

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase project** (free tier is enough)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kmsibtain/BaltistanBooks.git
cd BaltistanBooks

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```
Firebase Setup

    Go to Firebase Console
    Create a new project
    Enable Firestore Database (in Native mode)
    Go to Project Settings → Service Accounts → Generate new private key
    Download as serviceAccountKey.json and place in backend/
    (Optional) Enable Firebase Authentication if you want login
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Seed initial data (run once)
cd backend
node scripts/seed.js

🎉 App will be running at: http://localhost:5173
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🚀 Project Structure

This project follows a standard **MERN-stack-like architecture** (using Express, React, and Firestore/Firebase) with separate directories for the backend API and the frontend client.

---

### `BaltistanBooks/` Directory Overview

| Directory | Description | Key Files/Folders |
| :--- | :--- | :--- |
| `backend/` | **Express API** for handling all business logic, database interaction (Firestore), and authentication. | `controllers/`, `models/`, `routes/`, `server.js` |
| `frontend/` | **React Client** built with Vite for the user interface. | `src/components/`, `src/pages/`, `src/App.jsx` |
| `README.md` | This documentation file. | |
| `.gitignore` | Specifies intentionally untracked files to ignore. | |

---

### 💻 Backend Structure (`backend/`)

| Folder/File | Purpose |
| :--- | :--- |
| `controllers/` | Contains the **route handler functions** that execute business logic and interact with the database. |
| `models/` | Defines the **data structures and methods** for interacting with Firestore collections. |
| `routes/` | Defines the **API endpoints** and maps them to the appropriate controller functions. |
| `middleware/` | Contains functions for tasks like **authentication, authorization, and input validation** that run before route handlers. |
| `scripts/` | Stores **utility scripts** (e.g., seeding the database with initial data). |
| `serviceAccountKey.json` | **Firebase/Firestore credentials** (MUST be kept secure and ignored in `.gitignore`). |
| `server.js` | The **entry point** for the Express application. |
| `package.json` | Lists backend dependencies and scripts. |

### 🎨 Frontend Structure (`frontend/src/`)

| Folder/File | Purpose |
| :--- | :--- |
| `components/` | **Reusable, atomic UI elements** (e.g., buttons, forms, navigation bars). |
| `pages/` | Components that serve as the **main views/routes** of the application. |
| `hooks/` | **Custom React Hooks** to encapsulate complex logic and state management. |
| `services/` | Functions dedicated to making **API calls** to the backend. |
| `context/` | Manages **global state** using React's Context API. |
| `App.jsx` | The main component where **routing and global layout** are typically defined. |

---

## 🔌 API Endpoints

The API is organized into four main resource groups: **Products**, **Sales**, **Creditors**, and **Suppliers**. All endpoints are prefixed with `/api`.

### 📦 Products

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve a list of all products. |
| `POST` | `/api/products` | Add a new product to the inventory. |
| `PUT` | `/api/products/:id` | Update the details of an existing product (by ID). |
| `DELETE` | `/api/products/:id` | Remove a product from the inventory (by ID). |

### 📈 Sales

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sales` | Retrieve a list of all sales records. |
| `POST` | `/api/sales` | Create and record a new sale transaction. |
| `GET` | `/api/sales/today` | Get all sales recorded for the current date. |
| `GET` | `/api/sales/report` | Generate a comprehensive sales report (with optional date range query parameters). |

### 🤝 Creditors (Accounts Receivable)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/creditors` | Get a list of all entities/customers with outstanding credit. |
| `POST` | `/api/creditors` | Add a new creditor (e.g., when a sale is made on credit). |
| `POST` | `/api/creditors/:id/payment` | Record a payment received from a specific creditor (by ID). |
| `GET` | `/api/creditors/:id/transactions` | Get the full transaction history for a specific creditor. |

### 🚚 Suppliers (Accounts Payable)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/suppliers` | Get a list of all registered suppliers. |
| `POST` | `/api/suppliers` | Add a new supplier. |
| `PUT` | `/api/suppliers/:id` | Update the details of an existing supplier. |

---🔥 Firebase Setup
Environment Variables

Create a .env file in the backend/ directory:

```env

# Backend .env
PORT=5000
NODE_ENV=development

Create a .env file in the frontend/ directory:
```
```env

# Frontend .env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```
Firestore Collections

📂 Firestore Database <br>
├── 📁 products<br>
│   └── { name, price, stock, category, barcode, createdAt }<br>
├── 📁 sales<br>
│   └── { items[], total, paymentType, creditorId?, createdAt }<br>
├── 📁 creditors<br>
│   └── { name, phone, balance, transactions[], createdAt }<br>
└── 📁 suppliers<br>
    └── { name, phone, balance, createdAt }<br>

<p align="right">(<a href="#readme-top">back to top</a>)</p>
🤝 Contributing

Contributions are what make the open source community amazing! Any contributions you make are greatly appreciated.

    Fork the Project
    Create your Feature Branch (git checkout -b feature/AmazingFeature)
    Commit your Changes (git commit -m 'Add some AmazingFeature')
    Push to the Branch (git push origin feature/AmazingFeature)
    Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

📬 Contact

KM Sibtain - @kmsibtain

Project Link: https://github.com/kmsibtain/BaltistanBooks

