# Architecture Notes — Capital One Cloud Migration to AWS

**Course:** IT457 – Cloud Computing  
**Project:** Capital One — Full Exit from Data Centers to AWS  
**Phase:** Week 1 — Preliminary Research

## 1. Overview

Capital One adopted AWS as part of its cloud-first strategy and completed its exit from eight on-premises data centers in 2020. The migration involved infrastructure modernization and changes to application architecture and deployment practices.

These notes summarize the architecture concepts identified in the available case-study sources. They are preliminary research, not a complete representation of Capital One's production architecture.

## 2. Architecture Components

| Component / Service | Role | Relevance to the Case Study |
|---|---|---|
| Amazon EC2 | Virtual computing instances | Supports applications running on cloud infrastructure. |
| Amazon S3 | Object storage | Provides scalable storage for application data and objects. |
| Amazon RDS | Managed relational database service | Reduces the need to manage database infrastructure directly. |
| Amazon Route 53 | DNS and traffic routing | Used in the documented customer-facing application migration. |
| Auto Scaling Groups | Automated EC2 capacity management | Supports scaling application infrastructure based on configured requirements. |
| AWS Lambda | Serverless compute | Used in Capital One's subsequent serverless adoption. |
| Multiple AWS Regions | Geographically separated infrastructure | The documented mobile application migration expanded into a second Region. |

**Important:** This table lists services relevant to the case study; it does not imply that every service was used by every Capital One application.

## 3. Migration Approach

The documented customer-facing application migration illustrates a phased approach:

1. **Prepare the application:** Adapt the application and its infrastructure for deployment on AWS.
2. **Configure traffic management:** Use Amazon Route 53 to manage traffic during the transition.
3. **Deploy and test:** Begin with a limited deployment and validate the application.
4. **Shift production traffic gradually:** Move a small portion of traffic to AWS and monitor for problems.
5. **Expand the deployment:** Increase traffic as confidence in the new environment grows.
6. **Extend regional deployment:** Introduce a second AWS Region as part of the documented migration.

This is the approach described for a specific application and should not be assumed to represent every workload migrated by Capital One.

## 4. Architecture Concepts

### Scalability

Cloud computing enables application capacity to be adjusted according to demand. Auto Scaling Groups can manage the number of EC2 instances based on configured scaling policies.

### Availability and Resilience

Deploying across Availability Zones or Regions can help reduce dependence on a single failure domain. The actual resilience benefits depend on application design, data replication, traffic routing, and recovery configuration.

### Managed Services

Services such as Amazon RDS and AWS Lambda reduce certain infrastructure-management responsibilities. Their suitability depends on application requirements, cost, security, and operational constraints.

### Security and Governance

A financial-services cloud environment must account for access control, encryption, logging, monitoring, network security, and regulatory obligations. Specific Capital One configurations should be documented only when supported by reliable sources.

## 5. Reported Outcomes

AWS's published Capital One case study reports the following outcomes:

- Exit from eight on-premises data centers.
- Average development-environment build time reduced from approximately three months to minutes.
- Disaster-recovery time in tests reduced by 70%.
- Critical incident resolution time and transaction errors each reduced by 50%.

These are reported case-study results and should be attributed to AWS rather than presented as independently verified measurements.

## 6. Cost Considerations

A meaningful cost analysis should consider:

- Cloud compute and storage charges.
- Managed database and networking costs.
- Data transfer and monitoring expenses.
- Migration engineering and training effort.
- Data-center operating costs avoided after migration.
- Ongoing cloud optimization and resource utilization.

The overall migration cost and net financial savings have not been established by the sources reviewed so far. These figures should remain open research questions until reliable evidence is found.

## 7. Proposed Hands-on Exercise

Following the IT457 project guidelines, the group proposes:

1. Build a small web application and package it using Docker.
2. Run the application locally and record baseline performance.
3. Deploy the containerized application to a cloud virtual machine.
4. Refactor one component to use a suitable managed cloud service.
5. Measure response time and deployment effort before and after the changes.
6. Estimate cloud costs using the selected provider's pricing calculator.
7. Document the architecture, configuration, limitations, and results.

The exact cloud provider, services, application, and measurement methodology will be finalized during Week 2.

## 8. Research Sources

1. AWS — Capital One case study:  
   https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/

2. Capital One Tech — Moving a customer-facing app to AWS:  
   https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/

3. Amazon — Capital One selects AWS as its predominant cloud infrastructure provider:  
   https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider

4. AWS — Capital One serverless adoption:  
   https://aws.amazon.com/solutions/case-studies/capital-one-lambda-ecs-case-study/

## 9. Open Questions for Week 2

- What was the detailed migration timeline and workload prioritization strategy?
- Which services supported security, monitoring, and compliance?
- What challenges arose during application migration?
- What verified financial data is available?
- Which architectural components should be reproduced in the hands-on exercise?
