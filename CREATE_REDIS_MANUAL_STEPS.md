# 🔴 Create Redis ElastiCache - Step-by-Step Guide

**Time Required:** 10-15 minutes (mostly waiting for AWS to provision)

---

## 📋 **Step 1: Go to ElastiCache Console**

1. Open AWS Console
2. Search for "ElastiCache" in the top search bar
3. Click **"ElastiCache"**
4. Click **"Get started"** or **"Create"** button

---

## 📋 **Step 2: Configure Redis Cluster**

### **Design Your Own Cache:**
- Select: **"Redis"**
- Cluster mode: **Disabled** (simpler, sufficient for our needs)

### **Cluster Info:**
- **Name:** `collabcanvas-redis`
- **Description:** `Redis cache for CollabCanvas multi-instance state`

### **Location:**
- Multi-AZ: **Disabled** (can enable later for HA)
- Or if you want HA: **Enabled with 1 replica**

### **Cluster Settings:**
- **Engine version:** `7.0` or `7.1` (latest stable)
- **Port:** `6379` (default)
- **Parameter group:** `default.redis7`
- **Node type:** `cache.t3.micro`
  - ✅ Free tier eligible
  - ✅ Good for development
  - ⚠️ For production with heavy load, use `cache.t3.small` or larger

### **Number of Replicas:**
- If you want high availability: **1 replica**
- If testing only: **0 replicas** (saves cost)

---

## 📋 **Step 3: Advanced Settings**

### **Subnet Group:**

**Option A: Use Existing**
- If you have ECS running, select the same subnet group

**Option B: Create New**
- Click "Create new"
- Name: `collabcanvas-subnet-group`
- Description: `Subnet group for CollabCanvas Redis`
- VPC: Select the **same VPC as your ECS cluster**
- Subnets: Select **at least 2 subnets** in different AZs

### **Security:**

**Security Groups:**
1. Click "Create new" or select existing
2. Name: `collabcanvas-redis-sg`
3. **IMPORTANT:** Add inbound rule:
   - Type: **Custom TCP**
   - Port: **6379**
   - Source: **Same security group as your ECS tasks**
     - OR temporarily: `0.0.0.0/0` (change later for security)

**Encryption:**
- Encryption at rest: Optional (Enable for production)
- Encryption in transit: Optional (Enable for production)

### **Backup:**
- Enable automatic backups: Optional (recommended for production)
- Retention period: 1 day (minimum)

### **Maintenance:**
- Maintenance window: "No preference" (or choose your preferred time)

---

## 📋 **Step 4: Review & Create**

1. Review all settings
2. Scroll to bottom
3. Click **"Create"**

⏳ **Wait 5-10 minutes** for cluster to be created

---

## 📋 **Step 5: Get Redis Endpoint**

1. Wait for status to change to **"Available"** (green checkmark)
2. Click on your cluster name: `collabcanvas-redis`
3. Copy the **"Primary Endpoint"** or **"Configuration Endpoint"**
   - Format: `collabcanvas-redis.xxxxx.cache.amazonaws.com:6379`
   - Example: `collabcanvas-redis.abc123.0001.use1.cache.amazonaws.com:6379`

---

## 📋 **Step 6: Update ECS Task Definition**

### **Option A: Via AWS Console**

1. Go to **ECS Console**
2. Click **"Task Definitions"**
3. Find your backend task definition
4. Click **"Create new revision"**
5. Scroll to **"Container Definitions"**
6. Click on your container
7. Scroll to **"Environment Variables"**
8. Add new variable:
   ```
   Key: REDIS_URL
   Value: redis://collabcanvas-redis.xxxxx.cache.amazonaws.com:6379
   ```
   ⚠️ Replace `xxxxx` with your actual endpoint from Step 5
9. Click **"Update"**
10. Scroll to bottom and click **"Create"**

### **Option B: Via AWS CLI** (if you fix Python issue)

