# Stayza — PG & Hostel Management System

## Complete Setup Instructions

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 14+** running locally
- **Redis** (optional — needed only for Celery background jobs)

---

### 1. Database Setup

Open a PostgreSQL shell (`psql`) and create the database:

```sql
CREATE DATABASE stayza_db;
```

If your PostgreSQL user/password differs from `postgres/postgres`,
update `backend/.env` accordingly.

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed the database with sample data
python manage.py seed_data

# Create a Django superuser (optional, for /admin panel)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The backend runs at **http://localhost:8000**.
Django admin panel: **http://localhost:8000/admin/**

---

### 3. Frontend Setup

```bash
# From the project root (not backend/)
npm install

# Start the dev server
npm run dev
```

The frontend runs at **http://localhost:5173**.

---

### 4. Test Credentials (from seed data)

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Staff   | ravi     | staff123    |
| Staff   | suresh   | staff123    |
| Staff   | mani     | staff123    |
| Staff   | karthik  | staff123    |
| Student | john     | student123  |
| Student | priya    | student123  |
| Student | arjun    | student123  |
| Student | alice    | student123  |
| Student | dev      | student123  |
| Student | sara     | student123  |
| Student | rahul    | student123  |
| Student | meera    | student123  |

---

### 5. Background Jobs (Optional — Celery)

For auto-escalation of complaints (every 30 minutes):

```bash
# Terminal 1: Celery worker
cd backend
celery -A config worker -l info

# Terminal 2: Celery beat scheduler
cd backend
celery -A config beat -l info
```

Requires Redis running on `localhost:6379`.

If you don't run Celery, you can manually trigger escalation:

```bash
cd backend
python manage.py shell -c "from apps.complaints.tasks import escalate_overdue_complaints; print(escalate_overdue_complaints())"
```

---

### 6. API Endpoints Reference

#### Auth (`/api/auth/`)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/auth/register/`     | Register new user        |
| POST   | `/auth/login/`        | Login (returns JWT)      |
| POST   | `/auth/token/refresh/` | Refresh JWT token       |
| GET    | `/auth/profile/`      | Get current user profile |
| PATCH  | `/auth/profile/`      | Update profile           |
| GET    | `/auth/roommate-matches/` | Get roommate scores  |
| GET    | `/auth/staff/`        | List staff (admin only)  |

#### Rooms (`/api/rooms/`)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/rooms/`             | List all rooms           |
| POST   | `/rooms/create/`      | Create room (admin)      |
| GET    | `/rooms/<id>/`        | Room detail              |
| PATCH  | `/rooms/<id>/`        | Update room (admin)      |
| POST   | `/rooms/book/`        | Book a room              |
| POST   | `/rooms/checkout/`    | Checkout                 |
| GET    | `/rooms/my-bookings/` | My bookings              |
| GET    | `/rooms/all-bookings/`| All bookings (admin)     |
| POST   | `/rooms/admin-assign/`| Assign student (admin)   |

#### Complaints (`/api/complaints/`)
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/complaints/`            | All complaints (admin)   |
| POST   | `/complaints/create/`     | File complaint           |
| GET    | `/complaints/mine/`       | My complaints            |
| GET    | `/complaints/<id>/`       | Complaint detail         |
| PATCH  | `/complaints/<id>/`       | Update complaint (admin) |
| POST   | `/complaints/<id>/assign/`| Assign to staff          |
| POST   | `/complaints/<id>/resolve/`| Mark resolved           |

#### Payments (`/api/payments/`)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/payments/`          | All payments (admin)     |
| GET    | `/payments/mine/`     | My payments              |
| POST   | `/payments/create/`   | Create payment (admin)   |
| POST   | `/payments/<id>/pay/` | Mark as paid             |
| GET    | `/payments/summary/`  | Payment stats (admin)    |

---

### Project Structure

```
stayza/
├── backend/                    # Django backend
│   ├── config/                 # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── accounts/           # User model, auth, roommate matching
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── management/commands/seed_data.py
│   │   ├── rooms/              # Room & booking management
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── complaints/         # Complaint system with auto-escalation
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── tasks.py        # Celery escalation task
│   │   └── payments/           # Payment tracking
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       └── urls.py
│   ├── .env
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── animations/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── student/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Rooms.tsx
│   │   │   ├── Payment.tsx
│   │   │   ├── Complaints.tsx
│   │   │   ├── RoommateMatching.tsx
│   │   │   └── Chatbot.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Complaints.tsx
│   │   │   ├── Allocation.tsx
│   │   │   ├── Payments.tsx
│   │   │   └── Staff.tsx
│   │   └── Landing.tsx
│   ├── services/api.ts         # Axios API layer
│   ├── store/useAuthStore.ts   # Zustand auth state
│   └── App.tsx                 # Router config
├── .env                        # Frontend env vars
├── package.json
└── SETUP.md
```
