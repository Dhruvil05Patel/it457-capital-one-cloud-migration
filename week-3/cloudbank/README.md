# CloudBank — Containerized Digital Banking Application

**Group 41 · IT457 Cloud Computing | Week 3 Project**  
**Infrastructure & Deployment Owner**: Aryan Rathod (202301164)  
**Frontend Owner**: Dhruvil Patel (202301035)  
**Backend & Database Owner**: Kavish Patel (202301074)

---

## 📌 Architecture Overview

CloudBank is a simulated digital banking application containerized with Docker Compose. It demonstrates clean multi-tier container networking, automated startup sequencing, and local-to-cloud reproducibility without external dependencies.

```text
Browser (User)
  │ HTTP (Port 80)
  ▼
[ Frontend: React + Vite on Nginx ]  ── (Internal Proxy: /api/*) ──►  [ Backend: Node.js Express API (Port 3000) ]
                                                                                  │
                                                                                  │ PostgreSQL Protocol (Port 5432)
                                                                                  ▼
                                                                     [ Database: PostgreSQL 16 (Internal Only) ]
                                                                                  │
                                                                                  ▼
                                                                     [ Persistent Volume: postgres_data ]
```

### Services Breakdown

| Service | Container Name | Image / Base | Host Port | Internal Port | Health Check |
|---|---|---|:---:|:---:|---|
| **Frontend** | `cloudbank_client` | `nginx:alpine` (multi-stage build from `node:20-alpine`) | `80` | `80` | `wget http://127.0.0.1:80/` |
| **Backend** | `cloudbank_api` | `node:20-alpine` (Express REST API) | `3000` | `3000` | `wget http://localhost:3000/api/health` |
| **Database** | `cloudbank_db` | `postgres:16-alpine` | *None* | `5432` | `pg_isready -U cloudbank -d cloudbank` |

> **🔒 Security Constraint**: PostgreSQL port `5432` is strictly internal to the Docker bridge network (`cloudbank_net`) and is **never** exposed to the host machine or public internet.

---

## 🚀 Quick Start Guide

### Prerequisites
- Docker Engine (v24+) & Docker Compose (v2+)
- Docker Desktop must be running on macOS / Windows

### 1. Environment Configuration
Create your local environment file from the template:

```bash
cp .env.example .env
```

### 2. Build & Launch Containers
Start all three services in detached mode with automated health checking:

```bash
docker compose up -d --build
```

### 3. Verify Container Health
Confirm that all three services achieve `healthy` status:

```bash
docker compose ps
```

*Expected Output:*
```text
NAME               IMAGE                STATUS                   PORTS
cloudbank_api      cloudbank-backend    Up (healthy)             0.0.0.0:3000->3000/tcp
cloudbank_client   cloudbank-frontend   Up (healthy)             0.0.0.0:80->80/tcp
cloudbank_db       postgres:16-alpine   Up (healthy)             5432/tcp
```

### 4. Inspect Live Logs
To stream logs from all containers or a specific service:

```bash
# All containers
docker compose logs -f

# Backend API logs only
docker compose logs -f backend

# PostgreSQL database logs only
docker compose logs -f postgres
```

---

## 🧪 Shared 9-Step Verification Smoke Test

Before merging or deploying to EC2, all members verify this standard smoke test:

| Step | Action | Command / Location | Expected Result |
|:---:|---|---|---|
| **1** | **Clean Startup** | `docker compose up -d --build` | All 3 containers report `Up (healthy)`. |
| **2** | **Initial State** | Open `http://localhost` | Demo banner visible; "Demo Checking" (₹10,000) and "Demo Savings" (₹5,000) displayed. |
| **3** | **Deposit** | Deposit ₹1,000 into Demo Checking | Balance updates to ₹11,000.00; `DEPOSIT` record appears in history. |
| **4** | **Withdrawal** | Withdraw ₹200 from Demo Checking | Balance updates to ₹10,800.00; `WITHDRAWAL` record appears in history. |
| **5** | **Atomic Transfer** | Transfer ₹500 from Checking to Savings | Checking decreases to ₹10,300.00; Savings increases to ₹5,500.00 in a single atomic transaction. |
| **6** | **Over-Balance Check** | Attempt to withdraw ₹50,000 from Savings | Receives `409 Insufficient funds`; balances remain completely unchanged. |
| **7** | **Suspicious Flag Rule** | Deposit or transfer ₹50,000 (5,000,000 paise) | Transaction succeeds; history table displays a prominent **"🚩 Flagged"** badge. |
| **8** | **Data Persistence** | Refresh the browser / restart containers | All balances and transaction records persist from the named volume `postgres_data`. |
| **9** | **API Health** | `curl -s http://localhost:3000/api/health` | Returns HTTP `200 OK` with `{"data":{"status":"ok"}}`. |

---

## 🛑 Teardown & Reset Commands

- **Stop Containers** (Preserves database volume and transaction history):
  ```bash
  docker compose down
  ```

- **Complete Reset** (Wipes database volume to re-seed clean mock accounts on next launch):
  ```bash
  docker compose down -v
  ```

---

## 🔧 Troubleshooting

- **Port 80 Already in Use on Mac/Linux**:
  If port `80` is in use by another local web server (e.g. Apache or another container), update the frontend port mapping in `docker-compose.yml`:
  ```yaml
  frontend:
    ports:
      - "8080:80"
  ```
  Then access the dashboard at `http://localhost:8080`.

- **Database Connection Retries**:
  The backend API waits for PostgreSQL to become healthy before starting (`depends_on: postgres: condition: service_healthy`). If Postgres takes longer than 5 seconds on initial volume initialization, Compose automatically retries until healthy.

---

## 🌐 AWS Cloud Deployment (Capital One Migration Modernization)

For the complete AWS Free Tier deployment runbook demonstrating modernization from local servers to **Amazon EC2 (`t3.micro`)** and **Amazon RDS for PostgreSQL (`db.t3.micro`)** with defense-in-depth VPC security groups and CloudWatch monitoring, see:

👉 **[AWS Deployment Runbook (DEPLOYMENT.md)](./DEPLOYMENT.md)**

Includes:
- Step-by-step AWS Management Console & CLI instructions
- Defense-in-depth security group topology (`cloudbank-ec2-sg` and `cloudbank-rds-sg`)
- Dedicated AWS Compose configuration (`docker-compose.aws.yml`)
- CloudWatch metrics checklist
- Cost-zero teardown and cleanup commands
