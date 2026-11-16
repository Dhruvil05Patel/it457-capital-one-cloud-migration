# CloudBank — AWS Cloud Deployment Runbook
## Capital One AWS Migration Modernization Pattern (Group 41 · IT457)

**Infrastructure & Deployment Owner**: Aryan Rathod (202301164)  
**Frontend Owner**: Dhruvil Patel (202301035)  
**Backend & Database Owner**: Kavish Patel (202301074)  

---

## 📋 Executive Summary & Case Study Context

This deployment runbook operationalizes the core architectural transition of the **Capital One Cloud Migration**: exiting physical/local on-premises servers and modernizing to AWS managed cloud infrastructure under **100% AWS Free Tier** constraints.

| Architecture Tier | On-Premises / Local Baseline | AWS Modernized Production (Option A) | Capital One Migration Benefit |
|---|---|---|---|
| **Web & API Compute** | Local Node.js / Nginx processes on developer laptops | **Amazon EC2 (`t3.micro` / `t2.micro`)** running containerized services via Docker | Elastic capacity, automated process isolation, ephemeral infrastructure |
| **Relational Database** | Self-hosted PostgreSQL 16 container (`cloudbank_db`) | **Amazon RDS for PostgreSQL (`db.t3.micro`)** | Zero database admin overhead, automated backup snapshots, automated patch management, high-availability read-replica path |
| **Network & Security** | Flat local network (host localhost) | **Amazon VPC + Defense-in-Depth Security Groups** | Multi-layer firewalling; RDS database is strictly private and isolated from public internet |
| **Persistent Storage** | Local Docker volume (`cloudbank_postgres_data`) | **Amazon EBS (gp3)** + **Amazon RDS Managed Storage** | Cloud durability (99.999%), independent storage volume lifecycle |
| **Observability** | Terminal stdout logs | **Amazon CloudWatch** Basic Metrics | Centralized infrastructure telemetry, CPU/Memory utilization, and alert triggers |

---

## 🏛️ Modernized Cloud Architecture

