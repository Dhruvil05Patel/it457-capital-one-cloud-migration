# Research Sources — Capital One Cloud Migration to AWS

**Course:** IT457 – Cloud Computing  
**Project:** Capital One — Full Exit from Data Centers to AWS  
**Research phase:** Week 1  

## 1. Purpose

This document records the sources used to investigate Capital One's migration from on-premises data centers to Amazon Web Services (AWS). The research focuses on the motivation for migration, architecture, migration strategy, costs, and reported operational outcomes.

## 2. Sources and Key Findings

### Source 1: AWS — Capital One Case Study

**Link:** https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/

**Source type:** Official AWS customer case study.

**Key findings:**
- Capital One completed its exit from eight on-premises data centers in 2020.
- The company adopted AWS services, including Amazon EC2, Amazon S3, and Amazon RDS.
- Average development-environment build time decreased from approximately three months to minutes.
- Disaster-recovery time during testing decreased by 70%.
- Critical incident resolution time and transaction errors each decreased by 50%.

**Relevance:** This is the primary starting point for the project's migration background, AWS services, and reported outcomes.

**Limitations:** The results are reported by AWS and should be attributed to the case study. The source does not establish the total financial cost of the entire migration.

### Source 2: Capital One Tech — Moving a Customer-Facing App to AWS

**Link:** https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/

**Source type:** First-party engineering article published by Capital One.

**Key findings:**
- The application migration used a phased approach rather than moving all production traffic at once.
- Route 53 was introduced to manage user traffic during migration.
- The team initially tested a single-Availability-Zone deployment and moved a small portion of production traffic to AWS.
- Traffic was gradually shifted while the team monitored and addressed issues.
- A second AWS Region was subsequently introduced.

**Relevance:** This source provides practical insight into application migration, traffic management, testing, and regional deployment.

**Limitations:** It describes a particular customer-facing application, not necessarily the exact architecture of every Capital One workload.

### Source 3: Amazon — Capital One Selects AWS

**Link:** https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider

**Source type:** Original corporate announcement.

**Research focus:**
- Capital One's initial cloud-provider decision.
- The strategic motivation for adopting AWS.
- The intended role of cloud infrastructure in technology modernization.

**Relevance:** This announcement helps establish the original strategy and provides historical context for the later data-center exit.

**Limitations:** The announcement describes the initial strategy; it should not be treated as evidence that the full migration had already been completed at that time.

### Source 4: AWS — Capital One's Serverless Adoption

**Link:** https://aws.amazon.com/solutions/case-studies/capital-one-lambda-ecs-case-study/

**Source type:** Official AWS customer case study.

**Key findings:**
- Capital One subsequently adopted serverless computing and container-based approaches, including AWS Lambda and Amazon ECS.
- AWS reports cost savings of up to 90% for certain applications.
- The case study discusses reducing developer effort and improving operational efficiency.

**Relevance:** This source illustrates how cloud modernization continued after the initial data-center migration.

**Limitations:** The reported savings apply to certain applications and must not be presented as total savings from the entire data-center migration.

### Source 5: AWS — Capital One's Cloud Resilience

**Link:** https://aws.amazon.com/solutions/case-studies/capital-one-improving-resilience-case-study/

**Source type:** Official AWS customer case study.

**Research focus:**
- Cloud resilience and availability.
- Automated recovery and failover.
- Improving the reliability of applications after migration.

**Relevance:** This source can support the detailed architecture and resilience analysis planned for Week 2.

## 3. Preliminary Case-Study Findings

| Research area | Preliminary finding |
|---|---|
| Organization | Capital One, a US financial services company |
| Cloud provider | Amazon Web Services (AWS) |
| Migration outcome | Exit from eight on-premises data centers, completed in 2020 |
| Example AWS services | Amazon EC2, Amazon S3, Amazon RDS |
| Migration approach | Phased application migration and gradual traffic shifting in the documented mobile application example |
| Development efficiency | Development-environment build time decreased from approximately three months to minutes |
| Disaster recovery | 70% reduction in disaster-recovery time in tests |
| Operational outcomes | 50% reductions in critical incident resolution time and transaction errors, as reported by AWS |
| Total migration cost | Not established by the sources reviewed |
| Financial savings | Application-specific serverless savings are reported separately; they are not equivalent to total migration savings |

## 4. Research Gaps and Next Steps

The following questions require further investigation before the detailed Week 2 report:

1. What was the detailed migration timeline, and how were different application workloads prioritized?
2. Which AWS services were used for computing, storage, databases, networking, monitoring, and security?
3. What migration challenges arose from operating in a regulated financial-services environment?
4. Are there publicly documented financial figures for the overall migration, data-center operating costs, or return on investment?
5. Which architecture and measurements can be reproduced in a smaller hands-on cloud migration exercise?

Where reliable financial figures are unavailable, the report will explicitly state that the figures were not found in the reviewed sources rather than inventing estimates.

## 5. References

1. Amazon Web Services. *Migrating from Data Centers to AWS: Capital One Case Study*. https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/
2. Capital One Tech. *Moving a Customer-Facing App to AWS*. https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/
3. Amazon. *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider*. https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider
4. Amazon Web Services. *Capital One Saves Developer Time and Reduces Costs by Going Serverless on AWS*. https://aws.amazon.com/solutions/case-studies/capital-one-lambda-ecs-case-study/
5. Amazon Web Services. *Improving Resilience Using AWS with Capital One*. https://aws.amazon.com/solutions/case-studies/capital-one-improving-resilience-case-study/

