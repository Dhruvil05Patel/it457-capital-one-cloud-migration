# CloudBank — Capital One Cloud Migration Case Study & Modernization Lab
### IT457 – Cloud Computing | Group 41 · DA-IICT

[![AWS Architecture](https://img.shields.io/badge/AWS-EC2%20%2B%20RDS%20PostgreSQL-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Docker Compose](https://img.shields.io/badge/Docker-Multi--Tier%20Compose-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Academic%20Evaluation-green.svg)](#)
[![Status](https://img.shields.io/badge/Deployment-Live%20on%20AWS-success)](http://35.154.113.220)

A comprehensive case study and hands-on cloud migration implementation replicating **Capital One's enterprise-wide exit from physical on-premises data centers to Amazon Web Services (AWS)**. This repository houses the complete theoretical research, containerized digital banking application (**CloudBank**), single-command AWS cloud deployment runbook, empirical load benchmarking, and Total Cost of Ownership (TCO) financial modeling.

---

## 🌐 Live AWS Cloud Deployment

CloudBank is actively deployed and running on **AWS Free Tier infrastructure** in region `ap-south-1` (Mumbai):

| Tier | Public Endpoint | Status | Technology / Details |
|---|---|:---:|---|
| **Web Dashboard** | **[http://35.154.113.220](http://35.154.113.220)** | **`200 OK` (Live)** | React + Vite Single Page Application served via Nginx on port 80 |
| **API Health Ping** | **[http://35.154.113.220/api/health](http://35.154.113.220/api/health)** | **`200 OK` (Live)** | Node.js Express REST API connected to Amazon RDS PostgreSQL |
| **Accounts API** | **[http://35.154.113.220/api/accounts](http://35.154.113.220/api/accounts)** | **`200 OK` (Live)** | Real-time balance queries executed against Amazon RDS |

---

## 👥 Group 41 Team Members & Ownership

| Name | Student ID | Core Engineering & Research Ownership |
|---|---|---|
| **Dhruvil Patel** | 202301035 | **Frontend Architecture, Performance Benchmarking & Cost Modeling**<br>React/Vite SPA dashboard, currency formatting (paise to INR), empirical Apache Bench (`ab`) load testing, Apache JMeter (`.jmx`) test suite design, and 3-year TCO financial modeling. |
| **Kavish Patel** | 202301074 | **Backend REST API & Database Systems**<br>Node.js Express REST API, PostgreSQL database schema (`init.sql`) & deterministic seed (`seed.sql`), atomic `BEGIN...COMMIT` transaction engine with row-level locking (`FOR UPDATE`), and automated API unit/integration tests. |
| **Aryan Rathod** | 202301164 | **Docker Containerization & AWS Infrastructure Deployment**<br>Multi-tier Docker Compose orchestration (`Dockerfile.client`, `Dockerfile.server`), defense-in-depth VPC security groups, Amazon EC2 & RDS automation scripts (`deploy-aws.sh`, `teardown-aws.sh`), and cloud runbook documentation. |

---

## 🗓️ 4-Week Milestone Roadmap & Key Deliverables

```text
 ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
 │     Week 1      │      │     Week 2      │      │     Week 3      │      │     Week 4      │
 │  Case Study &   │ ──►  │ Architectural   │ ──►  │ Containerize &  │ ──►  │  Benchmarking,  │
 │ Problem Analysis│      │  5-Phase Plan   │      │ AWS Deployment  │      │ Effort & TCO    │
 └─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘
```

| Milestone | Deliverable Document | Primary Scope & Achievements |
|---|---|---|
| **Week 1** | [Week1_Report_Group41.pdf](Week1_Report_Group41.pdf) · [docs/week-1/week-1-summary.md](docs/week-1/week-1-summary.md) | Initial case study research, problem motivation, legacy hardware provisioning bottlenecks, vendor-reported outcomes. |
| **Week 2** | [Week2_Report_Group41.pdf](Week2_Report_Group41.pdf) · [docs/week-2/week-2-summary.md](docs/week-2/week-2-summary.md) | Comprehensive 6-dimension problem analysis, conceptual architecture diagram, 5-phase practical exercise roadmap. |
| **Week 3** | [week-3/cloudbank/DEPLOYMENT.md](week-3/cloudbank/DEPLOYMENT.md) · [week-3/cloudbank/docker-compose.yml](week-3/cloudbank/docker-compose.yml) | Multi-tier Docker Compose stack, internal database networking, automated health checks, single-EC2 & Amazon RDS production runbook. |
| **Week 4** | [week-4/PERFORMANCE-EFFORT-COST-REPORT.md](week-4/PERFORMANCE-EFFORT-COST-REPORT.md) · [week-4/cloudbank-loadtest.jmx](week-4/cloudbank-loadtest.jmx) | Empirical Apache Bench (`ab`) load testing, Apache JMeter test suite, engineering effort analysis, 3-year TCO financial modeling. |

---

## 🏛️ Architecture Modernization Pattern

To reflect Capital One’s journey, CloudBank implements two distinct architectures: **Local Containerized Baseline** (representing self-hosted legacy operations) and **Modernized AWS Cloud Production** (managed cloud services with zero public database exposure).

### Local Baseline vs. AWS Cloud Modernization

```text
================================== LOCAL DOCKER BASELINE ==================================
  Developer Laptop (Localhost)
    │ Port 80
    ▼
  [ Frontend: React + Vite (Nginx) ] ── (Internal Network) ──► [ Backend: Express API (Port 3000) ]
                                                                             │
                                                                             │ Port 5432 (Internal)
                                                                             ▼
                                                                [ Database: PostgreSQL 16 ]
                                                                             │
                                                                             ▼
                                                                [ Named Volume: postgres_data ]

=============================== AWS CLOUD MODERNIZED PRODUCTION ===========================
  Public Users (Internet)
    │ HTTP (Port 80)
    ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │  EC2 Security Group: cloudbank-ec2-sg (Port 80 Public | Port 22 SSH Restricted)        │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │ Amazon EC2 Instance: t3.micro (Ubuntu 22.04 LTS, 1 vCPU, 1 GB RAM)                │  │
  │  │  - cloudbank_client (Nginx SPA Reverse Proxy)                                    │  │
  │  │  - cloudbank_api (Node.js Express REST API)                                      │  │
  │  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
  └───────────────────────────────────────────┼────────────────────────────────────────────┘
                                              │ Port 5432 (Encrypted TLSv1.3 over VPC)
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │  RDS Security Group: cloudbank-rds-sg (Port 5432 Inbound ONLY from cloudbank-ec2-sg)   │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │ Amazon RDS for PostgreSQL: db.t3.micro (PostgreSQL 16.15, 20 GB gp3)             │  │
  │  │  - Zero Public Access (100% Private to VPC)                                      │  │
  │  │  - Automated Point-in-Time Snapshots, Automated Minor Version Upgrades           │  │
  │  └──────────────────────────────────────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide (Local Development)

### Prerequisites
- [Docker Engine (v24+) & Docker Compose (v2+)](https://docs.docker.com/engine/install/)
- Docker Desktop running on macOS, Linux, or Windows

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Dhruvil05Patel/it457-capital-one-cloud-migration.git
cd it457-capital-one-cloud-migration/week-3/cloudbank

# Copy example environment configuration
cp .env.example .env
```

### 2. Build & Launch Containers
```bash
docker compose up -d --build
```

### 3. Verify Health & Process Status
```bash
docker compose ps
```

*Expected Status:*
```text
NAME               IMAGE                STATUS                   PORTS
cloudbank_api      cloudbank-backend    Up (healthy)             0.0.0.0:3000->3000/tcp
cloudbank_client   cloudbank-frontend   Up (healthy)             0.0.0.0:80->80/tcp
cloudbank_db       postgres:16-alpine   Up (healthy)             5432/tcp (Internal only)
```

Open **`http://localhost`** in your browser to view the live dashboard.

---

## 🧪 Shared 9-Step Verification Smoke Test

All team members and evaluators verify system functionality across both local and AWS deployments using this standardized test suite:

| Step | Action | Expected Output | Verification Status |
|:---:|---|---|:---:|
| **1** | **Clean Startup** | All 3 containers report `Up (healthy)` via automated Docker health checks. | **PASS** |
| **2** | **Initial State** | Dashboard displays "Demo Checking" (₹10,000.00) and "Demo Savings" (₹5,000.00). | **PASS** |
| **3** | **Deposit** | Deposit ₹1,000 into Demo Checking. Checking balance updates to **₹11,000.00**. | **PASS** |
| **4** | **Withdrawal** | Withdraw ₹200 from Demo Checking. Checking balance updates to **₹10,800.00**. | **PASS** |
| **5** | **Atomic Transfer** | Transfer ₹500 from Checking to Savings. Checking becomes **₹10,300.00**; Savings becomes **₹5,500.00** in an atomic `BEGIN...COMMIT` transaction with row-level locking (`FOR UPDATE`). | **PASS** |
| **6** | **Overdraft Protection** | Attempt to withdraw ₹50,000 from Savings. Returns `409 Insufficient funds`; balances remain completely unchanged. | **PASS** |
| **7** | **Fraud Threshold Flag** | Deposit or transfer ₹50,000 (5,000,000 paise). Transaction succeeds and is flagged with a prominent **`🚩 Flagged`** badge (`isSuspicious: true`). | **PASS** |
| **8** | **Data Persistence** | Restart containers (`docker compose restart`). All balances and transaction records persist from the named volume `cloudbank_postgres_data` (or Amazon RDS). | **PASS** |
| **9** | **API Health Probe** | `curl -i http://localhost:3000/api/health` returns HTTP `200 OK` with `{"data":{"status":"ok"}}`. | **PASS** |

---

## ☁️ AWS Cloud Deployment & Operations

CloudBank's production environment runs under **100% AWS Free Tier** constraints with automated provisioning scripts:

- **Deployment Runbook**: Detailed instructions in **[week-3/cloudbank/DEPLOYMENT.md](week-3/cloudbank/DEPLOYMENT.md)**.
- **Production Compose File**: **[week-3/cloudbank/docker-compose.aws.yml](week-3/cloudbank/docker-compose.aws.yml)**.

### 1. One-Click Automated AWS Deployment
Ensure the AWS CLI is configured (`aws configure` in region `ap-south-1`):
```bash
cd week-3/cloudbank
./deploy-aws.sh
```
*What the script provisions automatically:*
1. Detects your Default VPC and creates linked Security Groups (`cloudbank-ec2-sg` and `cloudbank-rds-sg`).
2. Provisions Amazon RDS PostgreSQL (`db.t3.micro`, 20 GB gp3, Free Tier).
3. Launches Amazon EC2 instance (`t3.micro`, Ubuntu 22.04 LTS).
4. Seeds RDS with tables and initial accounts (`init.sql` and `seed.sql`) via private VPC network.
5. Deploys frontend and backend containers via Docker Compose and outputs the live public URL.

### 2. One-Click Cost-Zero Teardown
When testing is complete, eliminate all running cloud resources:
```bash
cd week-3/cloudbank
./teardown-aws.sh
```
*Terminates the EC2 instance, deletes the RDS database (skipping final snapshots), and removes all security groups to guarantee $0.00 ongoing charges.*

---

## 📈 Empirical Performance Benchmarking (Week 4)

Performance was empirically measured across both environments using **Apache Bench (`ab` v2.3)**, with an accompanying **Apache JMeter (`.jmx`)** test plan.

> [!NOTE]
> **FinOps Principle**: In accordance with cloud financial management standards, high-volume stress testing (10,000 requests) was executed on local Docker to find saturation limits, while AWS Cloud load was capped at a safe 1,000-request threshold to preserve burstable CPU credits and prevent unexpected egress bandwidth charges.

### Side-by-Side Performance Comparison

| Metric | Target | Health Check (`/api/health`) | Accounts Read (`/api/accounts`) | Deposit Write (`/transactions/deposit`) | Local 10k Scalability Stress Test |
|---|---|:---:|:---:|:---:|:---:|
| **Throughput (req/sec)** | **Local Docker** | **2,792.66** | **3,493.40** | **1,446.63** | **3,850.52** |
| | **AWS Cloud (EC2+RDS)** | **716.17** | **920.57** | **268.13** | *(Capped for FinOps)* |
| **Mean Latency (ms)** | **Local Docker** | **3.58 ms** | **2.86 ms** | **6.91 ms** | **25.97 ms** |
| | **AWS Cloud (EC2+RDS)** | **13.96 ms** | **10.86 ms** | **37.30 ms** | *(Capped for FinOps)* |
| **p50 Latency (ms)** | **Local Docker** | **3 ms** | **2 ms** | **3 ms** | **25 ms** |
| | **AWS Cloud (EC2+RDS)** | **10 ms** | **10 ms** | **16 ms** | *(Capped for FinOps)* |
| **p95 Latency (ms)** | **Local Docker** | **6 ms** | **5 ms** | **23 ms** | **43 ms** |
| | **AWS Cloud (EC2+RDS)** | **19 ms** | **16 ms** | **139 ms** | *(Capped for FinOps)* |
| **p99 Latency (ms)** | **Local Docker** | **24 ms** | **12 ms** | **46 ms** | **52 ms** |
| | **AWS Cloud (EC2+RDS)** | **27 ms** | **21 ms** | **313 ms** | *(Capped for FinOps)* |
| **Error Rate (%)** | **Local Docker** | **0.00%** | **0.00%** | **0.00%** | **0.00%** |
| | **AWS Cloud (EC2+RDS)** | **0.00%** | **0.00%** | **0.00%** | *(Zero dropped connections)* |

### Apache JMeter Test Suite
The repository includes an Apache JMeter test plan:
- **Test Plan File**: **[`week-4/cloudbank-loadtest.jmx`](week-4/cloudbank-loadtest.jmx)**
- **Features**: Parameterized host/port, Thread Groups for 10, 50, and 100 concurrent users, JSON Header Managers, and HTTP 200/201 response assertions.
- **Run via CLI**:
  ```bash
  jmeter -n -t week-4/cloudbank-loadtest.jmx -Jhost=35.154.113.220 -Jport=80 -l week-4/results.jtl -e -o week-4/dashboard/
  ```

---

## ⏱️ Engineering & Operational Effort Comparison

| Lifecycle Phase | Local Docker (Self-Hosted) | AWS Modernized Cloud | Variance | Strategic Benefit |
|---|:---:|:---:|:---:|---|
| **Upfront Architecture & Setup** | ~26 person-hours | ~37 person-hours | +42% | Extra investment in VPC security groups, TLS, and automation scripts. |
| **Routine OS & DB Patching** | 12 hrs / month | 1 hr / month | **-92%** | Managed RDS automates minor engine patches during maintenance windows. |
| **Backup Management & Recovery** | 8 hrs / month | 0.5 hr / month | **-94%** | Automated daily snapshots and point-in-time recovery vs. manual cron dumps. |
| **High Availability Setup** | 40 hrs (one-time) | 1 hr (one-time) | **-97%** | Single console toggle for Multi-AZ vs. manual Patroni/Corosync clustering. |
| **Annual Operational Maintenance** | **~240 hrs / year** | **~24 hrs / year** | **-90%** | **Saves 216 hours of engineering time annually (5.4 developer work-weeks).** |

---

## 💰 Total Cost of Ownership (TCO) & Financial ROI

```text
  Monthly Expense Comparison:
  ══════════════════════════════════════════════════════════════════════════════════
  On-Premises Legacy Hardware:  $485.36 / month  ██████████████████████████████████
  AWS Commercial (Post-Free):    $63.87 / month  █████ (86.8% Reduction)
  AWS Free Tier (Current):        $0.00 / month  ▏     (100.0% Reduction)
  ══════════════════════════════════════════════════════════════════════════════════
```

| Financial Dimension | On-Premises Legacy Baseline | AWS Cloud Modernized (Post-Free Tier) | Net Variance |
|---|:---:|:---:|:---:|
| **Upfront Capital Expenditure (CapEx)** | $1,800.00 (Server hardware) | **$0.00** | **-100%** |
| **Monthly Infrastructure Hosting** | $165.36 (Rack rent, power, cooling, parts) | **$23.87** (EC2 + RDS + EBS + Bandwidth) | **-85.6%** |
| **Monthly Operational Labor** | $320.00 (8 hrs/mo @ $40/hr) | **$40.00** (1 hr/mo review @ $40/hr) | **-87.5%** |
| **Total Monthly TCO** | **$485.36 / month** | **$63.87 / month** | **86.8% Reduction ($421.49 saved/mo)** |
| **3-Year Total Cost of Ownership** | **$17,472.96** | **$2,299.32** | **3-Year Net Savings: $15,173.64** |
| **Cost per 10,000 Transactions** | ~$0.485 | **~$0.024** | **20.2x Cost Efficiency** |

---

## 📂 Repository File Directory

```text
it457-capital-one-cloud-migration/
├── README.md                                 # Master project documentation (Single Source of Truth)
├── Week1_Report_Group41.pdf                  # Week 1 formal submission report
├── Week2_Report_Group41.pdf                  # Week 2 formal submission report
├── docs/                                     # Research and case study documentation
│   ├── week-1/                               # Initial research baseline, architecture notes, sources
│   └── week-2/                               # Case study analysis, problem-and-solution matrix, exercise plan
├── week-3/
│   └── cloudbank/                            # CloudBank application source code & infrastructure
│       ├── client/                           # React + Vite frontend single-page dashboard
│       ├── server/                           # Node.js Express REST API backend
│       ├── database/                         # init.sql schema and seed.sql test data
│       ├── Dockerfile.client                 # Multi-stage Nginx build for client
│       ├── Dockerfile.server                 # Lightweight Node.js Alpine image for API
│       ├── docker-compose.yml                # Local multi-tier Docker Compose specification
│       ├── docker-compose.aws.yml            # Production EC2 + Amazon RDS Compose specification
│       ├── nginx.conf                        # Reverse proxy routing /api/* to backend container
│       ├── DEPLOYMENT.md                     # Complete AWS Free Tier deployment runbook
│       ├── deploy-aws.sh                     # Automated CLI provisioning script (EC2, RDS, VPC)
│       └── teardown-aws.sh                   # 1-click teardown script to guarantee zero cost
└── week-4/
    ├── PERFORMANCE-EFFORT-COST-REPORT.md     # In-depth benchmark, effort & TCO report
    └── cloudbank-loadtest.jmx                # Apache JMeter load testing test plan
```

---

## 📚 Verified Primary Sources & References

1. **Amazon Web Services (AWS).** (2020). *Capital One Case Study — All-in on AWS*. [AWS Customer Success Stories](https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/).  
   *Verified Content:* Enterprise exit from eight physical data centers; environment build times reduced from ~3 months to minutes; 70% decrease in disaster recovery testing duration; 50% decrease in critical incident resolution time.
2. **Capital One Tech.** (2019). *Moving a Customer-Facing App to AWS*. [Capital One Technology Blog](https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/).  
   *Verified Content:* Mobile servicing application migration; microexperience decoupling; custom AMIs; Amazon Route 53 weighted canary traffic shifting (1% to 50/50); multi-region active/active deployment.
3. **Amazon.** (2016, November 28). *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider*. [Amazon Press Center](https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider).  
   *Verified Content:* Strategic cloud mandate selecting AWS as primary provider; enterprise digital banking modernization.
4. **Apache Software Foundation.** (2024). *ApacheBench (`ab`) & Apache JMeter User Manuals*. [apache.org](https://httpd.apache.org/docs/2.4/programs/ab.html).

---

**Course**: IT457 – Cloud Computing  
**Institution**: Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT)  
**Case Study Project**: Group 41 — Capital One AWS Cloud Migration
