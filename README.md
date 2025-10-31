# 🏔️ PEAK

A fitness web application built with **React + TypeScript + Vite (frontend)** and **Python (backend)**.

---

## 🧩 Prerequisites

Install **pnpm** globally (one-time per machine):

```bash
npm install -g pnpm
```

## ⚡ Frontend Setup
### 1. Go to the frontend app
```bash
cd frontend/peak-frontend
```

### 2. Install Dependencies
Use **pnpm** (recommended for faster installs and smaller disk usage):
```bash
pnpm install
```

### 2. Start the Development Server
```bash
pnpm run dev
```

Your app will be available at **http://localhost:5173**

### 3. Notes
- Tailwind CSS v4 is configured with PostCSS + Vite (no `tailwind.config.js` needed by default).
- Environment variables (if any) can go in a `.env.local` file:
  ```bash
  VITE_API_URL=http://localhost:8000

To add new packages:

```bash
pnpm add <package-name>
```



🐍 Backend Setup
1. Create and Activate a Python Virtual Environment

Mac/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\activate
```

2. Install Dependencies

```bash
pip install -r requirements.txt
```

3. Run the Backend

TBD