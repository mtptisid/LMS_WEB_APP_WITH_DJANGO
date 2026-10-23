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

---

## Screenshots 

<img width="1432" height="780" alt="Screenshot 2026-10-22 at 9 23 41 PM" src="https://github.com/user-attachments/assets/7d17df5b-b883-4bff-bb21-42927177c1da" />

<img width="1430" height="774" alt="Screenshot 2026-10-22 at 9 24 04 PM" src="https://github.com/user-attachments/assets/42416dbe-e7a4-4852-97b7-fe31251d46cc" />

<img width="1432" height="780" alt="Screenshot 2026-10-22 at 9 24 21 PM" src="https://github.com/user-attachments/assets/58707d41-b331-4670-a4c6-090d6c41ed76" />

<img width="1435" height="760" alt="Screenshot 2026-10-22 at 9 24 39 PM" src="https://github.com/user-attachments/assets/72fce317-7750-43d2-a568-8a3bfe7865b9" />

<img width="1428" height="769" alt="Screenshot 2026-10-22 at 9 25 14 PM" src="https://github.com/user-attachments/assets/1e5dbd8a-6c99-469f-9948-2a0d2f4c0404" />

<img width="1430" height="768" alt="Screenshot 2026-10-22 at 9 25 34 PM" src="https://github.com/user-attachments/assets/53146a99-9b79-4def-a774-416deff5aaa4" />

<img width="673" height="687" alt="Screenshot 2026-10-22 at 9 25 58 PM" src="https://github.com/user-attachments/assets/d5efdad8-d134-40b7-975f-c533711e9619" />


