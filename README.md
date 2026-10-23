# EMS — Employee Management System

A production-ready, full-stack Employee Management System built with Django 5.2, SQLite (dev), and a clean Bootstrap 5 UI inspired by Keka HR.

---

## Quick Start

```bash
# 1. Clone / navigate to project
cd /path/to/employeems

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Apply migrations (SQLite — no setup needed)
python manage.py migrate

# 5. Seed realistic development data
python manage.py seed_data

# 6. Run development server
python manage.py runserver
```

Visit: http://127.0.0.1:8000

---

## Dev Login Credentials

| Role     | Username       | Password        |
|----------|----------------|-----------------|
| HR Admin | `hr_admin`     | `HR@company123` |
| Manager  | `rahul.singh`  | `Employee@123`  |
| Employee | `anjali.gupta` | `Employee@123`  |

All seeded employees use password: `Employee@123`

---

## Run Tests

```bash
source venv/bin/activate
python -m pytest accounts/tests.py attendance/tests.py leaves/tests.py -v
```

---

## Project Structure

```
employeems/
├── accounts/        # Login, signup, auth
├── employees/       # Profiles, departments, designations, shifts
├── attendance/      # Clock-in/out, WFH requests, corrections
├── leaves/          # Leave types, balances, requests, approvals
├── teams/           # Team dashboard, org tree
├── notifications/   # Notification model and views
├── core/            # Audit log, utilities, HR dashboard, search
│   └── management/commands/seed_data.py
├── templates/       # All HTML templates
├── static/
│   ├── css/ems.css  # Design system
│   └── js/ems.js    # Chart helpers + interactions
├── ems/             # Django project settings and URLs
├── manage.py
├── requirements.txt
└── db.sqlite3       # Auto-created on migrate
```

---

## Key Features

- **Username + password login** (no email required)
- **Role-based access**: HR and Employee roles, server-enforced on every view
- **Keka-style sidebar**: Icon-only rail with hover tooltips
- **Employee Dashboard**: Quick access, profile card, leave balances, notifications
- **Attendance**: Clock-in/out (Office + WFH), weekly stats, shift schedule, correction requests
- **Leave Management**: 8 leave types, balance ledger, 4 Chart.js charts (doughnut + bar), history table
- **My Team**: Team summary, who's on leave today, team directory, interactive org tree
- **HR Portal**: Approve/reject leaves and WFH, manage employees, HR dashboard
- **Notifications**: Created on leave/WFH events, mark-as-read, notification bell
- **Global Search**: Role-scoped search for employees and leave requests
- **Audit Log**: All admin actions tracked

---

## Production Deployment (EC2)

1. Switch database to PostgreSQL in environment:
   ```
   DATABASE_URL=postgres://user:pass@host:5432/ems_db
   ```
2. Set `DEBUG=False` and `SECRET_KEY=<strong-random-key>`
3. Set `ALLOWED_HOSTS=yourdomain.com`
4. Run `python manage.py collectstatic`
5. Use Gunicorn + Nginx:
   ```bash
   pip install gunicorn
   gunicorn ems.wsgi:application --bind 0.0.0.0:8000 --workers 3
   ```
6. Point Nginx to Gunicorn and serve `/static/` and `/media/` directly

---

## Re-seed Data (development only)

The seed command is idempotent — safe to run multiple times:

```bash
python manage.py seed_data
```

Creates: 1 HR user, 10 employees, 4 departments, shifts, 5 holidays, 8 leave types, 30-day attendance history, WFH requests, leave requests, and notifications.
