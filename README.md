# Stayza — PG & Hostel Room Allocation and Complaint Management System

A full-stack hostel/PG management platform with AI-powered roommate matching, complaint auto-escalation, payment tracking, and peer feedback ratings.

---

# 🚀 HOW TO RUN THIS PROJECT

> **Read EVERY step. Do them IN ORDER. Don't skip anything.**
> **Copy-paste the commands exactly as shown.**

---

## STEP 0: INSTALL REQUIRED SOFTWARE

You need **3 things** installed on your computer before anything else.

### 0A: Install Node.js

1. Go to **https://nodejs.org**
2. Click the big green **"Download"** button (LTS version)
3. Run the installer → click Next → Next → Next → Install → Finish
4. **Verify it worked:** Open a terminal and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x` or `v22.x.x`. If you see an error, restart your computer and try again.

### 0B: Install Python

1. Go to **https://www.python.org/downloads/**
2. Click **"Download Python 3.12"** (or whatever the latest version is)
3. Run the installer
4. ⚠️ **IMPORTANT: CHECK THE BOX THAT SAYS "Add Python to PATH"** ⚠️ (it's at the bottom of the first screen)
5. Click "Install Now"
6. **Verify it worked:**
   ```
   python --version
   ```
   You should see `Python 3.12.x` or similar. If it says "not recognized", you forgot to check "Add to PATH" — uninstall and reinstall Python.

### 0C: Install PostgreSQL

1. Go to **https://www.postgresql.org/download/**
2. Click your operating system (Windows / macOS / Linux)
3. **Windows:** Click "Download the installer" → pick the latest version → download and run it
4. **During installation, it will ask you to set a password for the `postgres` user**
5. ⚠️ **WRITE THIS PASSWORD DOWN. YOU WILL NEED IT LATER.** ⚠️
6. Leave the port as **5432** (default)
7. Click Next through everything else → Install → Finish
8. It will also install **pgAdmin 4** — that's the GUI tool for managing your database

### 0D: Verify PostgreSQL is running

**Windows:**
- Press `Win + R`, type `services.msc`, press Enter
- Scroll down to find **"postgresql-x64-XX"** (where XX is your version number like 16, 17, 18)
- Make sure it says **"Running"** in the Status column
- If it says "Stopped", right-click it → Start

**Mac:**
- If you installed via Homebrew: `brew services start postgresql`
- If you used the installer: it should be running automatically

---

## STEP 1: DOWNLOAD THE PROJECT

Open a terminal (PowerShell on Windows, Terminal on Mac) and run:

```bash
git clone <paste-your-repo-url-here>
```

Then go into the project folder:

```bash
cd stayza
```

> **Replace `stayza` with whatever the folder is actually called** (look at what git created)

---

## STEP 2: CREATE THE DATABASE

You need to create a database called `stayza_db` inside PostgreSQL.

### Option A: Using pgAdmin (EASIEST — recommended for beginners)

1. Open **pgAdmin 4** from your Start Menu (Windows) or Applications (Mac)
2. First time? It will ask you to set a **master password** for pgAdmin itself — set anything and remember it
3. On the left sidebar, click the arrow ▶ next to **Servers**
4. Click the arrow ▶ next to **PostgreSQL XX** (your version)
5. It will ask for your **PostgreSQL password** — this is the password you set during installation in Step 0C
6. Type it and click OK
7. Now right-click **Databases** → **Create** → **Database...**
8. In the "Database" field, type: **stayza_db**
9. Click **Save**
10. Done! You should see `stayza_db` in the list on the left

### Option B: Using the command line

**Windows:**
```
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```
> Change `18` to your actual PostgreSQL version number (check in `C:\Program Files\PostgreSQL\` to see what folder exists)

**Mac/Linux:**
```
psql -U postgres
```

It will ask for your password. Type the password you set during installation and press Enter.

Once you see `postgres=#`, type:
```sql
CREATE DATABASE stayza_db;
```
Then type:
```
\q
```
to exit.

---

## STEP 3: SET UP THE BACKEND (Django)

### 3A: Go to the backend folder

```bash
cd backend
```

### 3B: Create the environment file

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 3C: Edit the .env file with YOUR database password

Open the file `backend/.env` in any text editor (Notepad, VS Code, whatever).

Find this line:
```
DB_PASSWORD=your_postgres_password
```

Change `your_postgres_password` to **the actual password you set when installing PostgreSQL**.

For example, if your password is `mypass123`:
```
DB_PASSWORD=mypass123
```

**Save the file.**

### 3D: Create a virtual environment

**Windows:**
```powershell
python -m venv venv
```

**Mac/Linux:**
```bash
python3 -m venv venv
```

### 3E: Activate the virtual environment

**Windows (PowerShell):**
```powershell
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

> You should now see `(venv)` at the beginning of your terminal line. If you don't see it, the activation didn't work — try again.

### 3F: Install Python packages

```bash
pip install -r requirements.txt
```

> This will download a bunch of packages. Wait for it to finish. It might take 1-2 minutes.

### 3G: Create database tables

```bash
python manage.py makemigrations
python manage.py migrate
```

> If you get a "password authentication failed" error here, your password in `.env` is wrong. Go back to Step 3C and fix it.

### 3H: Load sample data

```bash
python manage.py seed_data
```

> This creates test users, rooms, complaints, payments, and feedback so you can test the app immediately.

### 3I: Start the backend server

```bash
python manage.py runserver
```

✅ **If you see:** `Starting development server at http://127.0.0.1:8000/` — **the backend is running!**

