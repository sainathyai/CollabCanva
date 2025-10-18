# 🚀 Deployment Guide

Complete guide for deploying CollabCanvas to production on AWS.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Frontend Deployment (AWS Amplify)](#frontend-deployment-aws-amplify)
- [Backend Deployment (AWS ECS)](#backend-deployment-aws-ecs)
- [Database Setup (DynamoDB)](#database-setup-dynamodb)
- [Domain Configuration](#domain-configuration)
- [Environment Variables](#environment-variables)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ AWS Account with billing enabled
- ✅ GitHub Account
- ✅ Firebase Account (for authentication)
- ✅ OpenAI Account (for AI features)
- ✅ Domain name (optional, for custom domain)

### Required Tools
```bash
# Install AWS CLI
brew install awscli  # macOS
# OR
choco install awscli  # Windows

# Install Docker
# Download from https://www.docker.com/products/docker-desktop

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region: us-east-2
# Enter default output format: json
```

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Users     │────▶│ AWS Amplify  │────▶│  React SPA   │
└─────────────┘     │   (CDN)      │     └──────────────┘
                    └──────────────┘
                                             │
                                             │ HTTPS/WSS
                                             ▼
                    ┌──────────────┐     ┌──────────────┐
                    │     ALB      │────▶│   ECS        │
                    │  (HTTPS)     │     │  Fargate     │
                    └──────────────┘     └──────────────┘
                                             │
                                             │
                                             ▼
                                       ┌──────────────┐
                                       │  DynamoDB    │
                                       └──────────────┘
```

---

## Frontend Deployment (AWS Amplify)

### Step 1: Connect GitHub Repository

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **"New app"** → **"Host web app"**
3. Select **GitHub** as source
4. Authorize AWS Amplify to access your repositories
5. Select **CollabCanva** repository
6. Select branch: `pr15-rbac`

### Step 2: Configure Build Settings

Amplify will auto-detect `amplify.yml`. Verify it contains:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### Step 3: Add Environment Variables

In Amplify Console, go to **"Environment variables"** and add:

```env
VITE_API_URL=https://backend.sainathyai.com
VITE_WS_URL=wss://backend.sainathyai.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=sk-proj-...
```

### Step 4: Configure SPA Rewrites

In Amplify Console, go to **"Rewrites and redirects"** and add:

```
Source: /<*>
Target: /index.html
Type: 200 (Rewrite)
```

**Or via CLI:**
```bash
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --custom-rules '[{"source":"/<*>","target":"/index.html","status":"200"}]' \
  --region us-east-2
```

### Step 5: Deploy

Click **"Save and deploy"**. Deployment takes ~3-5 minutes.

---

## Backend Deployment (AWS ECS)

### Step 1: Create DynamoDB Tables

```bash
# Projects table
aws dynamodb create-table \
  --table-name collabcanvas-projects \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=ownerId-createdAt-index,\
     KeySchema=[{AttributeName=ownerId,KeyType=HASH},\
                {AttributeName=createdAt,KeyType=RANGE}],\
     Projection={ProjectionType=ALL},\
     ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Objects table
aws dynamodb create-table \
  --table-name collabcanvas-objects \
  --attribute-definitions \
    AttributeName=projectId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=projectId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Step 2: Store Secrets in AWS Systems Manager

```bash
# Firebase credentials
aws ssm put-parameter \
  --name "/collabcanvas/prod/firebase-project-id" \
  --value "your-project-id" \
  --type "String" \
  --region us-east-2

aws ssm put-parameter \
  --name "/collabcanvas/prod/firebase-client-email" \
  --value "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com" \
  --type "SecureString" \
  --region us-east-2

aws ssm put-parameter \
  --name "/collabcanvas/prod/firebase-private-key" \
  --value "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
  --type "SecureString" \
  --region us-east-2

# OpenAI API key
aws ssm put-parameter \
  --name "/collabcanvas/prod/openai-api-key" \
  --value "sk-proj-..." \
  --type "SecureString" \
  --region us-east-2
```

### Step 3: Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name collabcanvas-backend \
  --region us-east-2
```

### Step 4: Build and Push Docker Image

```bash
# Navigate to backend directory
cd backend

# Build image
docker build -t collabcanvas-backend .

# Tag image
docker tag collabcanvas-backend:latest \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest

# Login to ECR
aws ecr get-login-password --region us-east-2 | \
  docker login --username AWS --password-stdin \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com

# Push image
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
```

### Step 5: Create IAM Roles

**Task Execution Role** (for pulling images and secrets):
```bash
aws iam create-role \
  --role-name collabcanvas-task-execution-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name collabcanvas-task-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam put-role-policy \
  --role-name collabcanvas-task-execution-role \
  --policy-name SSMParameterAccess \
  --policy-document file://ssm-policy.json
```

**Task Role** (for accessing DynamoDB):
```bash
aws iam create-role \
  --role-name collabcanvas-task-role \
  --assume-role-policy-document file://trust-policy.json

aws iam put-role-policy \
  --role-name collabcanvas-task-role \
  --policy-name DynamoDBAccess \
  --policy-document file://dynamodb-policy.json
```

### Step 6: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name collabcanvas-cluster \
  --region us-east-2
```

### Step 7: Register Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region us-east-2
```

### Step 8: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name collabcanvas-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --region us-east-2

# Create target group
aws elbv2 create-target-group \
  --name collabcanvas-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /health \
  --region us-east-2

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### Step 9: Create ECS Service

```bash
aws ecs create-service \
  --cluster collabcanvas-cluster \
  --service-name collabcanvas-service \
  --task-definition collabcanvas-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=collabcanvas-backend,containerPort=8080" \
  --region us-east-2
```

---

## Database Setup (DynamoDB)

### Table Structure

#### Projects Table
```
Table Name: collabcanvas-projects
Partition Key: id (String)
Billing Mode: PAY_PER_REQUEST
GSI: ownerId-createdAt-index
  - Partition: ownerId
  - Sort: createdAt
```

#### Objects Table
```
Table Name: collabcanvas-objects
Partition Key: projectId (String)
Sort Key: id (String)
Billing Mode: PAY_PER_REQUEST
```

### Testing Tables

```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Describe table
aws dynamodb describe-table \
  --table-name collabcanvas-projects \
  --region us-east-1

# Scan table (be careful in production!)
aws dynamodb scan \
  --table-name collabcanvas-projects \
  --max-items 10 \
  --region us-east-1
```

---

## Domain Configuration

### Step 1: Register Domain (Optional)

```bash
# Register via Route 53
aws route53domains register-domain \
  --domain-name your-domain.com \
  --duration-in-years 1 \
  --admin-contact ... \
  --registrant-contact ... \
  --tech-contact ...
```

### Step 2: Request SSL Certificate

```bash
# Request wildcard certificate
aws acm request-certificate \
  --domain-name "*.your-domain.com" \
  --validation-method DNS \
  --region us-east-2

# Add validation DNS records to Route 53
# (AWS Console or CLI)
```

### Step 3: Configure DNS Records

```bash
# Create A record for ALB
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch file://alb-dns-record.json

# Create CNAME for Amplify
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXXXXXXXXXX \
  --change-batch file://amplify-cname-record.json
```

### Step 4: Update ALB with Certificate

```bash
# Update HTTPS listener with certificate
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --certificates CertificateArn=arn:aws:acm:...
```

---

## Environment Variables

### Frontend (.env.local for development)

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_OPENAI_API_KEY=...
```

### Backend (.env for development)

```env
PORT=8080
NODE_ENV=development
AWS_REGION=us-east-1
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=...
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Production Environment Variables

All backend secrets stored in AWS Systems Manager Parameter Store:
- `/collabcanvas/prod/firebase-project-id`
- `/collabcanvas/prod/firebase-client-email`
- `/collabcanvas/prod/firebase-private-key`
- `/collabcanvas/prod/openai-api-key`

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl https://backend.your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "uptime": 12345,
  "websocket": {
    "connections": 42
  }
}
```

### Logs

```bash
# View ECS task logs
aws logs tail /ecs/collabcanvas-backend --follow --region us-east-2

# View Amplify build logs
aws amplify get-job \
  --app-id YOUR_APP_ID \
  --branch-name pr15-rbac \
  --job-id JOB_ID
```

### Metrics

```bash
# ECS service metrics
aws ecs describe-services \
  --cluster collabcanvas-cluster \
  --services collabcanvas-service \
  --region us-east-2

# DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=collabcanvas-projects \
  --start-time 2025-10-17T00:00:00Z \
  --end-time 2025-10-17T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Scaling

```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster collabcanvas-cluster \
  --service collabcanvas-service \
  --desired-count 4 \
  --region us-east-2

# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/collabcanvas-cluster/collabcanvas-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

---

## Troubleshooting

### Frontend Issues

**404 on refresh:**
```bash
# Verify SPA rewrite rule is configured
aws amplify get-app --app-id YOUR_APP_ID | grep customRules
```

**Environment variables not loading:**
```bash
# List environment variables
aws amplify get-app --app-id YOUR_APP_ID | grep environmentVariables

# Update environment variable
aws amplify update-app \
  --app-id YOUR_APP_ID \
  --environment-variables KEY=VALUE
```

### Backend Issues

**Tasks not starting:**
```bash
# Check task definition
aws ecs describe-task-definition \
  --task-definition collabcanvas-backend

# Check service events
aws ecs describe-services \
  --cluster collabcanvas-cluster \
  --services collabcanvas-service | grep events
```

**Connection refused:**
```bash
# Check security groups allow traffic
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...
```

**Database connection errors:**
```bash
# Verify DynamoDB tables exist
aws dynamodb list-tables --region us-east-1

# Check IAM permissions
aws iam get-role-policy \
  --role-name collabcanvas-task-role \
  --policy-name DynamoDBAccess
```

### SSL/Certificate Issues

**Certificate not trusted:**
```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:... \
  --region us-east-2

# Verify DNS validation
aws acm list-certificates --region us-east-2
```

---

## Cost Optimization

### Expected Monthly Costs

| Service | Usage | Cost |
|---------|-------|------|
| **Amplify** | 100GB data transfer | ~$2 |
| **ECS Fargate** | 2 tasks, 1 vCPU, 2GB RAM | ~$40 |
| **DynamoDB** | Pay-per-request | ~$5 |
| **ALB** | 1 ALB, 10GB data | ~$20 |
| **Route 53** | 1 hosted zone | ~$0.50 |
| **ACM** | SSL certificates | Free |
| **Systems Manager** | Parameter Store | Free (Standard) |
| **Total** | | **~$67/month** |

### Cost Reduction Tips

1. **Use AWS Free Tier** (first 12 months)
2. **Scale down ECS tasks** during low traffic
3. **Enable DynamoDB on-demand pricing**
4. **Use CloudFront** instead of Amplify for static hosting
5. **Set up billing alerts**

---

## Deployment Checklist

### Pre-Deployment
- [ ] Firebase project created and configured
- [ ] OpenAI API key obtained
- [ ] AWS CLI configured
- [ ] Docker installed and running
- [ ] Domain name registered (optional)

### Frontend
- [ ] Amplify app created
- [ ] GitHub repository connected
- [ ] Environment variables configured
- [ ] SPA rewrite rules added
- [ ] Custom domain configured (optional)
- [ ] Build successful
- [ ] Application accessible

### Backend
- [ ] DynamoDB tables created
- [ ] SSM parameters created
- [ ] ECR repository created
- [ ] Docker image built and pushed
- [ ] IAM roles created
- [ ] ECS cluster created
- [ ] Task definition registered
- [ ] ALB created and configured
- [ ] HTTPS listener with certificate
- [ ] ECS service created
- [ ] Health checks passing
- [ ] WebSocket connections working

### Post-Deployment
- [ ] Test all features
- [ ] Monitor logs for errors
- [ ] Set up CloudWatch alarms
- [ ] Configure auto-scaling
- [ ] Document any customizations
- [ ] Create backup strategy

---

## Quick Commands Reference

```bash
# Redeploy frontend
aws amplify start-job \
  --app-id YOUR_APP_ID \
  --branch-name pr15-rbac \
  --job-type RELEASE

# Redeploy backend
aws ecs update-service \
  --cluster collabcanvas-cluster \
  --service collabcanvas-service \
  --force-new-deployment \
  --region us-east-2

# View logs
aws logs tail /ecs/collabcanvas-backend --follow

# Check health
curl https://backend.your-domain.com/health

# List running tasks
aws ecs list-tasks \
  --cluster collabcanvas-cluster \
  --service-name collabcanvas-service
```

---

**For detailed troubleshooting, see [deployment/docs/](./deployment/docs/)** 🚀

