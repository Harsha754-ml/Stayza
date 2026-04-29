# Stayza — PG & Hostel Room Allocation and Complaint Management System

A full-stack hostel/PG management platform with AI-powered roommate matching, complaint auto-escalation, payment tracking, and peer feedback ratings.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Django](https://img.shields.io/badge/Django-5.1-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue?logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)

---

## 🚀 How to Run This Project (Step by Step)

> **Read every step. Don't skip anything. Copy-paste the commands exactly.**

---

### STEP 0: Install These First (if you don't have them)

You need these 3 things installed on your computer:

| Software | Download Link | How to check if installed |
|----------|--------------|--------------------------|
| **Node.js** (v18+) | https://nodejs.org | Open terminal, type `node --version` |
| **Python** (v3.11+) | https://python.org | Open terminal, type `python --version` |
| **PostgreSQL** (v14+) | https://www.postgresql.org/download/ | Check if pgAdmin app exists on your PC |

⚠️ **When installing Python**, check the box that says **"Add Python to PATH"**.
⚠️ **When installing PostgreSQL**, it will ask you to set a password. **REMEMBER THIS PASSWORD.** You'll need it in Step 2.

---

### STEP 1: Clone the Project

Open a terminal (PowerShell on Windows, Terminal on Mac) and run:

```bash
git clone https://github.com/Harsha754-ml/Stayza
cd stayza
```

---

### STEP 2: Create the Database

#### Option A: Using pgAdmin (the GUI app — easiest)

1. Open **pgAdmin 4** from your Start Menu / Applications
2. It will ask for a master password — set one and remember it
3. On the left sidebar, click the arrow next to **Servers** → **PostgreSQL**
4. It asks for your PostgreSQL password (the one from installation) — type it
5. Right-click **Databases** → **Create** → **Database...**
6. Type `stayza_db` in the Database name field
7. Click **Save**

#### Option B: Using the terminal

```bash
psql -U postgres
```
It will ask for your password. Type it and press Enter. Then:
```sql
CREATE DATABASE stayza_db;
\q
```

> **If `psql` is not recognized:** The full path is probably:
> - Windows: `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`
> - Mac: `/Library/PostgreSQL/18/bin/psql -U postgres`
> (Change `18` to your version number)

---

### STEP 3: Configure the Backend

Open the file `backend/.env.example` and **copy it** to create `backend/.env`:

**Windows (PowerShell):**
```powershell
cd backend
copy .env.example .env
```

**Mac/Linux:**
```bash
cd backend
cp .env.example .env
```

Now **open `backend/.env`** in any text editor and change this line:

```
DB_PASSWORD=your_postgres_password
```

Replace `your_postgres_password` with the **actual password you set when installing PostgreSQL**.

For example, if your password is `mypass123`:
```
DB_PASSWORD=mypass123
```

Save the file.

---

### STEP 4: Start the Backend

Run these commands **one by one** (make sure you're in the `backend` folder):

**Windows:**
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

✅ If you see `Starting development server at http://127.0.0.1:8000/` — the backend is running!

> **Keep this terminal open.** Don't close it.

---

### STEP 5: Start the Frontend

Open a **NEW terminal window** (don't close the backend one). Navigate to the project root:

```bash
cd path/to/stayza
```

Then copy the env file and start:

**Windows:**
```powershell
copy .env.example .env
npm install
npm run dev
```

**Mac/Linux:**
```bash
cp .env.example .env
npm install
npm run dev
```

✅ If you see `Local: http://localhost:5173/` — the frontend is running!

---

### STEP 6: Open the App

Open your browser and go to: **http://localhost:5173**

---

## 🔑 Login Credentials

The `seed_data` command creates test accounts. Use these to log in:

| Role | Username | Password | What you'll see |
|------|----------|----------|-----------------|
| **Admin** | `admin` | `admin123` | Admin dashboard with complaints, rooms, payments, staff |
| **Student** | `john` | `student123` | Student dashboard with room booking, complaints, feedback |
| **Student** | `priya` | `student123` | Same as above |
| **Student** | `arjun` | `student123` | Same as above |
| **Staff** | `ravi` | `staff123` | Admin dashboard (staff view) |

> All 8 students use password `student123`. All 4 staff use `staff123`.

---

## ❌ Common Errors and Fixes

### "password authentication failed for user postgres"
→ Wrong database password. Open `backend/.env` and fix `DB_PASSWORD`.

### "database stayza_db does not exist"
→ You didn't create the database. Go back to Step 2.

### "psql is not recognized"
→ Use the full path: `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`

### "python is not recognized"
→ Python isn't in your PATH. Reinstall Python and check **"Add to PATH"** during installation.

### "npm is not recognized"
→ Node.js isn't installed. Download it from https://nodejs.org

### "No module named django" or "pip not found"
→ You forgot to activate the virtual environment. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux) first.

### Backend starts but frontend shows "Network Error"
→ Make sure the backend is still running in the other terminal at http://localhost:8000

### "port 5432 connection refused"
→ PostgreSQL service isn't running. Open **Services** (Windows) or **Activity Monitor** (Mac) and start the PostgreSQL service.

---

## 📁 Project Structure

```
stayza/
├── backend/                    # Django REST API
│   ├── config/                 # Settings, URLs, Celery
│   ├── apps/
│   │   ├── accounts/           # Users, auth, roommate matching
│   │   ├── rooms/              # Rooms & bookings
│   │   ├── complaints/         # Complaints + auto-escalation
│   │   ├── payments/           # Payment tracking
│   │   └── feedback/           # Roommate peer reviews
│   ├── .env.example            # ← Copy this to .env
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # Layout, animations
│   ├── pages/                  # All page components
│   ├── services/api.ts         # API calls
│   └── store/useAuthStore.ts   # Auth state
├── .env.example                # ← Copy this to .env
├── package.json
└── README.md                   # You are here
```

---

## 🧠 Features Explained

### Roommate Matching Algorithm
```
score = (sleep_match + cleanliness_match + noise_match) × 70%
      + peer_reputation × 30%
```
- 70% comes from how well your preferences match
- 30% comes from how past roommates rated this person
- Students with no reviews get a neutral 50% reputation

### Complaint Auto-Escalation
- Complaints unresolved for 48+ hours automatically increase in priority
- Low → Medium → High → Flagged as escalated
- Runs via Celery background job (every 30 min) or can be triggered manually

### Feedback System
- Students rate roommates (1–5 stars) on cleanliness, noise, and overall experience
- Ratings feed into the roommate matching algorithm
- Available after checkout from a room

---

## 📝 License

MIT
