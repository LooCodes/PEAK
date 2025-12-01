# 🏔️ PEAK

A fitness web application built with:

- Frontend: React + TypeScript + Vite  
- Backend: Python (FastAPI) with Uvicorn

---

## 🚀 Getting Started

### 1. Clone the Repository and Enter the Project

```bash
git clone https://github.com/LooCodes/PEAK.git
cd PEAK
```

---

## 📦 Install pnpm (one time per computer)

If you do not already have pnpm installed, run:

```bash
npm install -g pnpm
```

---

## ⚡ Frontend Setup

> The frontend should run in its own terminal window.

### 1. Go to the frontend folder

```bash
cd peak-frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the frontend development server

```bash
pnpm run dev
```

The frontend will be available at:

http://localhost:5173

Keep this terminal open while working on the frontend.

---

## 🐍 Backend Setup

> The backend should run in a separate terminal window.

### 1. Go to the backend folder

From the project root:

```bash
cd backend
```
### 2. Create and activate a Python virtual environment

Mac or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows (PowerShell):

```powershell
python -m venv .venv\Scripts\activate
```

Once activated, you should see (.venv) at the start of your terminal prompt.

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure backend environment variables (required)

The backend requires environment variables for API keys and database access.  
These values are not included in this repository for security reasons.

Please reach out to a team member to receive the required .env file or values.
```bash
# backend/.env

DATABASE_URL
NUTRITION_API_KEY
EXERCISEDB_API_KEY
EXERCISEDB_API_HOST
```

### 5. Run the backend server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend API will be available at:

http://localhost:8000

Keep this terminal open while working on the backend.

---

## ✅ Development Notes

- Always run frontend and backend in separate terminals.
- The backend will not function without proper environment variables.
- Restart the backend after dependency changes.
- If the backend is down, the frontend will not load data correctly.

---

## ✅ Typical Workflow

### Terminal 1 (frontend)
```bash
cd peak-frontend
pnpm run dev
```

### Terminal 2 (backend)
```bash
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn app.main:app --port 8000
```

---

You are now ready to work on PEAK 💪