# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated deployment.

## Workflows

### 1. `deploy-backend.yml` - Automatic Deployment
- **Trigger**: Automatically runs on pushes to `main` branch when backend files change
- **What it does**:
  - Builds Docker image
  - Pushes to ECR
  - Updates ECS task definition with new image
  - Deploys to ECS service
  - Waits for service stability

### 2. `deploy-backend-manual.yml` - Manual Deployment
- **Trigger**: Manual trigger only (workflow_dispatch)
- **What it does**:
  - Same as automatic, but allows you to choose whether to use the latest task definition from `deployment/aws/task-definition.json`
  - Useful when you've updated the task definition file and want to deploy it

## Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

1. Go to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Add these secrets:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key ID
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key

## Required GitHub Environment

1. Go to: **Settings** → **Environments** → **New environment**
2. Create environment named: `production`
3. Optionally add protection rules (required reviewers, wait timer, etc.)

## How It Works

1. **On push to main** (with backend changes):
   - Workflow automatically triggers
   - Builds Docker image with commit SHA as tag
   - Pushes to ECR
   - Updates task definition with new image
   - Deploys to ECS

2. **Manual trigger**:
   - Go to **Actions** tab
   - Select workflow
   - Click **Run workflow**
   - Choose options and run

## IAM Permissions Required

The AWS credentials need these permissions:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `ecs:DescribeTaskDefinition`
- `ecs:RegisterTaskDefinition`
- `ecs:UpdateService`
- `ecs:DescribeServices`

## Notes

- The workflow uses the image tag from the commit SHA for traceability
- It also tags the image as `latest` for convenience
- Service stability is automatically waited for (2-5 minutes typically)
- The workflow only triggers on backend changes to avoid unnecessary builds