> ⚠️ **KEEP THIS TERMINAL OPEN. Don't close it. The backend needs to stay running.**

---

## STEP 4: SET UP THE FRONTEND (React)

### 4A: Open a NEW terminal window

**Don't close the backend terminal.** Open a completely new/separate terminal window.

### 4B: Go to the project root folder

```bash
cd path/to/stayza
```

> Replace `path/to/stayza` with the actual path to your project. For example:
> - Windows: `cd C:\Users\YourName\Desktop\stayza`
> - Mac: `cd ~/Desktop/stayza`

### 4C: Create the frontend environment file

**Windows:**
```powershell
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 4D: Install frontend packages

```bash
npm install
```

> This downloads all the JavaScript packages. Wait for it to finish (1-3 minutes).

### 4E: Start the frontend

```bash
npm run dev
```

✅ **If you see:** `Local: http://localhost:5173/` — **the frontend is running!**

---

## STEP 5: OPEN THE APP

1. Open your web browser (Chrome, Firefox, Edge — anything)
2. Go to: **http://localhost:5173**
3. You should see the Stayza landing page!

---

## STEP 6: LOG IN

Use these test accounts (created by the seed_data command):

### Student Accounts

| Username | Password | What you'll see |
|----------|----------|-----------------|
| `john` | `student123` | Student dashboard — room, complaints, payments, feedback |
| `priya` | `student123` | Same as above |
| `arjun` | `student123` | Same as above |
| `alice` | `student123` | Same as above |
| `dev` | `student123` | Same as above |
| `sara` | `student123` | Same as above |
| `rahul` | `student123` | Same as above |
| `meera` | `student123` | Same as above |

### Admin Account

| Username | Password | What you'll see |
|----------|----------|-----------------|
| `admin` | `admin123` | Admin dashboard — all rooms, complaints, payments, staff |

### Staff Accounts

| Username | Password |
|----------|----------|
| `ravi` | `staff123` |
| `suresh` | `staff123` |
| `mani` | `staff123` |
| `karthik` | `staff123` |

---

## ❌ SOMETHING NOT WORKING? READ THIS.

### "password authentication failed for user postgres"
**What it means:** Your database password is wrong.
**Fix:** Open `backend/.env` and change `DB_PASSWORD` to the password you set when installing PostgreSQL.

### "database stayza_db does not exist"
**What it means:** You didn't create the database.
**Fix:** Go back to Step 2 and create it.

### "psql is not recognized"
**What it means:** PostgreSQL's command line tool isn't in your PATH.
**Fix:** Use the full path instead:
- Windows: `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`
- Change `18` to your version number

### "python is not recognized"
**What it means:** Python isn't in your PATH.
**Fix:** Uninstall Python, reinstall it, and **CHECK THE "Add to PATH" BOX** during installation.

### "npm is not recognized"
**What it means:** Node.js isn't installed.
**Fix:** Go back to Step 0A and install it.

### "No module named django" or "ModuleNotFoundError"
**What it means:** You forgot to activate the virtual environment.
**Fix:** Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux) first, then try again.

### "No changes detected" when running makemigrations
**What it means:** This is actually fine! It means migrations already exist. Just continue to the next step.

### Frontend shows "Network Error" or blank page
**What it means:** The backend isn't running.
**Fix:** Make sure the backend terminal is still open and showing `Starting development server at http://127.0.0.1:8000/`. If you closed it, go back to Step 3I.

### "port 5432 connection refused"
**What it means:** PostgreSQL isn't running.
**Fix:**
- Windows: Open Services (`Win + R` → `services.msc`), find `postgresql-x64-XX`, right-click → Start
- Mac: Run `brew services start postgresql`

### "FATAL: role postgres does not exist"
**What it means:** PostgreSQL was installed with a different default user.
**Fix:** Try using your computer username instead. Open `backend/.env` and change `DB_USER=postgres` to `DB_USER=your_computer_username`.

### The page loads but looks broken / no styles
**What it means:** The frontend build might be stale.
**Fix:** In the frontend terminal, press `Ctrl+C` to stop it, then run `npm run dev` again.

### I changed something and now nothing works
**Fix:** Stop both terminals (`Ctrl+C`), then:
1. Backend terminal: `cd backend` → `venv\Scripts\activate` → `python manage.py runserver`
2. Frontend terminal: `cd stayza` → `npm run dev`

---

## 📁 PROJECT STRUCTURE

```
stayza/
├── backend/                    # Django REST API
│   ├── config/                 # Settings, URLs, Celery config
│   ├── apps/
│   │   ├── accounts/           # Users, auth, roommate matching
│   │   ├── rooms/              # Rooms & bookings
│   │   ├── complaints/         # Complaints + auto-escalation
│   │   ├── payments/           # Payment tracking
│   │   └── feedback/           # Roommate peer reviews
│   ├── .env.example            # ← Copy this to .env and edit
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # Layout, UI components
│   ├── pages/                  # All page components
│   ├── services/api.ts         # API calls to backend
│   └── store/useAuthStore.ts   # Auth state management
├── .env.example                # ← Copy this to .env
├── package.json
└── README.md                   # You are here
```

---

## 🧠 HOW THE APP WORKS

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
- Runs via Celery background job (optional) or can be triggered manually

### Feedback System
- Students rate roommates (1–5 stars) on cleanliness, noise, and overall experience after checkout
- Ratings feed into the roommate matching algorithm
- Good roommates rise to the top of match results

---

## 📝 LICENSE

MIT
