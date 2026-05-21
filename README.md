# Ambatu Bus - Shuttle Booking & Tracking System

Ambatu Bus is a comprehensive shuttle management solution featuring a high-fidelity mobile application for customers and drivers, paired with a robust web-based administrative dashboard. The project is built with a focus on "Serene Transit"—providing a calm, reliable, and modern travel experience.

## 🌿 Design Philosophy: Serene Transit
The system utilizes a nature-inspired aesthetic ("Forest Green" and "Sage" tones) with a modern **Glassmorphism** UI. It focuses on clarity, ease of use, and visual stability, ensuring that users can book and track their journeys without stress.

## 🚀 Tech Stack

### Backend (API & Admin)
- **Framework:** Laravel 11
- **Database:** SQLite (Local Development)
- **Authentication:** Laravel Sanctum (Token-based for Mobile, Session-based for Web)
- **Styling:** Tailwind CSS (Admin Dashboard)
- **Charts:** Chart.js

### Mobile Application
- **Framework:** Ionic Framework (Angular)
- **Design:** Custom SCSS with CSS Variables (Design System)
- **Icons:** Material Symbols & Google Fonts (Hanken Grotesk)
- **Maps:** Leaflet.js with OpenStreetMap

## ✨ Key Features

### 📱 Mobile App (Customer & Driver)
- **Onboarding:** Smooth introduction to the app's core values.
- **Smart Booking:** Interactive 2-2 seat map selection with real-time availability.
- **QRIS Payment:** Integrated payment flow with a 15-minute countdown timer and unique QR generation.
- **Live Tracking:** Real-time shuttle movement on an interactive map using Leaflet.
- **Role-based Dashboard:** 
  - **Customers:** Search schedules, manage bookings, and view AmbatuPay balance.
  - **Drivers:** Manage assigned trips, update GPS location, and start/complete journeys.

### 💻 Admin Dashboard (Web)
- **Operational Overview:** Real-time statistics and 7-day booking trend charts.
- **Master Data Management:** Full CRUD (Create, Read, Update, Delete) for Vehicles and Schedules.
- **User Management:** Monitor and manage drivers and customer accounts.
- **Live Monitoring:** Track all active trips and recent successful bookings in one place.

## 🛠️ Installation & Setup

### Prerequisites
- PHP 8.2+
- Node.js & NPM
- Composer
- Ionic CLI (`npm install -g @ionic/cli`)

### Backend Setup (Laravel)
1. Navigate to the `Laravel` directory:
   ```bash
   cd Laravel
   ```
2. Install dependencies:
   ```bash
   composer install
   ```
3. Setup environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Run migrations and seeders:
   ```bash
   php artisan migrate:fresh --seed
   ```
5. Start the server:
   ```bash
   php artisan serve
   ```

### Mobile Setup (Ionic)
1. Navigate to the `IONIC` directory:
   ```bash
   cd IONIC
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   ionic serve
   ```

## 🔐 Credentials (Demo)
Use the following accounts to explore the system (Password: `password`):
- **Admin:** `admin@shuttle.com`
- **Customer:** `alice@gmail.com`
- **Driver:** `driver1@shuttle.com`

---
Built with ❤️ for a better transit experience.
