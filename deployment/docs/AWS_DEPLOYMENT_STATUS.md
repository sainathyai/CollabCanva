# AWS Deployment Status

## ✅ Completed Steps

### 1. AWS Infrastructure Setup
All core AWS infrastructure has been created successfully:

- ✅ **VPC**: `vpc-07c7f6104ea4eeb60`
- ✅ **Subnets**: 3 subnets configured
- ✅ **Security Groups**:
  - ALB Security Group: `sg-0dc01d0593e600463` (HTTP/HTTPS ingress)
  - ECS Security Group: `sg-00ce7abbccd9a8e74` (ALB → ECS ingress)
- ✅ **ECR Repository**: `971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend`
- ✅ **CloudWatch Log Group**: `/ecs/collabcanvas-backend`
- ✅ **IAM Roles**:
  - Execution Role: `arn:aws:iam::971422717446:role/collabcanvas-task-execution-role`
  - Task Role: `arn:aws:iam::971422717446:role/collabcanvas-task-role`
- ✅ **ECS Cluster**: `collabcanvas-cluster`

**Configuration saved in**: `aws-config.json`

---

## 📋 Remaining Steps

### Step 2: Build and Push Docker Image
**Status**: Pending (Docker Desktop not running)

**Action Required**:
1. Start Docker Desktop
2. Run: `.\build-and-push-docker.ps1`

This will:
- Build the backend Docker image
- Login to ECR
- Tag and push the image to: `971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest`

---

### Step 3: Store Secrets in SSM Parameter Store
**Status**: Pending

**Action Required**:
Run: `.\setup-ssm-secrets.ps1`

You will need to provide:
- Firebase Project ID
- Firebase Client Email
- Firebase Private Key (entire key including BEGIN/END markers)

**Parameters that will be stored**:
- `/collabcanvas/prod/node-env` = "production"
- `/collabcanvas/prod/port` = "8080"
- `/collabcanvas/prod/aws-region` = "us-east-2"
- `/collabcanvas/prod/dynamodb-table-prefix` = "collabcanvas"
- `/collabcanvas/prod/firebase-project-id` (your value)
- `/collabcanvas/prod/firebase-client-email` (SecureString)
- `/collabcanvas/prod/firebase-private-key` (SecureString)

---

### Step 4: Create ALB and ECS Service
**Status**: Pending (requires Steps 2 & 3 to be completed)

**Action Required**:
Run: `.\create-alb-and-service.ps1`

This will:
- Create Application Load Balancer
- Create Target Group (health checks on `/health`)
- Create HTTP Listener (port 80)
- Register ECS Task Definition
- Create ECS Service with 2 tasks (Fargate)

**Output**: You'll get the ALB DNS name (e.g., `collabcanvas-alb-123456789.us-east-2.elb.amazonaws.com`)

---

### Step 5: Deploy Frontend to AWS Amplify
**Status**: Pending

**Action Required**:
1. Update frontend environment variable:
   ```
   VITE_WS_URL=ws://[ALB_DNS_FROM_STEP_4]
   ```

2. Deploy to Amplify:
   - Option A: Connect GitHub repo to Amplify (automatic deployments)
   - Option B: Manual deployment with Amplify CLI

**Amplify Build Settings**:
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

---

## 🚀 Quick Start Commands

```powershell
# Step 2: Build and push Docker (requires Docker Desktop running)
.\build-and-push-docker.ps1

# Step 3: Store secrets (interactive prompts)
.\setup-ssm-secrets.ps1

# Step 4: Create ALB and ECS service
.\create-alb-and-service.ps1

# Monitor deployment
aws ecs describe-services --cluster collabcanvas-cluster --services collabcanvas-backend-service --region us-east-2

# View logs
aws logs tail /ecs/collabcanvas-backend --follow --region us-east-2

# Check service health
curl http://[ALB_DNS]/health
```

---

## 📊 Monitoring

### ECS Service Status
```powershell
aws ecs describe-services `
  --cluster collabcanvas-cluster `
  --services collabcanvas-backend-service `
  --region us-east-2 `
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount,Events:events[0:3]}'
```

### CloudWatch Logs
```powershell
# Tail logs (live)
aws logs tail /ecs/collabcanvas-backend --follow --region us-east-2

# View recent logs
aws logs tail /ecs/collabcanvas-backend --since 30m --region us-east-2
```

### ALB Health Checks
Once deployed, check: `http://[ALB_DNS]/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T..."
}
```

---

## 💰 Cost Estimate

Monthly costs (approximate):
- **ECS Fargate** (2 tasks, 0.5 vCPU, 1GB RAM): ~$35
- **Application Load Balancer**: ~$20
- **Data Transfer**: ~$5-10
- **CloudWatch Logs**: ~$5
- **DynamoDB** (on-demand): Varies by usage
- **ECR Storage**: ~$1

**Total**: ~$70-80/month

---

## 🔧 Troubleshooting

### Docker Build Issues
- Ensure Docker Desktop is running
- Check Docker daemon is accessible: `docker ps`

### ECS Service Not Starting
- Check CloudWatch logs: `aws logs tail /ecs/collabcanvas-backend --follow`
- Verify SSM parameters are set correctly
- Check IAM role permissions

### Health Check Failures
- Verify backend exposes `/health` endpoint on port 8080
- Check security group allows ALB → ECS traffic
- Review container logs for errors

### WebSocket Connection Issues
- Ensure ALB allows HTTP/1.1 Upgrade headers
- Check security group rules
- Verify frontend VITE_WS_URL points to ALB DNS

---

## 📝 Configuration Files

- `aws-config.json` - Infrastructure IDs and ARNs
- `setup-aws-infrastructure.ps1` - Initial infrastructure setup ✅
- `build-and-push-docker.ps1` - Docker build and ECR push
- `setup-ssm-secrets.ps1` - Store environment variables
- `create-alb-and-service.ps1` - Create ALB and ECS service

---

## 🎯 Next Immediate Action

1. **Start Docker Desktop**
2. **Run**: `.\build-and-push-docker.ps1`
3. **Run**: `.\setup-ssm-secrets.ps1` (have Firebase credentials ready)
4. **Run**: `.\create-alb-and-service.ps1`
5. **Update frontend** with ALB DNS and deploy to Amplify

---

## 📞 Support

AWS Region: `us-east-2` (Ohio)
Account ID: `971422717446`
Project: `collabcanvas`

For issues, check:
- CloudWatch Logs: `/ecs/collabcanvas-backend`
- ECS Console: https://console.aws.amazon.com/ecs/home?region=us-east-2
- ECR Console: https://console.aws.amazon.com/ecr/repositories?region=us-east-2

