# SAP-1 Web-Based Simulator

A web-based simulation of the **SAP-1 (Simple As Possible) Computer** built with **Laravel**, **Vue.js (Inertia)**, and **GSAP animations**.  
This simulator allows users to load 8-bit binary programs, step through the instruction cycle manually or automatically, and visualize internal operations with animated data movement.

---

## 🛠 Tools Required

Before installing, make sure you have the following installed on your system:

- **PHP** ≥ 8.1 (with Composer) – For Laravel backend
- **Node.js** ≥ 18.x & **npm** – For frontend build
- **MySQL Server** – For database storage
- **Herd** (optional) – Local Laravel development environment for macOS
- **Git** – To clone the repository (optional but recommended)

---

## 📦 Installation Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-repo/sap1-simulator.git
cd sap1-simulator
```

### 2️⃣ Install PHP Dependencies
```bash
composer install
```

### 3️⃣ Install JavaScript Dependencies
```bash
npm install
```

### 4️⃣ Copy `.env` File
```bash
cp .env.example .env
```

### 5️⃣ Generate Application Key
```bash
php artisan key:generate
```

### 6️⃣ Configure Database
Open the `.env` file and update database settings based on your MySQL username and password:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sap-1
DB_USERNAME=root
DB_PASSWORD=password
```

### 7️⃣ Create Storage Link
```bash
php artisan storage:link
```

### 8️⃣ Run Migrations
```bash
php artisan migrate
```

### 9️⃣ Build Frontend Assets
```bash
npm run build
```

---

## 🚀 Running the Application

### Local Development Server
```bash
php artisan serve
```
By default, the app runs at:
```
http://127.0.0.1:8000
```

---

## 📖 Usage (Quick Guide)

1. Open the simulator in your browser.
2. Click **Upload Program** and select a `program_instructions.txt` file containing valid 8-bit binary instructions.
3. Choose **Manual** or **Automatic** mode.
4. Observe animations showing data movement and active components.
5. View the binary output in the output register.
6. Optionally export the execution log as a `.txt` file.
