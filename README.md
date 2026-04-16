# AdminPro - Role-Based Admin Portal (Frontend)

A premium, dynamic administrative interface built with **React** and **Vite**. This frontend serves as the control center for a fully dynamic, role-based access control (RBAC) system.

## 🚀 Key Features

- **Dynamic Menu System**: Sidebar menus are fetched and rendered recursively from the server based on user permissions.
- **Deep Nesting**: Supports infinite submenu levels (e.g., Reports > Financial > Tax).
- **Advanced RBAC**: Granular permission management with a hierarchical tree view in the Role configuration.
- **Icon Management**: Support for both standard **Lucide-React** icons and **External URLs** (SVG/Image paths).
- **Responsive Design**: Premium glassmorphism UI with Dark/Light mode support.
- **Stable Routing**: Implements `HashRouter` to prevent 404 errors on page refreshes across all static hosting platforms.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router Dom v6 (HashRouter)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with Glassmorphism aesthetics

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/prathapprathap/rolefrontend.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=https://rolebackend.onrender.com/api
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 🌐 Deployment on Render

This project is optimized for **Render Static Sites**:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: Set `VITE_API_URL` to your live backend URL.

## 📄 License
MIT