```text
                               AWS CLOUD (Default VPC)
  ══════════════════════════════════════════════════════════════════════════════════
  
   Public Internet / Users
             │
             │ HTTP (Port 80)
             ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  EC2 Security Group: cloudbank-ec2-sg                                       │
  │  - Port 80 (HTTP): Inbound from 0.0.0.0/0 (Public Web Dashboard)             │
  │  - Port 22 (SSH):  Inbound from <YOUR_ADMIN_IP>/32 (Admin Maintenance Only) │
  │                                                                              │
  │  ┌────────────────────────────────────────────────────────────────────────┐  │
  │  │ Amazon EC2 Instance: t3.micro (Ubuntu 22.04 LTS, 1 vCPU, 1 GB RAM)     │  │
  │  │                                                                        │  │
  │  │  ┌─────────────────────────────────┐   Internal Bridge Network        │  │
  │  │  │ cloudbank_client (Nginx:Alpine) │ ── (cloudbank_net) ────────┐      │  │
  │  │  │ - Serves React + Vite bundle    │                           │      │  │
  │  │  │ - Reverse proxies /api/*        │                           ▼      │  │
  │  │  └─────────────────────────────────┘              ┌─────────────────┐ │  │
  │  │                                                   │  cloudbank_api  │ │  │
  │  │                                                   │  (Node Express) │ │  │
  │  │                                                   └────────┬────────┘ │  │
  │  └────────────────────────────────────────────────────────────┼───────────┘  │
  └───────────────────────────────────────────────────────────────┼──────────────┘
                                                                  │
                                      PostgreSQL Protocol (Port 5432)
                                      Private Connection over VPC
                                                                  ▼
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │  RDS Security Group: cloudbank-rds-sg                                       │
  │  - Port 5432: Inbound ONLY from source security group: cloudbank-ec2-sg       │
  │  - 0.0.0.0/0 Inbound is STRICTLY BLOCKED (Database is 100% Private)         │
  │                                                                              │
  │  ┌────────────────────────────────────────────────────────────────────────┐  │
  │  │ Amazon RDS for PostgreSQL: db.t3.micro (PostgreSQL 16, 20 GB gp3)      │  │
  │  │ Database: cloudbank | Master User: cloudbank_admin                     │  │
  │  │ Tables: accounts, transactions (Initialized via init.sql + seed.sql)   │  │
  │  └────────────────────────────────────────────────────────────────────────┘  │
  └──────────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 AWS Free Tier Checklist & Cost Safeguards

To ensure that **zero charges ($0.00)** are incurred:

| AWS Service | Free Tier Monthly Allowance | CloudBank Allocation | Utilization % |
|---|---|---|:---:|
| **Amazon EC2** | 750 hours/month of `t2.micro` or `t3.micro` | 1 instance (`t3.micro` / `t2.micro`) | ~100% of 1 instance |
| **Amazon RDS** | 750 hours/month of `db.t2.micro` or `db.t3.micro` | 1 instance (`db.t3.micro`) | ~100% of 1 instance |
| **Amazon EBS** | 30 GB gp2/gp3 General Purpose SSD storage | 8 GB gp3 (EC2 root disk) | 26.6% |
| **Amazon RDS Storage** | 20 GB General Purpose SSD storage | 20 GB gp3 database storage | 100% |
| **Data Transfer** | 100 GB/month internet egress free | < 500 MB (Demonstration & testing) | < 0.5% |
| **Amazon CloudWatch** | 10 custom metrics & basic monitoring free | Basic EC2 & RDS metrics included free | Free |

> [!IMPORTANT]  
> **AWS Zero-Spend Budget Alert**: Before launching resources, go to **AWS Budgets** in the AWS Console, click **Create Budget** > **Zero Spend Budget**, and configure your email address. AWS will email you immediately if any service incurs even \$0.01.

---

## 🛠️ Step-by-Step Deployment Runbook

### Phase 1: VPC Security Groups (Defense-in-Depth)

We create two linked security groups in your default VPC.

#### 1.1 Create the EC2 Security Group (`cloudbank-ec2-sg`)
1. Open the **Amazon EC2 Console** > **Network & Security** > **Security Groups**.
2. Click **Create security group**:
   - **Name**: `cloudbank-ec2-sg`
   - **Description**: `Security group for CloudBank EC2 web and API instance`
   - **VPC**: Select Default VPC
3. **Inbound Rules**:
   - Rule 1: **HTTP** | Protocol: `TCP` | Port: `80` | Source: `Anywhere-IPv4 (0.0.0.0/0)` | Description: `Public web dashboard`
   - Rule 2: **SSH** | Protocol: `TCP` | Port: `22` | Source: `My IP` (`<your-current-ip>/32`) | Description: `Admin SSH management`
4. Click **Create security group**. Copy the generated Security Group ID (e.g. `sg-0123456789abcdef0`).

#### 1.2 Create the RDS Security Group (`cloudbank-rds-sg`)
1. In Security Groups, click **Create security group**:
   - **Name**: `cloudbank-rds-sg`
   - **Description**: `Private security group for CloudBank RDS database`
   - **VPC**: Select Default VPC
2. **Inbound Rules**:
   - Rule 1: **PostgreSQL** | Protocol: `TCP` | Port: `5432` | Source: Select **Custom**, then enter `sg-0123456789abcdef0` (the `cloudbank-ec2-sg` ID from step 1.1) | Description: `Inbound access strictly from CloudBank EC2 instance`
3. Click **Create security group**.

> [!CAUTION]  
> **Zero Public Database Exposure**: Never set the RDS security group source to `0.0.0.0/0`. Restricting source to `cloudbank-ec2-sg` ensures the database is unreachable from the public internet.

---

### Phase 2: Provision Amazon RDS PostgreSQL

1. Open the **Amazon RDS Console** > **Databases** > Click **Create database**.
2. Choose a database creation method: **Standard create**.
3. **Engine options**:
   - Engine type: **PostgreSQL**
   - Engine Version: **PostgreSQL 16.x** (or latest 16.x release).
4. **Templates**: Select **Free tier**. (This automatically restricts settings to Free-Tier-eligible options).
5. **Settings**:
   - DB instance identifier: `cloudbank-db`
   - Master username: `cloudbank_admin`
   - Master password: Enter a strong password (e.g. `CloudBank2026!SecureKey`) and confirm it.
6. **Instance configuration**:
   - DB instance class: **Burstable classes** > `db.t3.micro` (or `db.t2.micro`).
7. **Storage**:
   - Storage type: **General Purpose SSD (gp3)**.
   - Allocated storage: `20` GiB.
   - Storage autoscaling: **Uncheck** *Enable storage autoscaling* (prevents unexpected charges beyond 20 GB).
8. **Connectivity**:
   - Virtual private cloud (VPC): Default VPC.
   - Public access: **No** (database stays completely private inside the VPC).
   - Existing VPC security groups: Remove `default` and attach **`cloudbank-rds-sg`**.
   - Database port: `5432`.
9. **Additional configuration**:
   - Initial database name: `cloudbank`
   - Uncheck automated backups or set retention period to `1` day.
   - Uncheck *Enable deletion protection* (to allow easy cleanup at the end of the semester).
10. Click **Create database**. Provisioning takes approximately 5–10 minutes. When complete, copy the **Endpoint** (e.g., `cloudbank-db.c123456789.us-east-1.rds.amazonaws.com`).

---

### Phase 3: Launch Amazon EC2 Instance

1. Open the **Amazon EC2 Console** > **Instances** > Click **Launch an instance**.
2. **Name and tags**: `cloudbank-server`.
3. **Application and OS Images (Amazon Machine Image)**:
   - Select **Ubuntu** > **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type** (marked *Free tier eligible*), 64-bit (x86).
4. **Instance type**:
   - Select `t3.micro` (or `t2.micro` in regions where `t3` is not Free Tier).
5. **Key pair (login)**:
   - Click **Create new key pair** (or select existing).
   - Name: `cloudbank-key`, Key pair type: `RSA`, Private key file format: `.pem`.
   - Download `cloudbank-key.pem` to your local machine (`chmod 400 cloudbank-key.pem`).
6. **Network settings**:
   - VPC: Default VPC.
   - Auto-assign public IP: **Enable**.
   - Select existing security group: Attach **`cloudbank-ec2-sg`**.
7. **Configure storage**:
   - `1x 8 GiB gp3` root volume (Free Tier allows up to 30 GiB).
8. Click **Launch instance**. Once running, copy the **Public IPv4 address** (e.g. `54.210.85.120`).

---

### Phase 4: Configure EC2 Instance & Install Docker

From your local machine terminal, SSH into the EC2 instance:

```bash
chmod 400 cloudbank-key.pem
ssh -i cloudbank-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Once inside the Ubuntu EC2 shell, install Docker and the Docker Compose plugin:

