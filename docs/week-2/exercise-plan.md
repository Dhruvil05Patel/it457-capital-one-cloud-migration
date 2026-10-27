# IT457 Week 2 — Practical Cloud Migration Exercise Plan

**Case study:** Capital One's migration to AWS  
**Group:** 41  
**Contributor:** Aryan Rathod (202301164)  
**Status:** Proposed plan — not yet implemented

## 1. Objective
Demonstrate cloud migration concepts using a small, non-sensitive containerized web application. Deploy it from a local development environment to a cloud virtual machine, test it, and evaluate one possible refactoring to a managed service. This exercise is inspired by the case study; it is **not a reproduction of Capital One's production migration**.

## 2. Proposed scope
- Containerize a simple web application using Docker.
- Run it locally and record a baseline.
- Create a cloud VM and configure the minimum required network access.
- Deploy the container to the VM.
- Configure basic monitoring and logs.
- Optionally move one suitable component, such as static-file storage or a small relational database, to a managed service if time, budget, and course scope permit.
- Compare performance, setup effort, and estimated cost.
- Tear down resources after testing to avoid unnecessary charges.

## 3. Tools and prerequisites
- A small demo application with no personal or financial data.
- Docker and Git.
- Cloud account with permission to create a VM and required resources.
- SSH client and key pair.
- Basic firewall/security-group rules.
- Provider pricing calculator and a results log.
- Optional: managed database/object storage service if approved and within budget.

Do not commit passwords, private keys, API tokens, `.env` files, or cloud credentials to GitHub.

## 4. Implementation steps

### Phase A — Local baseline
1. Select a minimal application and commit its source code.
2. Create a Dockerfile and `.dockerignore`.
3. Build and run the container locally.
4. Test the main endpoint and record response time, errors, and setup time.

### Phase B — Cloud deployment
1. Choose a suitable cloud VM size and region.
2. Create the VM and restrict SSH access to the team's IP where possible.
3. Install or configure Docker using official provider instructions.
4. Transfer or pull the application image/source securely.
5. Run the container and expose only the required application port.
6. Test the public endpoint and record configuration steps and deployment time.

### Phase C — Validation
1. Confirm the application is reachable through the intended URL or endpoint.
2. Test normal requests and basic error handling.
3. Record response time and error rate for a repeatable small test.
4. Inspect logs and configure a basic health check or alert if feasible.
5. Document any failures and fixes.

### Phase D — Managed-service refactor (optional)
Choose one component only if the exercise scope and budget permit:
- Use managed object storage for static files, or
- Use a managed relational database for structured data.

Document the original design, the refactored design, configuration, access control, and any code changes. Do not migrate real user data.

### Phase E — Cost and cleanup
1. Estimate compute, storage, data transfer, and managed-service costs with the provider calculator.
2. Record assumptions, region, instance/service type, expected runtime, and pricing date.
3. Stop or delete billable resources after the exercise, after saving logs and evidence.
4. Verify that no unnecessary resources remain.

## 5. Evaluation metrics

| Metric | How to measure | Evidence to retain |
|---|---|---|
| Provisioning time | Time from starting setup to usable endpoint | Timestamped notes |
| Deployment effort | Count manual steps and record elapsed time | Checklist and notes |
| Response time | Repeat the same requests and record results | Test output or simple table |
| Error rate | Failed requests divided by total requests | Test results |
| Availability check | Verify endpoint and health check during test | Screenshot/log |
| Estimated cost | Calculator estimate using documented assumptions | Estimate and date |
| Security baseline | Review open ports, secret handling, and access rules | Checklist (no secrets) |

Avoid claiming a statistically significant performance improvement from a tiny sample. State test conditions and limitations.

## 6. Risks and mitigations
- **Unexpected cloud charges:** set a budget alert if available, use small resources, and clean up immediately.
- **Public exposure:** limit inbound rules and avoid storing sensitive data.
- **Credential leakage:** use SSH keys and environment variables; never commit secrets.
- **Unreliable measurements:** repeat tests under documented conditions and report the sample size.
- **Scope creep:** treat the managed-service refactor as optional if time or budget is limited.

## 7. Deliverables
- Application source and Docker configuration (in the project repository).
- Deployment steps and architecture diagram.
- Test results table and screenshots/log extracts with secrets removed.
- Cost estimate with assumptions and access date.
- Short conclusion describing what worked, what failed, and what would change in a production deployment.

## References
1. AWS, [AWS Architecture Center](https://aws.amazon.com/architecture/)
2. AWS, [Amazon EC2 documentation](https://docs.aws.amazon.com/ec2/)
3. AWS, [Amazon RDS documentation](https://docs.aws.amazon.com/rds/)
4. AWS, [Amazon S3 documentation](https://docs.aws.amazon.com/s3/)
5. AWS, [AWS Pricing Calculator](https://calculator.aws/)
