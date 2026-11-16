# Week 4 — Performance Benchmarking, Engineering Effort & Cost Analysis
## Capital One AWS Cloud Migration Case Study (Group 41 · IT457)

**Group 41 Team**:
- **Dhruvil Patel (202301035)** — Frontend Architecture, Performance Benchmarking & Cost Modeling
- **Aryan Rathod (202301164)** — Docker Containerization & AWS Infrastructure Deployment
- **Kavish Patel (202301074)** — Backend REST API & Database Systems

---

## 📌 Deliverable Overview

This folder contains the complete empirical evaluation comparing CloudBank's **Local Docker environment** with its **Modernized AWS Cloud deployment** (Amazon EC2 `t3.micro` + Amazon RDS PostgreSQL `db.t3.micro`).

### Core Report Document
👉 **[PERFORMANCE-EFFORT-COST-REPORT.md](./PERFORMANCE-EFFORT-COST-REPORT.md)**

### Apache JMeter Test Suite
👉 **[cloudbank-loadtest.jmx](./cloudbank-loadtest.jmx)** — Ready-to-run Apache JMeter XML test plan covering:
- Thread Group 1: Baseline Health Check (10 concurrent users)
- Thread Group 2: Account Read Operations (50 concurrent users)
- Thread Group 3: Transactional Deposit Operations (10 concurrent users)
- HTTP Header Manager (`application/json`) and Status Code Response Assertions (200 / 201)

#### Running JMeter via CLI:
```bash
# Run against AWS deployment
jmeter -n -t week-4/cloudbank-loadtest.jmx -Jhost=35.154.113.220 -Jport=80 -l week-4/results.jtl -e -o week-4/dashboard/

# Run against Local Docker deployment
jmeter -n -t week-4/cloudbank-loadtest.jmx -Jhost=localhost -Jport=3000 -l week-4/results-local.jtl
```

---

## 📊 Summary of Results

### 1. Performance (Measured via Apache Bench `ab`)
- **Local Docker Baseline**:
  - Accounts Read: `3,493.40 req/s` (Mean latency: `2.86 ms`, p95: `5 ms`)
  - Transactional Deposit: `1,446.63 req/s` (Mean latency: `6.91 ms`, p95: `23 ms`)
  - Local Concurrency Stress Test (up to 10k requests): `3,850.52 req/s` (Zero errors)
- **AWS Cloud Target (EC2 + RDS on Free Tier)**:
  - Accounts Read: `920.57 req/s` (Mean latency: `10.86 ms`, p95: `16 ms`)
  - Transactional Deposit: `268.13 req/s` (Mean latency: `37.30 ms`, p95: `139 ms`)
  - **FinOps Policy**: Capped AWS load at safe Free-Tier thresholds to protect burstable CPU credits and guarantee $0.00 zero-cost compliance.

### 2. Engineering Effort Comparison
- **Initial Upfront Setup**:
  - Local Docker: `~26 person-hours`
  - AWS Cloud: `~37 person-hours` *(+42% initial investment in VPC, security groups, TLS certificates, and automation)*
- **Ongoing Operational Maintenance**:
  - Local Docker: `~240 person-hours / year`
  - AWS Cloud: `~24 person-hours / year` (**90% reduction in operational toil** via managed RDS backups, automated patching, and CloudWatch metrics).

### 3. Total Cost of Ownership (TCO)
- **On-Premises Legacy Hardware**: `~$485.36 / month` ($5,824.32 / year)
- **AWS Free Tier Period**: **`$0.00 / month`**
- **AWS Commercial Post-Free-Tier**: `~$63.87 / month` (including labor; $23.87/mo infrastructure only)
- **Net Cost Savings**: **86.8% reduction ($5,057.88 saved annually)**.