```bash
# Update package indices and install Docker
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Install Docker Engine & Compose plugin
sudo apt-get install -y docker.io docker-compose-v2

# Allow non-root ubuntu user to run docker commands
sudo usermod -aG docker ubuntu

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

---

### Phase 5: Deploy Repository & Seed Amazon RDS

#### 5.1 Clone or Transfer Repository onto EC2
Inside the EC2 instance, clone the project repository:

```bash
cd /home/ubuntu
git clone https://github.com/Dhruvil05Patel/it457-capital-one-cloud-migration.git
cd it457-capital-one-cloud-migration/week-3/cloudbank
```

#### 5.2 Initialize Database Schema & Seed Data on RDS
Because the RDS instance is inside the VPC and accessible from this EC2 instance, initialize `init.sql` and `seed.sql` using a one-shot PostgreSQL container (no manual `psql` installation needed):

```bash
# Substitute your actual RDS endpoint and password
export RDS_ENDPOINT="cloudbank-db.c123456789.us-east-1.rds.amazonaws.com"
export RDS_PASS="CloudBank2026!SecureKey"

# 1. Execute Schema Initialization (Tables, Constraints, Indexes)
docker run --rm -v $(pwd)/database:/db postgres:16-alpine \
  psql "postgres://cloudbank_admin:${RDS_PASS}@${RDS_ENDPOINT}:5432/cloudbank" \
  -f /db/init.sql

# 2. Execute Seed Data (Demo Checking ₹10,000, Demo Savings ₹5,000)
docker run --rm -v $(pwd)/database:/db postgres:16-alpine \
  psql "postgres://cloudbank_admin:${RDS_PASS}@${RDS_ENDPOINT}:5432/cloudbank" \
  -f /db/seed.sql
```

*Expected Output:*
```text
CREATE TABLE
CREATE TABLE
CREATE INDEX
INSERT 0 2
```

---

### Phase 6: Launch CloudBank Application

#### 6.1 Create Production Environment File (`.env`)
Create the `.env` file on the EC2 instance pointing to Amazon RDS:

```bash
cat <<EOF > .env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://cloudbank_admin:${RDS_PASS}@${RDS_ENDPOINT}:5432/cloudbank
SUSPICIOUS_THRESHOLD_PAISE=5000000
EOF
```

#### 6.2 Build and Launch Containers with RDS Compose
Launch the client and server services using the AWS production compose file:

```bash
docker compose -f docker-compose.aws.yml up -d --build
```

#### 6.3 Verify Container Status
Check that both services report healthy:

```bash
docker compose -f docker-compose.aws.yml ps
```

*Expected Output:*
```text
NAME               IMAGE                   STATUS                   PORTS
cloudbank_api      cloudbank-backend       Up (healthy)             0.0.0.0:3000->3000/tcp
cloudbank_client   cloudbank-frontend      Up                       0.0.0.0:80->80/tcp
```

---

### Phase 7: Live Cloud Verification (Team Hand-Offs)

#### 7.1 Automated Health Check from Internet
From your local machine (outside AWS), query the public health endpoint:

```bash
curl -i http://<EC2_PUBLIC_IP>/api/health
```

*Expected Response (`200 OK`)*:
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"data":{"status":"ok"}}
```

