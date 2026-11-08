# Week 2 Summary: Capital One's Migration to AWS

**Course:** IT457 – Cloud Computing  
**Group:** 41  
**Contributors:** Dhruvil Patel (202301035) • Kavish Patel (202301074) • Aryan Rathod (202301164)  
**Deliverable:** Week 2 Summary Report (`Week2_Report_Group41.pdf`)

---

## 1. Case Study Progression & Scope

In Week 2, Group 41 advanced from the initial case overview into a rigorous architectural and operational analysis of Capital One's multi-year cloud journey (2016–2020), which culminated in the decommission of eight on-premises data centers to AWS. The analysis investigates six core operational problem dimensions, details cloud migration mechanics, evaluates vendor-reported outcomes against empirical boundaries, formalizes a conceptual cloud architecture, and outlines a 5-phase practical migration plan. [1, 2]

## 2. Problem Analysis Across Core Dimensions

Operating critical banking services in legacy data centers created systemic constraints:
1. **Provisioning Bottlenecks:** ~3-month hardware procurement and staging delays.
2. **Monolithic Coupling:** Tightly coupled backends with wide failure blast radiuses and synchronized release cycles.
3. **Cutover & Continuity Risk:** Potential catastrophic downtime from abrupt "big-bang" deployments.
4. **Disaster Recovery Friction:** Manual, disruptive, and costly active-passive failover drills.
5. **Governance & Security Friction:** Rigid perimeter defenses misaligned with modern cloud DevSecOps and shared responsibility.
6. **Inelastic Capacity & Fixed CapEx:** Stranded idle capacity during off-peak windows and opaque cost attribution. [1, 2, 3]

## 3. Architecture and Migration Approach

To solve these challenges without risky "lift-and-shift" compromises, Capital One implemented modern cloud architectural patterns:
- **Application Decomposition:** Decoupled customer-facing mobile backends into modular, independently deployable "microexperiences" with managed Amazon RDS databases. [2]
- **Automated Provisioning & AMIs:** Packaged immutable runtime dependencies into custom base AMIs with configuration drift eliminated via Ansible automation. [2]
- **Phased Canary Cutover:** Utilized Amazon Route 53 weighted DNS to shift an initial 1% live canary traffic to AWS, stepping to a 50/50 on-prem/cloud split before full cutover. [2]
- **Multi-Region Resilience:** Extended deployments across multiple Availability Zones and a secondary AWS Region for active/active failover and continuous availability. [2]

## 4. Reported Outcomes & Evidentiary Boundaries

Official case literature reports substantial operational gains following the AWS transition:
- Exited all eight physical data centers, operating entirely on AWS by 2020. [1]
- Development-environment provisioning time dropped from approximately three months to minutes. [1]
- Disaster-recovery testing duration decreased by 70%. [1]
- Critical incident resolution time (MTTR) and transaction error rates each decreased by 50%. [1]

**Evidentiary Discipline:** These quantitative metrics originate from AWS marketing case literature and lack independent audits. Furthermore, published sources omit total enterprise migration capital expenditures and net dollar savings. Group 41 explicitly treats financial figures as unverified in primary literature rather than assuming speculative cost reductions. [1, 3]

## 5. Practical Cloud Migration Exercise Plan

To evaluate cloud migration concepts hands-on, the group designed a safe, reproducible 5-phase laboratory exercise using a containerized web application:
- **Phase A (Local Baseline):** Containerize a minimal web application using Docker and record performance baselines.
- **Phase B (Cloud Deployment):** Provision an AWS/cloud VM, configure minimum security group ingress rules, and deploy the container.
- **Phase C (Validation):** Execute latency (p50/p95/p99) and stress validation under synthetic load; inspect health checks and logs.
- **Phase D (Managed-Service Refactor):** Evaluate an optional component refactor to a managed service (Amazon RDS or S3).
- **Phase E (Cost & Cleanup):** Model projected costs using the AWS Pricing Calculator followed by immediate resource termination.

Evaluation tracks provisioning time, latency, and error rates without handling real customer or financial data.

## 6. Team Governance & Next Steps

Week 2 work was partitioned with defined peer-review checkpoints:
- **Kavish Patel:** Authored the comprehensive case study analysis, problem-to-solution matrix, and primary source verification log.
- **Aryan Rathod:** Developed the conceptual architecture diagram, practical exercise plan, team roles, and report integration.
- **Dhruvil Patel:** Conducted technical consistency and quality reviews against Week 1 documentation.

Next week focuses on executing the containerized migration lab, measuring performance baselines, and evaluating managed cloud service integration.

---

## Sources

1. **AWS.** *Capital One Case Study – All-in on AWS.* (2020). <https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/>
2. **Capital One Tech.** *Moving a Customer-Facing App to AWS.* (2019). <https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/>
3. **Amazon.** *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider.* (2016). <https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider>

> **Note:** Operational metrics are vendor-reported in AWS case publications and are not presented as independently audited financial disclosures. Microexperience architecture, custom AMIs, and Route 53 canary routing describe one documented customer-facing mobile application, not every enterprise workload.

