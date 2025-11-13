# GitHub Actions Setup Guide

## ✅ What's Been Set Up

Two GitHub Actions workflows have been created for automated deployment:

1. **Automatic Deployment** (`deploy-backend.yml`)
   - Triggers automatically on pushes to `main` when backend files change
   - Builds, pushes, and deploys automatically

2. **Manual Deployment** (`deploy-backend-manual.yml`)
   - Manual trigger only
   - Allows choosing whether to use the latest task definition from the repo

## 🔐 Required Setup Steps

### Step 1: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/sainathyai/CollabCanva
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1: AWS_ACCESS_KEY_ID**
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: Your AWS access key ID

   **Secret 2: AWS_SECRET_ACCESS_KEY**
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: Your AWS secret access key

### Step 2: Create GitHub Environment (Optional but Recommended)

1. Go to: **Settings** → **Environments**
2. Click **New environment**
3. Name it: `production`
4. (Optional) Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches

### Step 3: Verify IAM Permissions

The AWS credentials need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🚀 How to Use

### Automatic Deployment

1. **Push to main branch** with backend changes
2. Workflow automatically triggers
3. Check progress in **Actions** tab
4. Deployment completes in ~5-10 minutes

### Manual Deployment

1. Go to **Actions** tab
2. Select **Deploy Backend to ECS (Manual with Task Definition)**
3. Click **Run workflow**
4. Choose:
   - Branch: `main`
   - Use latest task def: `true` (to use `deployment/aws/task-definition.json`)
5. Click **Run workflow**

## 📊 Monitoring

- View workflow runs in the **Actions** tab
- Check deployment status in AWS ECS Console
- View logs in CloudWatch: `/ecs/collabcanvas-backend`

## 🔍 Troubleshooting

### Workflow Fails at ECR Login
- Verify AWS credentials are correct
- Check IAM permissions include ECR access

### Workflow Fails at ECS Update
- Verify ECS service exists: `collabcanvas-backend-service`
- Check cluster name: `collabcanvas-cluster`
- Verify task definition family: `collabcanvas-backend-task`

### Image Build Fails
- Check Dockerfile syntax
- Verify all dependencies are in package.json
- Check build logs in Actions tab

## 📝 Notes

- The workflow tags images with both commit SHA and `latest`
- Service stability is automatically waited for
- Only triggers on backend file changes to avoid unnecessary builds
- Task definition secrets (OpenAI API key, Firebase) are already configured

