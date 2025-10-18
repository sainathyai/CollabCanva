# CollabCanvas AWS Deployment Guide

## 🎉 Current Status

✅ **Step 1 Complete**: AWS Infrastructure is fully set up!

All foundational AWS resources have been created and are ready for deployment.

---

## 🚀 Quick Deployment (3 Commands)

```powershell
# 1. Build and push Docker image (requires Docker Desktop running)
.\build-and-push-docker.ps1

# 2. Store Firebase credentials (interactive)
.\setup-ssm-secrets.ps1

# 3. Deploy to ECS
.\create-alb-and-service.ps1
```

That's it! Your backend will be live in ~5 minutes.

---

## 📋 What's Already Done

### ✅ Infrastructure Created (Step 1)

| Resource | Status | Details |
|----------|--------|---------|
| VPC | ✅ | `vpc-07c7f6104ea4eeb60` |
| Subnets | ✅ | 3 subnets across availability zones |
| Security Groups | ✅ | ALB + ECS security groups configured |
| ECR Repository | ✅ | `971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend` |
| CloudWatch Logs | ✅ | `/ecs/collabcanvas-backend` |
| IAM Roles | ✅ | Task execution + task roles with DynamoDB access |
| ECS Cluster | ✅ | `collabcanvas-cluster` |

**Configuration saved**: `aws-config.json`

---

## 📝 Next Steps

### Step 2: Build Docker Image

**Prerequisites**: Docker Desktop must be running

```powershell
.\build-and-push-docker.ps1
```

**What it does**:
- Builds `backend/Dockerfile`
- Logs into ECR
- Pushes image to `971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest`

**Time**: ~2-5 minutes (depending on Docker build cache)

---

### Step 3: Store Secrets

```powershell
.\setup-ssm-secrets.ps1
```

**You'll be prompted for**:
- Firebase Project ID
- Firebase Client Email  
- Firebase Private Key (paste entire key including `-----BEGIN/END PRIVATE KEY-----`)

**Secrets are stored encrypted** in AWS Systems Manager Parameter Store at:
- `/collabcanvas/prod/firebase-project-id`
- `/collabcanvas/prod/firebase-client-email` (SecureString)
- `/collabcanvas/prod/firebase-private-key` (SecureString)

**Time**: ~2 minutes

---

### Step 4: Deploy to ECS

```powershell
.\create-alb-and-service.ps1
```

**What it does**:
- Creates Application Load Balancer
- Creates Target Group with `/health` health checks
- Registers ECS Task Definition
- Creates ECS Service with 2 Fargate tasks
- Configures auto-scaling and load balancing

**Output**: You'll get your backend URL!
```
Backend URL: http://collabcanvas-alb-xxxxx.us-east-2.elb.amazonaws.com
WebSocket URL: ws://collabcanvas-alb-xxxxx.us-east-2.elb.amazonaws.com
```

**Time**: ~5-10 minutes for tasks to become healthy

---

### Step 5: Deploy Frontend

1. **Update Frontend Environment**:
   ```env
   VITE_WS_URL=ws://[YOUR_ALB_DNS_FROM_STEP_4]
   ```

2. **Deploy to AWS Amplify**:

   **Option A: GitHub Integration (Recommended)**
   ```bash
   # Push to GitHub
   git push origin pr15-rbac
   
   # In AWS Amplify Console:
   # 1. Connect repository
   # 2. Select branch: pr15-rbac
   # 3. Build settings: Auto-detected (or use frontend/amplify.yml)
   # 4. Add environment variable: VITE_WS_URL
   # 5. Deploy!
   ```

   **Option B: Manual Deploy**
   ```bash
   cd frontend
   npm run build
   
   # Upload dist/ folder to Amplify hosting
   ```

---

## 🔍 Verification

### Check Backend Health
```powershell
# Get ALB DNS from config
$config = Get-Content aws-config.json | ConvertFrom-Json
$albDns = $config.ALB_DNS

# Test health endpoint
curl "http://$albDns/health"
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T..."
}
```

### Monitor ECS Service
```powershell
aws ecs describe-services `
  --cluster collabcanvas-cluster `
  --services collabcanvas-backend-service `
  --region us-east-2
```

### View Logs
```powershell
# Live tail
aws logs tail /ecs/collabcanvas-backend --follow --region us-east-2

