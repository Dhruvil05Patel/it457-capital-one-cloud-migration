# Source and Evidence Log — Capital One AWS Migration

**Course:** IT457 – Cloud Computing  
**Group:** 41  
**Contributor:** Kavish Patel (202301074)  
**Deliverable:** Week 2 Source Verification and Evidence Log  
**Repository Path:** `docs/week-2/sources.md`  

---

## 1. Purpose and Methodology

This document serves as the formal source verification and evidence log for the IT457 Week 2 case study on Capital One's cloud migration to Amazon Web Services (AWS). To maintain rigorous academic standards:
1. **Metadata Verification:** For each primary source, exact bibliographic metadata (title, publisher, publication date, URL, and access date) is recorded. Where publication dates or specific author names are not explicitly displayed on the public page, they are marked as **“not shown”** rather than assumed.
2. **Evidentiary Scope Tracking:** Every factual finding and quantitative metric is classified as either **Enterprise-Wide** (applicable across Capital One's overall infrastructure) or **Application-Specific** (applicable strictly to the single customer-facing mobile banking application documented in engineering literature).
3. **Negative Verification:** Where a source does **not** support a specific claim (e.g., financial savings, data-center exit milestones, or specific architectural patterns), this absence is explicitly documented to prevent false attribution or over-generalization.

---

## 2. Primary Source Profiles

### Source 1: AWS Official Customer Case Study

* **Exact Title:** *Capital One Case Study — All-in on AWS* (also indexed as *Migrating from Data Centers to AWS: Capital One Case Study*)
* **Publisher:** Amazon Web Services (AWS)
* **Publication Date:** 2020 *(Specific month and day not shown on page; 2020 reflects the data-center exit milestone date)*
* **URL:** [https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/](https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/)
* **Access Date:** November 7, 2026
* **Short Summary:** An official vendor customer success case study published by AWS detailing Capital One's multi-year cloud journey. The case study documents Capital One's achievement as the first major US bank to announce operating completely on the public cloud, detailing the decommission of its legacy data-center footprint and reporting high-level operational improvements in developer provisioning speed, disaster recovery testing, incident resolution, and error rates.
* **Claims Supported by this Source:**
  * **Data-Center Exit (Enterprise-Wide):** Supported. Formally documents that Capital One completed its full exit from **eight on-premises data centers in 2020**, operating entirely on AWS.
  * **Development Environment Build Time (Enterprise-Wide):** Supported. Reports that average development-environment build time was reduced from **approximately three months to minutes**.
  * **Disaster-Recovery Test Duration (Enterprise-Wide):** Supported. Reports a **70% reduction in disaster recovery testing time**.
  * **Critical Incident Resolution Time (Enterprise-Wide):** Supported. Reports a **50% reduction in critical incident resolution time** (Mean Time to Resolution / MTTR).
  * **Transaction Error Rates (Enterprise-Wide):** Supported. Reports a **50% reduction in transaction errors**.
  * **Core AWS Services (Enterprise-Wide):** Supported. Verifies enterprise adoption of Amazon EC2, Amazon S3, and Amazon RDS.
* **Claims NOT Supported by this Source:**
  * **Application-Specific Architecture:** *Not supported.* The case study mentions high-level services (EC2, S3, RDS) but does *not* document the specific mobile application architecture (e.g., microexperience decomposition, Route 53 weighted canary traffic shifting, or Ansible playbooks).
  * **Total Migration Cost or Net Dollar Savings:** *Not supported.* Does not disclose total capital investment, annual cloud run-rate expenditures, or net financial savings from the data-center closures.

---

### Source 2: Capital One Engineering Blog Post

* **Exact Title:** *Moving a Customer-Facing App to AWS* (also published as *How We Migrated a Customer Facing Mobile App to AWS Cloud*)
* **Publisher:** Capital One (Capital One Tech / Technology Blog)
* **Publication Date:** 2019 *(Specific month and day not shown on live portal; published circa late 2019)*
* **URL:** [https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/](https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/)
* **Access Date:** November 7, 2026
* **Short Summary:** A first-party technical engineering blog post authored by Capital One engineers detailing the migration and modernization of Capital One's flagship customer-facing mobile banking application backend. It documents the decoupling of monolithic services into microexperiences, immutable infrastructure deployment via custom AMIs and Ansible, automated blue/green deployments using Auto Scaling Groups, and gradual DNS cutover using Amazon Route 53 across multiple AWS Regions.
* **Claims Supported by this Source:**
  * **Application-Specific Architecture (Application-Specific):** Supported. Documents the architectural modernization of the mobile servicing backend into decoupled **microexperiences**.
  * **Standardized Infrastructure Automation (Application-Specific):** Supported. Documents the creation of custom base **Amazon Machine Images (AMIs)** to package server dependencies and the use of **Ansible** for automated instance configuration.
  * **Elastic Compute & Blue/Green Deployments (Application-Specific):** Supported. Verifies the use of **Auto Scaling Groups (ASGs)** to manage dynamic compute scaling and facilitate zero-downtime blue/green channel deployments.
  * **Managed Database Target (Application-Specific):** Supported. Verifies migration of relational application data stores to **Amazon RDS**.
  * **Phased Canary Cutover via DNS (Application-Specific):** Supported. Documents the use of **Amazon Route 53** weighted DNS routing to conduct a controlled traffic shift: routing an initial **~1% canary traffic sample** to AWS, progressively scaling up to a **50/50 traffic split** between the on-premises data center and AWS, and monitoring performance metrics.
  * **Multi-Region Resiliency (Application-Specific):** Supported. Documents the expansion of the application stack into a **second AWS Region** for active/active geographic redundancy.
* **Claims NOT Supported by this Source:**
  * **Full Data-Center Exit:** *Not supported.* The article focuses strictly on a single mobile banking application; it was published prior to the 2020 final data-center exit and does not claim enterprise-wide data-center closure.
  * **Quantitative Operational Metrics:** *Not supported.* Does not cite the ~3-month build time reduction, 70% DR test improvement, or 50% incident/error reductions (these appear exclusively in the AWS case study).
  * **Total Migration Cost or Net Financial Savings:** *Not supported.* No financial figures or dollar budgets are disclosed.

---

### Source 3: Amazon Corporate Press Announcement

* **Exact Title:** *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider*
* **Publisher:** Amazon (Amazon Press Center / Corporate Communications)
* **Publication Date:** November 28, 2016
* **URL:** [https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider](https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider)
* **Access Date:** November 7, 2026
* **Short Summary:** An official corporate press release issued jointly by Amazon and Capital One announcing that Capital One had chosen AWS as its predominant cloud infrastructure provider. The announcement includes statements from Capital One Chief Information Officer Rob Alexander and AWS leadership detailing the bank's strategic vision to transition from traditional commercial software procurement toward building proprietary, cloud-native applications and modernizing retail and commercial banking capabilities.
* **Claims Supported by this Source:**
  * **Strategic Cloud Selection (Enterprise-Wide):** Supported. Establishes the November 2016 corporate decision designating AWS as Capital One's predominant cloud infrastructure provider.
  * **Organizational & Engineering Mandate (Enterprise-Wide):** Supported. Documents Capital One's executive commitment to software-led banking innovation, transitioning internal talent toward agile cloud development, and moving core banking and commercial operations to AWS over a multi-year horizon.
* **Claims NOT Supported by this Source:**
  * **Completed Data-Center Exit:** *Not supported.* The press release announces the initial strategic agreement in November 2016; it does not report the data-center exit (which was completed four years later in 2020).
  * **Quantitative Operational Outcomes:** *Not supported.* Does not contain the subsequent operational metrics (build times, DR test reductions, incident resolution improvements, or transaction error reductions).
  * **Application-Specific Architecture:** *Not supported.* Does not detail the mobile application microexperience design, Route 53 DNS weighting, custom AMIs, or Ansible configurations.
  * **Contract Value or Financial Savings:** *Not supported.* Commercial contract terms, dollar investments, and projected net savings figures are omitted.

---

## 3. Systematic Evidence Verification Matrix

The following matrix cross-references the core factual claims, quantitative metrics, and architectural patterns investigated in the Week 2 research against the three primary sources:

| Specific Claim / Metric Checked | Source 1: AWS Case Study (2020) | Source 2: Capital One Tech (2019) | Source 3: Amazon Press Release (2016) | Verified Evidentiary Scope | Methodological Caution / Notes |
|---|---|---|---|---|---|
| **Exit from eight on-premises data centers** | **Supported** *(completed 2020)* | Not supported *(predates 2020 exit)* | Not supported *(announces 2016 start)* | **Enterprise-Wide** | Sourced strictly from AWS Case Study (2020). Verifies complete data-center decommissioning. |
| **Development environment build time from ~3 months to minutes** | **Supported** *(~3 months to minutes)* | Not supported | Not supported | **Enterprise-Wide** | Vendor-reported metric from AWS Case Study (2020); reflects aggregate developer environment lead time. |
| **Disaster recovery test duration reduced by 70%** | **Supported** *(70% reduction)* | Not supported | Not supported | **Enterprise-Wide** | Vendor-reported metric from AWS Case Study (2020); applies to DR test simulation execution. |
| **Critical incident resolution time reduced by 50%** | **Supported** *(50% reduction)* | Not supported | Not supported | **Enterprise-Wide** | Vendor-reported metric from AWS Case Study (2020); reflects Mean Time to Resolution (MTTR). |
| **Transaction errors reduced by 50%** | **Supported** *(50% reduction)* | Not supported | Not supported | **Enterprise-Wide** | Vendor-reported metric from AWS Case Study (2020); represents runtime transaction error frequency. |
| **Decomposition into "Microexperiences"** | Not supported | **Supported** *(mobile app backend)* | Not supported | **Application-Specific** | Verified exclusively for the customer-facing mobile banking application in Capital One Tech (2019). |
| **Custom Golden AMIs & Ansible Automation** | Not supported | **Supported** *(instance provisioning)* | Not supported | **Application-Specific** | Verified exclusively for the mobile app in Capital One Tech (2019); illustrates IaC and drift management. |
| **Auto Scaling Groups & Blue/Green Deployments** | Not supported | **Supported** *(deployment channels)* | Not supported | **Application-Specific** | Sourced to Capital One Tech (2019); used for dynamic elasticity and zero-downtime updates. |
| **Amazon Route 53 Weighted Canary Traffic Shifting (1% to 50/50)** | Not supported | **Supported** *(DNS traffic management)* | Not supported | **Application-Specific** | Sourced to Capital One Tech (2019); describes canary cutover from on-premises to AWS. |
| **Multi-Region Active/Active Application Footprint** | Not supported | **Supported** *(dual AWS regions)* | Not supported | **Application-Specific** | Sourced to Capital One Tech (2019); describes geographic failover for mobile servicing. |
| **Selection of AWS as predominant cloud provider** | Referenced | Referenced | **Supported** *(announced Nov 28, 2016)* | **Enterprise-Wide** | Sourced to Amazon Press Release (2016); establishes corporate timeline and cloud-first mandate. |
| **Total enterprise migration cost or audited net savings** | **Not supported** *(no dollar figures)* | **Not supported** *(no dollar figures)* | **Not supported** *(no dollar figures)* | **Unverified / Undisclosed** | **Do not invent.** None of the primary sources establish total migration expenditure or net financial ROI. |

---

## 4. Citation and Attribution Discipline

To preserve academic integrity across all project deliverables (`case-study-analysis.md`, `problem-and-solution.md`, and technical architecture documentation), Group 41 adheres to the following citation guidelines:

1. **Vendor Attribution:** All operational performance metrics (environment build speed, DR test duration, incident resolution, and error rates) must be explicitly attributed to the *AWS Customer Case Study (2020)*. They must be characterized as vendor-published marketing benchmarks rather than independently audited financial or operational results.
2. **Boundary of Generalization:** Architectural patterns described in *Moving a Customer-Facing App to AWS* (microexperiences, Route 53 weighted canary shifting, custom AMI pipelines) must be explicitly described as **application-specific** implementations. They must not be presented as the universal architecture for every legacy or back-office workload.
3. **Chronological Alignment:** The 2016 Amazon press release represents the **inception** of the predominant partnership, while the 2020 AWS case study marks the **culmination** (exit from eight data centers). Analytical claims must not conflate the 2016 strategic intent with the 2020 completion state.
4. **Financial Transparency:** Where cost considerations are analyzed, project deliverables must explicitly acknowledge that total migration costs and net dollar savings are **undisclosed in the primary literature**, avoiding speculative or fabricated financial claims.

---

## 5. Primary References

1. **Amazon Web Services.** (2020). *Capital One Case Study — All-in on AWS*. AWS Customer Success Stories.  
   URL: [https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/](https://aws.amazon.com/solutions/case-studies/capital-one-all-in-aws/)  
   *Metadata Status:* Title, Publisher, and URL verified; publication date reflects 2020 milestone (exact day/month not shown on page); accessed November 7, 2026.

2. **Capital One Tech.** (2019). *Moving a Customer-Facing App to AWS*. Capital One Technology Blog.  
   URL: [https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/](https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/)  
   *Metadata Status:* Title, Publisher, and URL verified; publication year verified as circa 2019 (exact day/month not shown on live portal); accessed November 7, 2026.

3. **Amazon.** (2016, November 28). *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider*. Amazon Press Center.  
   URL: [https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider](https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider)  
   *Metadata Status:* Exact Title, Publisher, URL, and full publication date (November 28, 2016) verified; accessed November 7, 2026.
