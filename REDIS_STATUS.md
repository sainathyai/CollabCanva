# Redis Setup - Current Status

## ✅ What's Done
- Redis cluster `collabcanvas-redis` is being created
- Security group configured (port 6379 open)
- Subnet group created across 6 availability zones
- Using: cache.t3.micro, Redis 7.0

## ⏳ What's Happening Now
Redis cluster is still spinning up (usually takes 5-10 minutes)

## 🔍 Check Status
```bash
/usr/local/Cellar/awscli/2.31.15/bin/aws elasticache describe-cache-clusters \
  --cache-cluster-id collabcanvas-redis \
  --show-cache-node-info \
  --query "CacheClusters[0].[CacheClusterStatus,CacheNodes[0].Endpoint.Address,CacheNodes[0].Endpoint.Port]" \
  --output text
```

When status shows `available`, you'll get the endpoint.

## 📋 Next Steps (Once Available)
1. Get the Redis URL from above command
2. Update ECS Task Definition with `REDIS_URL=redis://[endpoint]:6379`
3. Force new ECS deployment
4. Enable ALB sticky sessions (see `ALB_STICKINESS_COMMANDS.txt`)
5. Test - refresh should now show consistent objects!

## 📁 Code Changes Already Done
- `backend/src/db/redis.ts` - Redis client
- `backend/src/state/canvasState.ts` - Uses Redis for objects
- `backend/src/state/presenceState.ts` - Uses Redis for presence
- `backend/src/env.ts` - REDIS_URL config
- `backend/src/server.ts` - Initializes Redis on startup
- `backend/package.json` - Added `ioredis` dependency

All code is committed to `pr15-rbac` branch.

