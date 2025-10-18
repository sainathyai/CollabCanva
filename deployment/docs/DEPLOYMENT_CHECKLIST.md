# 🚀 CollabCanvas Deployment to AWS

**Date**: October 17, 2025  
**Branch**: `pr11-ai-canvas-agent` (with PR15 RBAC completed)  
**Status**: Ready to Deploy

---

## ✅ Pre-Deployment Checklist

- [x] PR15 (RBAC) code committed
- [x] All features tested locally
- [x] Backend running on port 8080
- [x] Frontend running on port 5173
- [ ] Environment variables documented
- [ ] AWS account ready
- [ ] Domain name ready (optional)

---

## 📦 Part 1: Deploy Backend to AWS ECS Fargate

### Step 1.1: Prepare Backend Docker Image

**File**: `backend/Dockerfile` (already exists)

Verify the Dockerfile is production-ready:
```bash
cd backend
docker build -t collabcanvas-backend .
docker run -p 8080:8080 --env-file .env collabcanvas-backend
```

### Step 1.2: Create AWS ECR Repository

```bash
# Login to AWS CLI (if not already)
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json

# Create ECR repository
aws ecr create-repository \
  --repository-name collabcanvas-backend \
  --region us-east-1

# Note the repository URI (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com/collabcanvas-backend)
```

### Step 1.3: Push Docker Image to ECR

```bash
# Get ECR login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ECR_URI>

# Tag your image
docker tag collabcanvas-backend:latest <YOUR_ECR_URI>:latest

# Push to ECR
docker push <YOUR_ECR_URI>:latest
```

### Step 1.4: Create ECS Fargate Cluster

**Via AWS Console** (easier for first deployment):

1. Go to **ECS Console** → **Clusters** → **Create Cluster**
2. Name: `collabcanvas-cluster`
3. Infrastructure: **AWS Fargate (serverless)**
4. Click **Create**

### Step 1.5: Create Task Definition

1. Go to **Task Definitions** → **Create new Task Definition**
2. Configure:
   - Name: `collabcanvas-backend-task`
   - Launch type: **Fargate**
   - CPU: **0.5 vCPU**
   - Memory: **1 GB**
   - Container:
     - Name: `collabcanvas-backend`
     - Image URI: `<YOUR_ECR_URI>:latest`
     - Port: **8080**
     - Environment Variables:
       ```
       NODE_ENV=production
       PORT=8080
       FIREBASE_PROJECT_ID=<your-firebase-project-id>
       AWS_REGION=us-east-1
       AWS_ACCESS_KEY_ID=<your-key>
       AWS_SECRET_ACCESS_KEY=<your-secret>
       DYNAMODB_TABLE_PREFIX=collabcanvas
       ```
3. Click **Create**

### Step 1.6: Create Application Load Balancer

1. Go to **EC2 Console** → **Load Balancers** → **Create Load Balancer**
2. Type: **Application Load Balancer**
3. Name: `collabcanvas-alb`
4. Scheme: **Internet-facing**
5. Listeners:
   - HTTP: Port 80 → Redirect to HTTPS
   - HTTPS: Port 443 → Target Group
6. Security Group: Allow ports 80, 443, 8080
7. Click **Create**

### Step 1.7: Create ECS Service

1. Go to **ECS Console** → **collabcanvas-cluster** → **Create Service**
2. Configure:
   - Launch type: **Fargate**
   - Task Definition: `collabcanvas-backend-task`
   - Service name: `collabcanvas-backend-service`
   - Number of tasks: **2** (for high availability)
   - Load Balancer: Select `collabcanvas-alb`
   - Target Group: Create new
   - Health check path: `/health`
3. **Auto-scaling**:
   - Min tasks: 1
   - Max tasks: 10
   - Target metric: **CPU 70%**
4. Click **Create**

### Step 1.8: Note Backend URL

After deployment completes:
- ALB DNS: `collabcanvas-alb-123456.us-east-1.elb.amazonaws.com`
- Backend WebSocket URL: `wss://collabcanvas-alb-123456.us-east-1.elb.amazonaws.com`

---

## 🌐 Part 2: Deploy Frontend to AWS Amplify

### Step 2.1: Push Code to GitHub

```bash
# Ensure all changes are committed
git push origin pr11-ai-canvas-agent

# Or push to main if ready
git checkout main
git merge pr11-ai-canvas-agent
git push origin main
```

### Step 2.2: Create Amplify App

**Via AWS Console**:

1. Go to **AWS Amplify Console**
2. Click **New App** → **Host web app**
3. Source: **GitHub**
4. Authorize GitHub access
5. Repository: `CollabCanva`
6. Branch: `main` (or `pr11-ai-canvas-agent`)
7. Click **Next**

### Step 2.3: Configure Build Settings

Amplify will auto-detect Vite. Customize if needed:

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

### Step 2.4: Add Environment Variables

In Amplify Console → **Environment Variables**:

```
VITE_API_URL=https://collabcanvas-alb-123456.us-east-1.elb.amazonaws.com
VITE_WS_URL=wss://collabcanvas-alb-123456.us-east-1.elb.amazonaws.com
VITE_FIREBASE_API_KEY=<your-firebase-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-domain>
VITE_FIREBASE_PROJECT_ID=<your-project-id>
```

