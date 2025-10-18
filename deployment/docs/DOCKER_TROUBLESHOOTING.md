# Docker Desktop Troubleshooting

## Current Issue

Docker Desktop is showing API version errors:
```
request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...
```

This usually means Docker Desktop is either:
1. Still initializing (can take 1-2 minutes)
2. Having service issues
3. API version mismatch

## Solutions to Try

### Solution 1: Wait for Docker Desktop to Fully Start
Docker Desktop can take 1-2 minutes to fully initialize after starting.

**Check Status**:
```powershell
docker ps
```

**Expected Output** (when ready):
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### Solution 2: Restart Docker Desktop
1. Right-click Docker Desktop icon in system tray
2. Select "Quit Docker Desktop"
3. Wait 10 seconds
4. Start Docker Desktop again
5. Wait 1-2 minutes for full initialization
6. Try: `docker ps`

### Solution 3: Switch Docker Context
Docker might be using the wrong context:

```powershell
# List available contexts
docker context ls

# Switch to desktop-linux
docker context use desktop-linux

# Try again
docker ps
```

### Solution 4: Restart Docker Service
```powershell
# Run as Administrator
Restart-Service -Name com.docker.service

# Wait 30 seconds
Start-Sleep -Seconds 30

# Test
docker ps
```

### Solution 5: Check Docker Desktop Settings
1. Open Docker Desktop
2. Go to Settings → General
3. Ensure "Use the WSL 2 based engine" is checked (recommended)
4. Apply & Restart

### Solution 6: Use Legacy Docker Engine
If you have Docker Toolbox or older Docker installed:

```powershell
# Set environment to use legacy engine
$env:DOCKER_HOST = "tcp://localhost:2375"

# Test
docker ps
```

## Alternative: Build on Linux/WSL

If Docker Desktop continues to have issues, you can build in WSL:

```bash
# Open WSL terminal
wsl

# Navigate to project
cd "/mnt/c/Users/Borehole Seismic/Documents/Gauntlet AI/CollabCanva"

# Build and push
cd backend
docker build -t collabcanvas-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 971422717446.dkr.ecr.us-east-2.amazonaws.com

# Tag and push
docker tag collabcanvas-backend:latest 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
docker push 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
```

## Alternative: Use AWS CodeBuild

If Docker continues to have issues locally, use AWS CodeBuild to build the image:

### Step 1: Create buildspec.yml
```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 971422717446.dkr.ecr.us-east-2.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - cd backend
      - docker build -t collabcanvas-backend:latest .
      - docker tag collabcanvas-backend:latest 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
  post_build:
    commands:
      - echo Build completed on `date`
      - docker push 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
```

### Step 2: Create CodeBuild Project
```powershell
# Create CodeBuild project
aws codebuild create-project `
  --name collabcanvas-backend-build `
  --source type=GITHUB,location=https://github.com/sainathyai/CollabCanva.git `
  --artifacts type=NO_ARTIFACTS `
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:7.0,computeType=BUILD_GENERAL1_SMALL,privilegedMode=true `
  --service-role arn:aws:iam::971422717446:role/codebuild-service-role `
  --region us-east-2

# Trigger build
aws codebuild start-build `
  --project-name collabcanvas-backend-build `
  --region us-east-2
```

## Verify Docker is Working

Once Docker starts properly, you should see:

```powershell
PS> docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

PS> docker version
Client:
 Version:           28.5.1
 ...
Server:
 Engine:
  Version:          28.5.1
  ...
```

## Next Steps After Docker Works

Once Docker is running:

```powershell
# Build and push
.\build-and-push-docker.ps1

# Or manually:
cd backend
docker build -t collabcanvas-backend:latest .
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 971422717446.dkr.ecr.us-east-2.amazonaws.com
docker tag collabcanvas-backend:latest 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
docker push 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest
```

## Current Workaround

Since Docker Desktop is having issues, the **recommended approach** is:

1. **Try restarting Docker Desktop** (Solution 2)
2. **Wait 1-2 minutes** for full initialization
3. **Test with `docker ps`**
4. If still failing, **use WSL** (Alternative solution above)

The deployment can continue once the Docker image is in ECR.

