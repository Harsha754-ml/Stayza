# Stayza — PG & Hostel Management System

A full-stack hostel management platform with AI-powered roommate matching, complaint auto-escalation, payment tracking, and peer feedback ratings.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Django](https://img.shields.io/badge/Django-5.1-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue?logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Student Portal
- **Room Booking** — Browse available rooms, view occupancy, and book
- **Roommate Matching** — AI-scored matches based on sleep schedule, cleanliness, noise tolerance + peer reputation (70% preferences / 30% feedback)
- **Complaints** — File complaints with image upload, track status, auto-escalation after 48h
- **Payments** — View pending dues, pay via card/UPI, payment history
- **Feedback** — Rate roommates on cleanliness, noise, and overall experience (1–5 stars) after checkout
- **AI Chatbot** — Query room, complaint, and payment info via chat

### Admin Portal
- **Dashboard** — System metrics, escalated complaints, payment summaries
- **Complaint Queue** — Priority-sorted management, staff assignment, resolve actions
- **Room Allocation** — Grid/list view of all rooms, occupancy tracking, manual assignment
- **Payment Tracking** — Collection stats, overdue alerts, mark-as-paid
- **Staff Management** — View staff members and roles

### System
- JWT authentication with token refresh
- Role-based access control (Student / Admin / Staff)
- Auto-escalation of unresolved complaints via Celery
- Peer feedback integrated into roommate matching algorithm

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| Backend | Django 5.1, Django REST Framework |
| Database | PostgreSQL |
| State | Zustand |
| Auth | JWT (SimpleJWT) |
| Animations | Framer Motion, Three.js |
| Background Jobs | Celery + Redis |

## Project Structure

```
stayza/
├── backend/                    # Django REST API
│   ├── config/                 # Settings, URLs, Celery config
│   ├── apps/
│   │   ├── accounts/           # User model, auth, roommate matching
│   │   ├── rooms/              # Room & booking management
│   │   ├── complaints/         # Complaint system + auto-escalation
│   │   ├── payments/           # Payment tracking
│   │   └── feedback/           # Roommate peer reviews
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # Layout, animations, UI
│   ├── pages/                  # Student, admin, auth pages
│   ├── services/api.ts         # Axios API layer
│   └── store/useAuthStore.ts   # Zustand auth state
├── .env.example
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis (optional — only for Celery background jobs)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/stayza.git
cd stayza
```

### 2. Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE stayza_db;
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env        # Then edit .env with your DB credentials
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data   # Load sample data
python manage.py runserver   # Starts at http://localhost:8000
```

### 4. Frontend setup

```bash
# From project root (not backend/)
cp .env.example .env
npm install
npm run dev                  # Starts at http://localhost:5173
```

### 5. Optional: Background jobs (Celery)

For auto-escalation of complaints every 30 minutes:

```bash
cd backend
celery -A config worker -l info      # Terminal 1
celery -A config beat -l info        # Terminal 2
```

## Test Credentials

After running `seed_data`:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Staff | `ravi` | `staff123` |
| Student | `john` | `student123` |
| Student | `priya` | `student123` |
| Student | `arjun` | `student123` |

All 8 students use password `student123`. All 4 staff use `staff123`.

## API Reference

<details>
<summary>Auth — <code>/api/auth/</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | Login (returns JWT + user) |
| POST | `/auth/token/refresh/` | Refresh JWT token |
| GET/PATCH | `/auth/profile/` | Get/update profile |
| GET | `/auth/roommate-matches/` | Scored roommate matches |
| GET | `/auth/staff/` | List staff (admin only) |

</details>

<details>
<summary>Rooms — <code>/api/rooms/</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms/` | List all rooms |
| POST | `/rooms/create/` | Create room (admin) |
| GET/PATCH | `/rooms/<id>/` | Room detail/update |
| POST | `/rooms/book/` | Book a room |
| POST | `/rooms/checkout/` | Checkout |
| GET | `/rooms/my-bookings/` | My bookings |
| GET | `/rooms/all-bookings/` | All bookings (admin) |
| POST | `/rooms/admin-assign/` | Assign student to room |

</details>

<details>
<summary>Complaints — <code>/api/complaints/</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/complaints/` | All complaints (admin) |
| POST | `/complaints/create/` | File complaint (multipart) |
| GET | `/complaints/mine/` | My complaints |
| GET/PATCH | `/complaints/<id>/` | Detail/update |
| POST | `/complaints/<id>/assign/` | Assign to staff |
| POST | `/complaints/<id>/resolve/` | Mark resolved |

</details>

<details>
<summary>Payments — <code>/api/payments/</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/` | All payments (admin) |
| GET | `/payments/mine/` | My payments |
| POST | `/payments/create/` | Create payment record |
| POST | `/payments/<id>/pay/` | Mark as paid |
| GET | `/payments/summary/` | Payment stats (admin) |

</details>

<details>
<summary>Feedback — <code>/api/feedback/</code></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/feedback/submit/` | Submit roommate rating |
| GET | `/feedback/pending/` | Roommates awaiting review |
| GET | `/feedback/given/` | Reviews I've written |
| GET | `/feedback/received/` | Reviews about me |
| GET | `/feedback/` | All feedback (admin) |
| GET | `/feedback/reputation/<user_id>/` | User reputation score |

</details>

## Roommate Matching Algorithm

```
base_score  = (sleep_match + cleanliness_match + noise_match) / 3
reputation  = avg(peer_ratings) normalized to 0–1  (default 0.5 if no reviews)
final_score = base_score × 70% + reputation × 30%
```

- **Sleep match**: 1.0 if same schedule or either is flexible, else 0.0
- **Cleanliness match**: 1.0 − |diff| / 2
- **Noise match**: 1.0 − |diff| / 2
- **Reputation**: Average of cleanliness + noise + overall ratings from peer feedback, normalized from 1–5 scale to 0–1

## License

MIT
