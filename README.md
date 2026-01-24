# MIS - Work Permit Management System

A production-ready **Management Information System (MIS)** for industrial work permit management, designed for industrial, MEP, and security operations. Built with modern web technologies and deployable on any Linux VPS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v20+-green.svg)
![React](https://img.shields.io/badge/react-v18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-v15-blue.svg)

## 🎯 Features

### Core Functionality
- **Work Permit Requests** - Create, view, update, and track permit requests
- **Approval Workflow** - Automated approval process with Safety Officer review
- **Role-Based Access Control (RBAC)** - Admin, Safety Officer, and Requestor roles
- **Real-time Dashboard** - Statistics, charts, and activity tracking
- **Audit Logging** - Complete audit trail for compliance

### User Roles

#### Work Permit System Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, all permits, MIS access |
| **Fireman (Safety Officer)** | View all permits, approve/reject requests, verify MIS readings |
| **Requestor** | Create permits, view own permits only |

#### MIS System Roles
| Role | Permissions |
|------|-------------|
| **MIS Admin** | Full MIS access, user/role management, settings |
| **Site Engineer** | Upload OCR readings, view own data, export |
| **MIS Verifier** | View all readings, verify readings |
| **MIS Viewer** | Read-only access to MIS data and reports |

### Permit Types Supported
- 🔥 Hot Work
- 📦 Confined Space Entry
- ⚡ Electrical Work
- ↗️ Working at Height
- 🏗️ Excavation
- 🏋️ Lifting Operations
- 🧪 Chemical Handling
- ☢️ Radiation Work
- 🔧 General Work

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TailwindCSS, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma |
| **Auth** | JWT (JSON Web Tokens) |
| **Deployment** | Docker, Docker Compose, Nginx |

## 📁 Project Structure

```
webapp/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   └── index.js         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Database seeder
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── main.jsx         # Entry point
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx configuration
│   └── package.json
├── docker-compose.yml       # Production deployment
├── docker-compose.dev.yml   # Development deployment
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (for containerized deployment)

### Option 1: Docker Deployment (Recommended)

```bash
# 1. Clone the repository
git clone <repository-url>
cd webapp

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your settings
nano .env

# 4. Start all services
docker-compose up -d

# 5. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 6. Seed the database (optional - creates demo users)
docker-compose exec backend npm run prisma:seed

# 7. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

### Option 2: Manual Installation

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed  # Optional: seed demo data
npm start

# Frontend Setup (new terminal)
cd frontend
npm install
npm run build
npm run preview
```

## 🔐 Default Credentials

After seeding, use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@permitmanager.com | admin123 |
| Safety Officer | safety@permitmanager.com | safety123 |
| Requestor | requestor@permitmanager.com | user123 |

⚠️ **Change these passwords immediately in production!**

## 📊 MIS (Management Information System)

### Features
- **OCR Meter Readings** - Upload photos and auto-extract readings with Tesseract.js
- **Real-time Dashboard** - Analytics, consumption trends, and alerts
- **Data Export** - CSV, JSON export for Power BI integration
- **Role-based Access** - Admin, Verifier, Site Engineer, Viewer roles
- **Verification Workflow** - Site Engineers upload, Verifiers approve

### MIS Routes
| Route | Access | Description |
|-------|--------|-------------|
| `/mis/dashboard` | All MIS users | Overview & Quick Stats |
| `/mis/readings` | Site Engineer+ | Upload & Manage Readings |
| `/mis/analytics` | All MIS users | Reports & Insights |
| `/mis/export` | MIS Admin/Verifier | Export to CSV/JSON |
| `/mis/settings` | MIS Admin only | User Access & Roles |

### MIS API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meters` | List meter readings |
| GET | `/api/meters/:id` | Get reading details |
| POST | `/api/meters` | Create meter reading |
| PUT | `/api/meters/:id` | Update reading |
| DELETE | `/api/meters/:id` | Delete reading |
| POST | `/api/meters/:id/verify` | Verify reading |
| GET | `/api/meters/analytics` | Get analytics data |
| GET | `/api/meters/export` | Export readings (CSV/JSON) |
| POST | `/api/meters/bulk-import` | Bulk import readings |
| GET | `/api/meters/types` | Get meter types |

### MIS Permissions
| Category | Permissions |
|----------|-------------|
| **MIS Access** | `mis.access`, `mis.dashboard`, `mis.settings` |
| **Meters** | `meters.view`, `meters.view_all`, `meters.create`, `meters.edit`, `meters.delete`, `meters.verify`, `meters.ocr`, `meters.export`, `meters.import`, `meters.analytics` |
| **Reports** | `reports.view`, `reports.create`, `reports.export` |
| **MIS Users** | `mis_users.view`, `mis_users.create`, `mis_users.edit`, `mis_users.delete`, `mis_users.assign_role` |
| **MIS Roles** | `mis_roles.view`, `mis_roles.create`, `mis_roles.edit`, `mis_roles.delete` |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/change-password` | Change password |

### Permits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permits` | List permits |
| GET | `/api/permits/:id` | Get permit details |
| POST | `/api/permits` | Create permit |
| PUT | `/api/permits/:id` | Update permit |
| DELETE | `/api/permits/:id` | Delete permit |
| GET | `/api/permits/work-types` | Get work types |

### Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approvals` | List approvals |
| GET | `/api/approvals/:id` | Get approval details |
| PUT | `/api/approvals/:id/decision` | Approve/Reject permit |
| GET | `/api/approvals/stats` | Get approval statistics |
| GET | `/api/approvals/pending-count` | Get pending count |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user details |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/activity` | Get activity feed |

## 🖥️ VPS Deployment Guide

### 1. Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

### 2. Deploy Application

```bash
# Clone repository
git clone <repository-url> /opt/permit-system
cd /opt/permit-system

# Configure environment
cp .env.example .env
nano .env  # Set production values

# Start services
docker compose up -d

# Initialize database
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

### 3. Configure Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/permit-system
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt (Automated)

**Option A: Use the automated SSL setup script**
```bash
cd /opt/permit-system

# Run the SSL setup script
./scripts/ssl-setup.sh your-domain.com your-email@example.com
```

This script will:
- Create required directories
- Obtain SSL certificate from Let's Encrypt
- Configure nginx with HTTPS
- Start all services with SSL enabled
- Auto-renew certificates

**Option B: Manual SSL setup**
```bash
# 1. Start without SSL first
docker compose up -d

# 2. Install certbot
sudo apt install certbot python3-certbot-nginx -y

# 3. Obtain certificate
sudo certbot --nginx -d your-domain.com

# 4. Or use docker-compose.ssl.yml for full containerized SSL
docker compose -f docker-compose.ssl.yml up -d
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | postgres |
| `DB_PASSWORD` | PostgreSQL password | postgres |
| `DB_NAME` | Database name | permit_management |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost |
| `NODE_ENV` | Environment mode | production |

## 🔄 Automation Logic

### On Permit Creation:
1. ✅ Permit request created with status `PENDING`
2. ✅ Approval record automatically created
3. ✅ Linked to permit via `permit_id`
4. ✅ Default decision = `PENDING`
5. ✅ Assigned to Safety Officer role

### On Approval Decision:
1. ✅ Safety Officer reviews permit
2. ✅ Decision (APPROVED/REJECTED) saved
3. ✅ Comment added (required for rejection)
4. ✅ `permit_requests.status` automatically updated
5. ✅ `approved_at` timestamp recorded
6. ✅ Audit log entry created

## 📊 Database Schema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│     users       │     │ permit_requests  │     │ permit_approvals│
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (UUID)       │────<│ created_by (FK)  │     │ id (UUID)       │
│ email           │     │ id (UUID)        │────<│ permit_id (FK)  │
│ password        │     │ title            │     │ approver_name   │
│ firstName       │     │ description      │     │ approver_role   │
│ lastName        │     │ location         │     │ decision        │
│ role            │     │ work_type        │     │ comment         │
│ department      │     │ status           │     │ approved_at     │
│ isActive        │     │ priority         │     │ created_at      │
│ created_at      │     │ hazards[]        │     └─────────────────┘
│ updated_at      │     │ precautions[]    │
└─────────────────┘     │ equipment[]      │
                        │ start_date       │
                        │ end_date         │
                        │ created_at       │
                        │ updated_at       │
                        └──────────────────┘
```

## 🛡️ Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Input validation & sanitization
- ✅ CORS protection
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# View backend logs
docker compose logs backend

# Reset database
docker compose down -v
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

### Permission Issues
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .
```

### Port Conflicts
```bash
# Check what's using port 80 or 5000
sudo lsof -i :80
sudo lsof -i :5000
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support, email support@safetypermit.com or create an issue in the repository.

---

**Built with ❤️ for industrial safety**