```bash
# Get current task definition
aws ecs describe-task-definition --task-definition collabcanvas-backend \
  --query taskDefinition > task-def.json

# Edit task-def.json to add REDIS_URL to environment array

# Register new revision
aws ecs register-task-definition --cli-input-json file://task-def.json
```

---

## 📋 **Step 7: Update ECS Service**

1. Go to **ECS Console**
2. Click **"Clusters"**
3. Click your cluster name
4. Click **"Services"** tab
5. Select your backend service
6. Click **"Update"**
7. **Revision:** Select the **latest** (the one you just created)
8. Click **"Next step"** (repeat until you reach Review)
9. Click **"Update Service"**
10. Check **"Force new deployment"** ✅
11. Click **"Update Service"**

⏳ **Wait 3-5 minutes** for new tasks to start

---

## 📋 **Step 8: Verify Redis Connection**

### **Check ECS Logs:**

1. Go to **ECS Console** → **Clusters** → Your cluster
2. Click **"Tasks"** tab
3. Click on a running task
4. Click **"Logs"** tab
5. Look for:
   ```
   ✅ Redis connected successfully
   ✅ Redis ready
   ```

### **If you see errors:**
- `ECONNREFUSED`: Check security group allows port 6379
- `ETIMEDOUT`: Check subnets are correct
- `getaddrinfo ENOTFOUND`: Check REDIS_URL format

---

## 📋 **Step 9: Enable ALB Sticky Sessions**

See `ALB_STICKINESS_COMMANDS.txt` or follow these console steps:

1. Go to **EC2 Console**
2. Click **"Load Balancers"**
3. Select your backend ALB
4. Click **"Target Groups"** tab
5. Click your target group
6. Click **"Attributes"** tab
7. Click **"Edit"**
8. Enable **"Stickiness"** ✅
9. Stickiness type: **"Load balancer generated cookie"**
10. Duration: **3600 seconds** (1 hour)
11. Click **"Save changes"**

---

## 📋 **Step 10: Test Refresh Consistency**

1. Open your CollabCanvas app
2. Create some objects (e.g., 10 objects)
3. **Refresh the page 10 times**
4. **Object count should be consistent every time** ✅

### **Expected Behavior:**
```
Refresh 1: 10 objects ✅
Refresh 2: 10 objects ✅
Refresh 3: 10 objects ✅
Refresh 4: 10 objects ✅
...all consistent!
```

### **If still inconsistent:**
- Check ECS logs show "✅ Redis connected successfully"
- Check ALB sticky sessions are enabled
- Check all ECS tasks are running the latest code

---

## 💰 **Cost Estimate**

**ElastiCache (cache.t3.micro):**
- $0.017/hour × 730 hours/month = **~$12/month**
- With 1 replica: **~$24/month**

**Free Tier:**
- 750 hours/month of cache.t2.micro or cache.t3.micro
- First 12 months only

---

## 🎯 **Summary Checklist**

- [ ] Created Redis cluster in ElastiCache
- [ ] Cluster status is "Available"
- [ ] Copied Primary Endpoint
- [ ] Updated ECS Task Definition with REDIS_URL
- [ ] Deployed new ECS service revision
- [ ] ECS logs show "✅ Redis connected successfully"
- [ ] Enabled ALB sticky sessions
- [ ] Tested refresh consistency (10+ times)
- [ ] All refreshes show same object count

---

## 🆘 **Need Help?**

**Common Issues:**

1. **Can't connect to Redis:**
   - Security group must allow port 6379
   - Redis and ECS must be in same VPC
   - Check subnet group configuration

2. **Still seeing inconsistent objects:**
   - Verify Redis is actually being used (check logs)
   - Enable ALB sticky sessions
   - Ensure all tasks are running latest code

3. **Performance slow:**
   - Upgrade to cache.t3.small
   - Enable Redis clustering
   - Add read replicas

---

🚀 **Once complete, your backend will be production-ready with shared state across all instances!**

