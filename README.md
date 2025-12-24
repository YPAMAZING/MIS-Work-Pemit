# SafetyPermit - Work Permit Management System

A production-ready web application for Permit Management & Approval System designed for industrial, MEP, and security operations.

![SafetyPermit Dashboard](https://via.placeholder.com/800x400?text=SafetyPermit+Dashboard)

## 🚀 Features

### Core Functionality
- **JWT Authentication** - Secure email/password login with role-based access
- **Role-Based Access Control (RBAC)** - Admin, Safety Officer, and Requestor roles
- **Permit Request Management** - Create, view, edit, and delete permit requests
- **Approval Workflow** - Automated approval process with comments
- **Dashboard Analytics** - Real-time statistics and charts
- **Audit Logging** - Track all system activities

### User Roles
| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, view all data |
| **Safety Officer** | View all permits, approve/reject permits |
| **Requestor** | Create permits, view own permits only |

### Permit Types Supported
- 🔥 Hot Work
- 📦 Confined Space Entry
- ⚡ Electrical Work
- ⬆️ Working at Height
- 🏗️ Excavation
- 🏋️ Lifting Operations
- ⚗️ Chemical Handling
- ☢️ Radiation Work
- 🔧 General Work

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express |
| **Frontend** | React + Vite |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT |
| **Styling** | TailwindCSS |
| **Deployment** | Docker + Docker Compose |

## 📁 Project Structure

```
webapp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Database seeding
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── index.js           # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── App.jsx            # Main app
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- Docker & Docker Compose (for deployment)
- PostgreSQL 14+ (if not using Docker)

### Option 1: Docker Deployment (Recommended)

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd webapp
   cp .env.example .env
   ```

2. **Edit `.env` file**
   ```env
   DB_PASSWORD=your-secure-password
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations and seed**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npm run prisma:seed
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Option 2: Local Development

1. **Start PostgreSQL**
   ```bash
   # Using Docker
   docker run -d --name permit_db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=permit_management \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@permitmanager.com | admin123 |
| Safety Officer | safety@permitmanager.com | safety123 |
| Requestor | requestor@permitmanager.com | user123 |

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - User login
GET  /api/auth/me          - Get current user
POST /api/auth/change-password - Change password
```

### Permits
```
GET    /api/permits            - List all permits
GET    /api/permits/:id        - Get permit by ID
POST   /api/permits            - Create permit
PUT    /api/permits/:id        - Update permit
DELETE /api/permits/:id        - Delete permit
GET    /api/permits/work-types - Get work types
```

### Approvals (Safety Officer & Admin)
```
GET  /api/approvals              - List all approvals
GET  /api/approvals/:id          - Get approval details
PUT  /api/approvals/:id/decision - Approve/Reject permit
GET  /api/approvals/pending-count - Get pending count
GET  /api/approvals/stats        - Get statistics
```

### Users (Admin only)
```
GET    /api/users      - List all users
GET    /api/users/:id  - Get user by ID
POST   /api/users      - Create user
PUT    /api/users/:id  - Update user
DELETE /api/users/:id  - Deactivate user
```

### Dashboard
```
GET /api/dashboard/stats    - Get dashboard statistics
GET /api/dashboard/activity - Get activity feed
```

## 🔧 VPS Deployment Guide

### 1. Server Requirements
- Ubuntu 20.04+ or Debian 11+
- 2GB RAM minimum (4GB recommended)
- Docker & Docker Compose installed
- Domain name (optional, for SSL)

### 2. Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 3. Deploy Application
```bash
# Clone repository
git clone <repository-url> /opt/permit-system
cd /opt/permit-system

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Start services
docker-compose up -d

# Verify services
docker-compose ps
docker-compose logs -f
```

### 4. Nginx Reverse Proxy (Optional)
```nginx
# /etc/nginx/sites-available/permit-system
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/permit-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔐 Security Considerations

1. **Environment Variables** - Never commit `.env` files
2. **JWT Secret** - Use a strong, unique secret (32+ characters)
3. **Database Password** - Use a strong password
4. **HTTPS** - Always use SSL in production
5. **Rate Limiting** - Consider adding rate limiting for API
6. **Firewall** - Configure firewall to only expose needed ports

## 📊 Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique email |
| password | String | Hashed password |
| firstName | String | First name |
| lastName | String | Last name |
| role | Enum | ADMIN, SAFETY_OFFICER, REQUESTOR |
| department | String | Department name |
| isActive | Boolean | Account status |

### Permit Requests
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Permit title |
| description | String | Work description |
| location | String | Work location |
| workType | String | Type of work |
| status | Enum | PENDING, APPROVED, REJECTED |
| priority | String | LOW, MEDIUM, HIGH, CRITICAL |
| hazards | Array | Identified hazards |
| precautions | Array | Safety precautions |
| equipment | Array | Required equipment |
| startDate | DateTime | Work start date |
| endDate | DateTime | Work end date |
| createdBy | UUID | Requestor ID |

### Permit Approvals
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| permitId | UUID | Foreign key to permit |
| approverName | String | Approver's name |
| approverRole | String | Approver's role |
| decision | Enum | PENDING, APPROVED, REJECTED |
| comment | String | Approval comment |
| approvedAt | DateTime | Decision timestamp |

## 🔄 Automation Logic

### On Permit Creation:
1. Create new permit_request record with status = PENDING
2. Automatically create permit_approval record
3. Link approval to permit via permit_id
4. Set approval decision = PENDING
5. Set approver_role = SAFETY_OFFICER

### On Approval Decision:
1. Update permit_approval.decision
2. Update permit_requests.status (mirror decision)
3. Save approved_at timestamp
4. Record approver information
5. Create audit log entry

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Support

For issues or questions, please open an issue on the repository.
