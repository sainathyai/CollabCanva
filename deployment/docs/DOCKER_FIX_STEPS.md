# Quick Docker Fix

## The Issue
Docker Desktop's Linux engine isn't starting properly. Error:
```
The system cannot find the file specified: dockerDesktopLinuxEngine
```

## Quick Fix Steps

### Option 1: Restart Docker Desktop (Recommended)
1. **Quit Docker Desktop completely**:
   - Right-click Docker icon in system tray
   - Click "Quit Docker Desktop"
   - Wait 10 seconds

2. **Start Docker Desktop again**:
   - Open Docker Desktop from Start Menu
   - Wait 1-2 minutes for the whale icon to stop animating
   - Look for "Docker Desktop is running" in system tray

3. **Test**:
   ```powershell
   docker ps
   ```
   Should show: `CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES`

4. **Then run**:
   ```powershell
   .\build-and-push-docker.ps1
   ```

---

### Option 2: Use WSL (If Docker Desktop Won't Start)

If Docker Desktop continues to fail, build using WSL instead:

```powershell
# Open WSL
wsl

# Navigate to project (adjust path if needed)
cd "/mnt/c/Users/Borehole Seismic/Documents/Gauntlet AI/CollabCanva"

# Build in backend directory
cd backend
docker build -t collabcanvas-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-2 | \
  docker login --username AWS --password-stdin \
  971422717446.dkr.ecr.us-east-2.amazonaws.com

# Tag image
docker tag collabcanvas-backend:latest \
  971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest

# Push to ECR
docker push 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest

# Exit WSL
exit
```

---

### Option 3: Manual Docker Commands (After Docker Starts)

If the script fails but Docker works:

```powershell
# Test Docker
docker ps

# Navigate to backend
cd backend

# Build
docker build -t collabcanvas-backend:latest .

# Login to ECR
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 971422717446.dkr.ecr.us-east-2.amazonaws.com

# Tag
docker tag collabcanvas-backend:latest 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest

# Push
docker push 971422717446.dkr.ecr.us-east-2.amazonaws.com/collabcanvas-backend:latest

# Return to root
cd ..
```

---

## After Image is Pushed

Once the Docker image is in ECR, continue with:

```powershell
# Step 3: Store secrets
.\setup-ssm-secrets.ps1

# Step 4: Deploy to ECS
.\create-alb-and-service.ps1
```

---

## Verification

After pushing, verify image is in ECR:

```powershell
aws ecr describe-images --repository-name collabcanvas-backend --region us-east-2
```

Should show:
```json
{
    "imageDetails": [{
        "imageTag": ["latest"],
        ...
    }]
}
```

---

## What to Do Right Now

1. **Completely quit Docker Desktop** (system tray → Quit)
2. **Wait 10 seconds**
3. **Restart Docker Desktop**
4. **Wait 1-2 minutes** (watch for whale icon to stop animating)
5. **Test**: `docker ps`
6. **Run**: `.\build-and-push-docker.ps1`

If Docker Desktop still doesn't work after restart, use **Option 2 (WSL)** above.