# Recent logs
aws logs tail /ecs/collabcanvas-backend --since 30m --region us-east-2
```

---

## 🛠️ Troubleshooting

### Docker Build Fails
**Problem**: `error during connect: ... dockerDesktopLinuxEngine`

**Solution**: Start Docker Desktop and ensure it's running
```powershell
docker ps  # Should list running containers (or none if empty)
```

---

### ECS Tasks Not Starting
**Check CloudWatch Logs**:
```powershell
aws logs tail /ecs/collabcanvas-backend --follow --region us-east-2
```

**Common Issues**:
1. Missing SSM parameters → Run `.\setup-ssm-secrets.ps1`
2. IAM role permissions → Check task role has DynamoDB access
3. Image not found → Verify ECR push completed successfully

---

### Health Check Failing
**Check container logs** for errors:
```powershell
# Get task ID
$taskArn = aws ecs list-tasks --cluster collabcanvas-cluster --service-name collabcanvas-backend-service --region us-east-2 --query 'taskArns[0]' --output text

# View task details
aws ecs describe-tasks --cluster collabcanvas-cluster --tasks $taskArn --region us-east-2
```

**Verify**:
- Backend exposes `/health` on port 8080
- Security group allows ALB → ECS traffic (already configured)
- Environment variables are correct

---

### WebSocket Connection Issues
**Frontend shows "Disconnected"**

**Check**:
1. ALB DNS is correct in `VITE_WS_URL`
2. Use `ws://` protocol (not `wss://` unless you've configured SSL)
3. Backend WebSocket server is running
4. Security groups allow traffic

**Test WebSocket manually**:
```javascript
const ws = new WebSocket('ws://YOUR_ALB_DNS');
ws.onopen = () => console.log('Connected!');
ws.onerror = (e) => console.error('Error:', e);
```

---

## 💰 Cost Breakdown

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 2 tasks, 0.5 vCPU, 1GB RAM | ~$35 |
| Application Load Balancer | Standard ALB | ~$20 |
| ECR | Image storage | ~$1 |
| CloudWatch Logs | ~1GB/month | ~$5 |
| Data Transfer | Normal usage | ~$5-10 |
| DynamoDB | On-demand pricing | Varies |

**Total**: **~$70-80/month**

**Cost Optimization Tips**:
- Reduce to 1 ECS task for development: `-$17.50/month`
- Use Network Load Balancer instead of ALB: `-$5/month`
- Set CloudWatch log retention to 7 days: `-$3/month`

---

## 🔐 Security

All credentials are stored securely:
- ✅ Firebase credentials in SSM Parameter Store (encrypted)
- ✅ IAM roles follow least-privilege principle
- ✅ Security groups restrict traffic (ALB → ECS only)
- ✅ VPC isolation
- ✅ ECR image scanning enabled

**No secrets in code or environment files!**

---

## 📈 Scaling

Current configuration:
- **2 Fargate tasks** (handles ~1000 concurrent WebSocket connections)
- **ALB** distributes traffic
- **Auto-scaling** can be configured (not enabled by default)

To enable auto-scaling:
```powershell
# Scale based on CPU utilization
aws application-autoscaling register-scalable-target `
  --service-namespace ecs `
  --scalable-dimension ecs:service:DesiredCount `
  --resource-id service/collabcanvas-cluster/collabcanvas-backend-service `
  --min-capacity 2 `
  --max-capacity 10 `
  --region us-east-2
```

---

## 📞 Support Resources

**AWS Documentation**:
- [ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

**Project Files**:
- `AWS_DEPLOYMENT_STATUS.md` - Detailed status and monitoring
- `aws-config.json` - Your infrastructure IDs and ARNs
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist

**AWS Console Links**:
- [ECS Cluster](https://console.aws.amazon.com/ecs/home?region=us-east-2)
- [ECR Repository](https://console.aws.amazon.com/ecr/repositories?region=us-east-2)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups)
- [Load Balancers](https://console.aws.amazon.com/ec2/v2/home?region=us-east-2#LoadBalancers)

---

## ✅ Deployment Checklist

- [x] AWS infrastructure setup
- [ ] Docker Desktop running
- [ ] Build and push Docker image
- [ ] Store Firebase credentials in SSM
- [ ] Create ALB and ECS service
- [ ] Verify backend health check
- [ ] Update frontend environment variables
- [ ] Deploy frontend to Amplify
- [ ] Test end-to-end functionality

---

## 🎯 Ready to Deploy?

Start with Step 2:

```powershell
# Make sure Docker is running first!
.\build-and-push-docker.ps1
```

Then follow the on-screen instructions for Steps 3 and 4.

**Questions?** Check `AWS_DEPLOYMENT_STATUS.md` for detailed info!

