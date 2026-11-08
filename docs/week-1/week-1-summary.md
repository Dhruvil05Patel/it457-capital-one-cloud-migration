# Week 1 Summary: Capital One's Migration to AWS

**Course:** IT457 – Cloud Computing  

## 1. Case Study Overview

Capital One, a US financial services company, adopted a cloud-first strategy to modernize its IT infrastructure and accelerate digital banking innovation. In 2020, the company completed its migration away from eight on-premises data centers to Amazon Web Services (AWS). The transformation involved not only infrastructure migration but also application modernization and changes to software development and operations. <https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/>

## 2. Problem and Motivation

Traditional data-center infrastructure required Capital One to manage physical infrastructure and provision computing resources. The company wanted to reduce infrastructure-management overhead, improve development speed, increase operational flexibility, and strengthen the reliability of its digital banking services. Its cloud-first strategy was intended to allow technology teams to focus more on developing customer-facing applications.

## 3. Architecture and Migration Approach

Capital One adopted AWS services such as Amazon EC2 for computing, Amazon S3 for storage, and Amazon RDS for managed relational databases. AWS Lambda was also used in its cloud-based applications.

In a documented migration of its mobile servicing platform, Capital One redesigned its application around separately deployable components and independently scalable infrastructure. The team used Amazon Route 53 for traffic management, Auto Scaling Groups for infrastructure scaling, and blue/green deployment techniques. It introduced production traffic gradually, beginning with a small percentage, before expanding the migration and deploying into a second AWS Region. <https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/>

## 4. Reported Outcomes

According to AWS's published Capital One case study:

- Capital One exited eight on-premises data centers.
- Average development-environment build time decreased from approximately three months to minutes.
- Disaster-recovery time in tests decreased by 70%.
- Critical incident resolution time and transaction errors each decreased by 50%.

These figures are reported by AWS and are not presented here as independently audited results. <https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/>

## 5. Cost and Business Impact

Moving to AWS enabled more flexible infrastructure provisioning and a pay-for-use model. Retiring physical data centers also reduced the need to operate the associated on-premises infrastructure. However, the total financial cost of Capital One's migration and the overall net savings were not established from the sources reviewed. A quantitative cost comparison would require additional verified financial data.

## 6. Key Lessons

Capital One's experience demonstrates that large-scale cloud migration involves more than transferring existing servers. Application redesign, gradual traffic migration, automation, resilience planning, and cloud engineering capabilities are important considerations. For the practical exercise, the group plans to migrate a Dockerized application to a cloud virtual machine and refactor a component to use a managed cloud service, documenting the effort, performance, and estimated cost.

## References

1. AWS. *Migrating from Data Centers to AWS: Capital One Case Study.* https://aws.amazon.com/solutions/case-studies/capital-one-all-in-on-aws/
2. Valentino, J. D. Capital One Tech. *Moving a Customer-Facing App to AWS.* https://www.capitalone.com/tech/cloud/moving-customer-facing-apps-to-aws/
3. Amazon. *Capital One Selects AWS as Its Predominant Cloud Infrastructure Provider.* https://press.aboutamazon.com/2016/11/capital-one-selects-aws-as-its-predominant-cloud-infrastructure-provider