#### 7.2 UI Dashboard Smoke Test
Open `http://<EC2_PUBLIC_IP>` in any web browser. Execute the complete 9-step smoke test:

1. **Dashboard Load**: Verify "Demo Checking" (₹10,000.00) and "Demo Savings" (₹5,000.00) appear.
2. **Deposit**: Deposit ₹1,000 into Demo Checking. Verify balance becomes ₹11,000.00.
3. **Withdrawal**: Withdraw ₹200 from Demo Checking. Verify balance becomes ₹10,800.00.
4. **Atomic Transfer**: Transfer ₹500 from Checking to Savings. Checking becomes ₹10,300.00; Savings becomes ₹5,500.00.
5. **Over-Balance Protection**: Attempt to withdraw ₹50,000 from Savings. Verify `409 Insufficient funds` toast appears and balances remain unchanged.
6. **Suspicious Activity Flag**: Transfer ₹50,000. Verify the transaction is flagged with the prominent **"🚩 Flagged"** badge in history.
7. **Cloud Persistence**: Restart EC2 containers (`docker compose -f docker-compose.aws.yml restart`). Refresh browser. Verify all transaction records and balances remain intact in Amazon RDS!

---

### Phase 8: CloudWatch Telemetry & Metrics Verification

1. Open **Amazon CloudWatch Console** > **Metrics** > **All Metrics**.
2. **EC2 Metrics (`AWS/EC2`)**:
   - `CPUUtilization`: Confirm baseline load is < 5% at idle.
   - `NetworkIn` & `NetworkOut`: Observe traffic spikes during smoke testing.
   - `StatusCheckFailed`: Verify value is `0` (system & instance checks passing).
3. **RDS Metrics (`AWS/RDS`)**:
   - `DatabaseConnections`: Verify active connection pool from backend (`1` to `20`).
   - `FreeableMemory`: Confirm stable memory headroom (~500+ MB free).
   - `FreeStorageSpace`: Confirm ~19+ GB remaining storage.

---

## 🛑 Cost-Zero Teardown & Cleanup Guide

When testing is concluded or at the end of the evaluation period, follow this exact procedure to eliminate all recurring AWS costs:

### 1. Stop or Terminate EC2 Instance
- **Temporary Pause** (Preserves files, incurs zero compute charges; EBS storage remains active):
  ```bash
  aws ec2 stop-instances --instance-ids <INSTANCE_ID>
  ```
  *(Or in EC2 Console: Select instance > Instance state > Stop instance).*
- **Permanent Termination** (Deletes instance and associated root EBS volume):
  ```bash
  aws ec2 terminate-instances --instance-ids <INSTANCE_ID>
  ```
  *(Or in EC2 Console: Select instance > Instance state > Terminate instance).*

### 2. Delete Amazon RDS Database Instance
1. Open **Amazon RDS Console** > **Databases**.
2. Select `cloudbank-db`.
3. Click **Actions** > **Delete**.
4. In the confirmation dialog:
   - **Uncheck** *Create final snapshot?* (Snapshots incur storage costs).
   - Check *I acknowledge that upon instance deletion, automated backups...*.
   - Type `delete me` and confirm.

### 3. Delete Security Groups
1. Open **EC2 Console** > **Security Groups**.
2. Select `cloudbank-rds-sg` and click **Actions** > **Delete security group**.
3. Select `cloudbank-ec2-sg` and click **Actions** > **Delete security group**.

---

## 🆘 Troubleshooting & Common Issues

| Issue | Root Cause | Solution |
|---|---|---|
| Cannot connect via SSH (`Connection timed out`) | Security group missing port 22 or your public IP changed | Go to EC2 Console > Security Groups > `cloudbank-ec2-sg`, update SSH rule to **My IP**. |
| Backend container fails to connect to RDS (`ETIMEDOUT` / `ECONNREFUSED`) | RDS Security Group does not allow traffic from EC2 | Verify `cloudbank-rds-sg` has an inbound rule for TCP 5432 with Source set to `cloudbank-ec2-sg` ID. |
| Browser shows `502 Bad Gateway` on EC2 public IP | Nginx is running but backend API has not finished starting | Run `docker compose -f docker-compose.aws.yml logs backend`. Wait 5 seconds for backend healthcheck to turn green. |
| RDS connection fails with `password authentication failed` | Password mismatch between RDS creation and `.env` | Verify `.env` contains the exact URL: `DATABASE_URL=postgres://cloudbank_admin:<PASS>@<ENDPOINT>:5432/cloudbank`. |