### Step 2.5: Deploy

Click **Save and Deploy**

Amplify will:
1. Clone your repo
2. Install dependencies
3. Build Vite app
4. Deploy to CloudFront CDN

**Result**: Your frontend is live at `https://<random>.amplifyapp.com`

### Step 2.6: (Optional) Add Custom Domain

1. In Amplify Console → **Domain Management**
2. Click **Add domain**
3. Enter: `collabcanva.com`
4. Follow DNS verification steps
5. SSL certificate auto-provisioned

---

## 🔒 Part 3: Security & Environment Setup

### Backend Environment Variables

Create `.env` file for ECS Task Definition:

```bash
NODE_ENV=production
PORT=8080

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# DynamoDB
DYNAMODB_TABLE_PREFIX=collabcanvas

# CORS
ALLOWED_ORIGINS=https://your-domain.amplifyapp.com,https://collabcanva.com
```

### Frontend Environment Variables

Update `frontend/.env.production`:

```bash
VITE_API_URL=https://api.collabcanva.com
VITE_WS_URL=wss://api.collabcanva.com
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🧪 Part 4: Post-Deployment Testing

### Test Checklist

1. **Frontend Loads**
   - [ ] Navigate to Amplify URL
   - [ ] No console errors
   - [ ] All assets load from CloudFront

2. **Authentication Works**
   - [ ] Login with Firebase
   - [ ] Token stored correctly
   - [ ] Redirects to Dashboard

3. **WebSocket Connection**
   - [ ] Opens connection on Canvas page
   - [ ] No "Authentication failed" errors
   - [ ] Real-time updates work

4. **RBAC Works**
   - [ ] Create project as owner
   - [ ] Add collaborator as viewer
   - [ ] Verify viewer can't edit
   - [ ] Verify editor can edit

5. **Database Persistence**
   - [ ] Create objects
   - [ ] Refresh page
   - [ ] Objects still there
   - [ ] Check DynamoDB tables

---

## 📊 Part 5: Monitoring Setup

### CloudWatch Dashboards

1. Go to **CloudWatch** → **Dashboards** → **Create Dashboard**
2. Name: `CollabCanvas-Production`
3. Add widgets:
   - ECS CPU utilization
   - ECS memory utilization
   - ALB request count
   - ALB target response time
   - DynamoDB read/write capacity

### Set Up Alarms

1. **High CPU Alarm**:
   - Metric: ECS CPU > 80% for 5 minutes
   - Action: Send email notification

2. **Error Rate Alarm**:
   - Metric: ALB 5XX errors > 10/minute
   - Action: Send email notification

3. **WebSocket Disconnect Alarm**:
   - Metric: Custom metric from backend
   - Action: Send email notification

---

## 💰 Estimated Monthly Cost

| Service | Cost |
|---------|------|
| AWS Amplify (50GB bandwidth) | $7.50 |
| ECS Fargate (2 tasks, 0.5 vCPU, 1GB) | $21.60 |
| Application Load Balancer | $16.20 |
| DynamoDB (On-Demand) | $2-10 |
| CloudFront (50GB transfer) | $4.25 |
| Route 53 (if using custom domain) | $0.50 |
| **Total** | **~$52/month** |

---

## 🎯 Quick Deploy Commands

### Deploy Backend (from local):
```bash
cd backend
docker build -t collabcanvas-backend .
docker tag collabcanvas-backend:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# Update ECS service to use new image
aws ecs update-service \
  --cluster collabcanvas-cluster \
  --service collabcanvas-backend-service \
  --force-new-deployment
```

### Deploy Frontend (via Git):
```bash
git add -A
git commit -m "feat: production deployment"
git push origin main  # Amplify auto-deploys
```

---

## 🆘 Troubleshooting

### Backend Issues

**"Task failed to start"**
- Check CloudWatch Logs in ECS
- Verify environment variables
- Check ECR image exists

**"WebSocket connection refused"**
- Verify ALB security group allows port 8080
- Check ECS task is running
- Verify WebSocket upgrade headers in ALB

**"Cannot connect to DynamoDB"**
- Verify IAM role has DynamoDB permissions
- Check AWS credentials in environment
- Verify table names match

### Frontend Issues

**"Build failed in Amplify"**
- Check build logs in Amplify Console
- Verify `package.json` scripts
- Check Node version compatibility

**"Cannot connect to backend"**
- Verify `VITE_WS_URL` environment variable
- Check CORS settings on backend
- Verify ALB is publicly accessible

**"Firebase auth not working"**
- Check Firebase API keys
- Verify domain is authorized in Firebase Console
- Check browser console for errors

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Amplify
- [ ] Backend deployed to ECS
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] All environment variables set
- [ ] Database tables created
- [ ] Health checks passing
- [ ] Auto-scaling configured
- [ ] CloudWatch monitoring active
- [ ] Backup/recovery tested
- [ ] Load testing completed
- [ ] Documentation updated

---

**🎉 Your CollabCanvas app is now live on AWS!**

Next steps:
1. Set up CI/CD pipelines
2. Implement blue-green deployments
3. Add CloudFront caching rules
4. Set up WAF for security
5. Implement cost optimization strategies

