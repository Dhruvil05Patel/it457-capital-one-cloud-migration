# Capital One: Cloud Migration to AWS

**IT457 – Cloud Computing Case Study Project**

A comprehensive case study and practical evaluation of Capital One's transition from on-premises enterprise data centers to Amazon Web Services (AWS), focusing on cloud migration strategies, architectural modernization, elasticity, operational resilience, and cost governance.

---

## 👥 Group Members & Roles

| Name | Student ID | Primary Focus Areas |
|---|---|---|
| **Dhruvil Patel** | 202301035 | Week 1 documentation & research baseline; consistency, quality, and deliverables review |
| **Kavish Patel** | 202301074 | In-depth case study analysis, problem & solution strategy, primary source verification |
| **Aryan Rathod** | 202301164 | Conceptual cloud architecture diagram, practical exercise plan, team roles, report formatting |

---

## 📌 Project Overview

Capital One Financial Corporation, a major US financial services institution, completed an enterprise-wide cloud transformation in 2020 by exiting all eight of its on-premises data centers and moving core workloads to AWS. This case study examines:
- **Strategic Drivers:** The transition from legacy infrastructure procurement bottlenecks to software-led digital banking agility.
- **Architecture Modernization:** Decoupling monolithic application backends into independently scalable "microexperiences", utilizing custom Amazon Machine Images (AMIs), and adopting managed services (Amazon RDS, Amazon S3).
- **Migration & Cutover Mechanics:** Phased canary cutovers using Amazon Route 53 weighted DNS (from 1% live traffic to a 50/50 split) and multi-region active/active redundancy.
- **Operational Outcomes:** Evaluating vendor-reported metrics (provisioning time reduction from ~3 months to minutes, 70% decrease in DR testing time, 50% decrease in incident resolution time and errors).
- **Evidentiary Rigor:** Differentiating enterprise-wide milestones from application-specific patterns and highlighting undisclosed financial ROI.
- **Hands-On Migration Lab:** A 5-phase practical exercise deploying a containerized application to cloud infrastructure and refactoring a component to a managed service.

---

## 📄 Weekly Reports & Deliverables

| Milestone | Deliverable PDF | Markdown Documentation | Key Focus |
|---|---|---|---|
| **Week 1** | [Week1_Report_Group41.pdf](Week1_Report_Group41.pdf) | [docs/week-1/week-1-summary.md](docs/week-1/week-1-summary.md) | Initial case study overview, problem motivation, high-level AWS services, and reported outcomes. |
| **Week 2** | [Week2_Report_Group41.pdf](Week2_Report_Group41.pdf) | [docs/week-2/week-2-summary.md](docs/week-2/week-2-summary.md) | In-depth problem analysis across 6 dimensions, architecture diagram, 5-phase lab plan, and source log. |

---

## 🔍 Case Study Scope & Problem Dimensions

Our Week 2 analysis evaluates six core operational dimensions of Capital One's migration:

1. **Infrastructure Provisioning Latency:** Transition from manual ~3-month hardware staging to automated minutes-long provisioning via Infrastructure as Code (IaC) and custom AMIs.
2. **Monolithic Application Coupling:** Deconstructing monolithic backends into modular "microexperiences" with managed persistence (Amazon RDS).
3. **Migration & Cutover Continuity:** Mitigating "big-bang" migration outages through phased canary routing using Amazon Route 53 weighted DNS (1% canary scaled to 50/50).
4. **Availability & Disaster Recovery:** Shifting from disruptive manual active-passive failover drills to multi-Availability Zone and multi-region active/active automated redundancy.
5. **Security, Governance & Compliance:** Moving from perimeter "castle-and-moat" security to DevSecOps, immutable AMIs, and least-privilege IAM under the AWS Shared Responsibility Model.
6. **Cost Governance (FinOps):** Transitioning fixed CapEx into variable OpEx with dynamic auto-scaling, resource tagging, and cloud pricing modeling.

---

## 🧪 Practical Hands-On Migration Plan

To empirically ground these cloud computing principles, the group has developed a safe, 5-phase practical laboratory plan using a non-sensitive containerized application:

- **Phase A — Local Baseline:** Dockerize a minimal web application and record performance and setup baselines.
- **Phase B — Cloud Deployment:** Provision an AWS/cloud virtual machine with restricted security group ingress rules and deploy the container.
- **Phase C — Telemetry & Validation:** Execute repeatable HTTP benchmark tests (latency p50/p95/p99, error rates) and health-check monitoring under synthetic load.
- **Phase D — Managed-Service Refactoring:** Evaluate refactoring one component (e.g., static assets to Amazon S3 or database to Amazon RDS).
- **Phase E — FinOps & Teardown:** Project monthly running costs using the AWS Pricing Calculator and immediately terminate all cloud resources.

> **Operational Guidelines:** Strict zero-credentials policy (no keys, secrets, or `.env` files in git) and zero sensitive customer/financial data.

---

## 📂 Repository Structure

```text
it457-capital-one-cloud-migration/
├── README.md
├── Week1_Report_Group41.pdf
├── Week2_Report_Group41.pdf
└── docs/
    ├── week-1/
    │   ├── architecture-notes.md
    │   ├── sources.md
    │   └── week-1-summary.md
    └── week-2/
        ├── architecture-diagram.md
        ├── case-study-analysis.md
        ├── exercise-plan.md
        ├── problem-and-solution.md
        ├── sources.md
        ├── team-roles.md
        └── week-2-summary.md
```

### Documentation Breakdown

| Directory | File | Purpose |
|---|---|---|
| **Root** | `Week1_Report_Group41.pdf` | Week 1 Summary report deliverable |
| **Root** | `Week2_Report_Group41.pdf` | Week 2 Summary report deliverable |
| **`docs/week-1/`** | `week-1-summary.md` | Initial case study overview and reported outcomes |
| | `architecture-notes.md` | High-level notes on AWS services (EC2, S3, RDS) |
| | `sources.md` | Initial reference links |
| **`docs/week-2/`** | `week-2-summary.md` | Week 2 summary corresponding to the PDF report |
| | `case-study-analysis.md` | Comprehensive analysis of Capital One's AWS migration |
| | `problem-and-solution.md` | Problem analysis and solution matrix |
| | `architecture-diagram.md` | Conceptual cloud architecture with Mermaid diagram |
| | `exercise-plan.md` | 5-phase practical hands-on cloud migration plan |
| | `sources.md` | Formal source verification and evidence log |
| | `team-roles.md` | Group 41 member responsibilities and review gates |

---

## 📚 Verified Primary Sources

1. **Amazon Web Services (AWS).** (2020). *Capital One Case Study — All-in on AWS*. [AWS Customer Success Stories](https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/).  
   *Verified Content:* Enterprise exit from eight data centers; environment build times reduced from ~3 months to minutes; 70% decrease in DR testing duration; 50% decrease in critical incident resolution time and transaction errors.
2. **Capital One Tech.** (2019). *Moving a Customer-Facing App to AWS*. [Capital One Technology Blog](https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/).  
   *Verified Content:* Application-specific migration of customer-facing mobile banking servicing backend; microexperience decoupling; custom AMIs with Ansible; Route 53 weighted canary traffic shifting (1% to 50/50); multi-region active/active deployment.
3. **Amazon.** (2016, November 28). *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider*. [Amazon Press Center](https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider).  
   *Verified Content:* Formal strategic announcement selecting AWS as predominant cloud provider; corporate cloud-first mandate and digital transformation vision.

---

**Course:** IT457 – Cloud Computing  
**Institution:** DA-IICT  
**Case Study:** Capital One – Enterprise Migration to AWS
