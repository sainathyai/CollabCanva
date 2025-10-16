# Redis Caching Strategy with DynamoDB

**Architecture**: Redis (Cache + Real-Time) + DynamoDB (Persistence)  
**Goal**: Sub-5ms latency + 100% data durability  
**Timeline**: 1-2 weeks  
**Cost**: ~$24/month for Redis

---

## 🎯 Why Redis + DynamoDB Together?

### Redis (In-Memory Cache):
- Extremely fast: under 5ms response time
- Real-time pub/sub for instant notifications
- Atomic operations for consistency
- Session storage for active connections
- Presence tracking (who's online now)

### DynamoDB (Persistent Storage):
- 100% durable (survives crashes)
- Unlimited storage capacity
- Point-in-time recovery for backups
- Long-term data retention

### The Perfect Combination:
**Read Path**: Check Redis first → If not found, load from DynamoDB → Store in Redis for next time  
**Write Path**: Write to Redis immediately → Background save to DynamoDB every 5 seconds

**Result**: Speed of Redis + Reliability of DynamoDB

---

## 🏗️ Architecture Overview

```
Users → WebSocket Connections → Load Balancer
  ↓
Multiple Backend Containers (ECS Tasks)
  ↓
  ├→ Redis (Fast Cache + Pub/Sub)
  └→ DynamoDB (Persistent Storage)
```

**How They Work Together:**
- Redis holds "hot" data (currently active projects)
- DynamoDB holds "cold" data (all projects, even inactive)
- Backend containers communicate via Redis Pub/Sub
- Auto-save worker syncs Redis to DynamoDB every 5 seconds

---

## 📊 Redis Data Organization

### Active Project Objects
**Storage**: Hash map per project  
**Contains**: All canvas objects for active projects  
**Expiration**: 1 hour after last activity  
**Purpose**: Instant access to object properties

### Active Users List
**Storage**: Set per project  
**Contains**: User IDs of people currently viewing  
**Updates**: Add on join, remove on disconnect  
**Purpose**: Show who's collaborating right now

### User Presence Data
**Storage**: Hash per user per project  
**Contains**: Cursor position, color, name, timestamp  
**Expiration**: 30 seconds (auto-refresh)  
**Purpose**: Show live cursor positions

### WebSocket Sessions
**Storage**: Hash per connection  
**Contains**: User ID, project ID, connection time  
**Expiration**: 24 hours  
**Purpose**: Reconnection and session management

### Dirty Project Flags
**Storage**: Simple key-value  
**Contains**: Timestamp of last modification  
**Expiration**: 5 minutes  
**Purpose**: Track which projects need saving to DynamoDB

### Pub/Sub Channels
**Storage**: Redis messaging system  
**Contains**: Real-time event streams per project  
**Purpose**: Broadcast changes to all containers and users

---

## 🔄 How Data Flows

### When User Creates Object:

**Step 1**: Backend receives WebSocket message  
**Step 2**: Save object to Redis (1-2ms)  
**Step 3**: Mark project as "dirty" (needs saving)  
**Step 4**: Publish event to Redis channel  
**Step 5**: All backend containers receive event  
**Step 6**: Broadcast to relevant WebSocket clients  
**Step 7**: Background worker saves to DynamoDB (5 seconds later)

**User Experience**: Instant response (no waiting for database)

### When User Loads Project:

**Step 1**: Check Redis for cached objects  
**Step 2**: If found: Return immediately (1-2ms)  
**Step 3**: If not found: Load from DynamoDB (10-15ms)  
**Step 4**: Store in Redis for next time  
**Step 5**: Send objects to user  
**Step 6**: Subscribe to Redis channel for updates

**Cache Hit**: 5x faster than database  
**Cache Miss**: Automatically warms cache

### Auto-Save Background Process:

**Every 5 Seconds:**
- Check Redis for dirty project flags
- For each dirty project, get all objects from Redis
- Batch write to DynamoDB
- Clear dirty flag
- Log success or any errors

**Benefits**: No performance impact on users, guaranteed persistence

---

## 🔧 AWS ElastiCache Setup

### What is ElastiCache?
AWS managed Redis service that handles:
- Automatic backups
- Automatic failover (if primary fails)
- Multi-availability zone replication
- Encryption in transit and at rest
- Monitoring and alerts

### Recommended Configuration:

**Node Type**: cache.t4g.small  
**RAM**: 1.5 GB  
**Monthly Cost**: $24  
**Replicas**: 1 (for failover)  
**Multi-AZ**: Enabled (high availability)

**Why This Size?**
- Holds 100-200 active projects comfortably
- Supports 1000+ concurrent users
- Leaves room for growth
- Can upgrade easily if needed

### Alternative: Upstash (Serverless Redis)

**Good For**: Low traffic or unpredictable usage  
**Pricing**: Pay per request (like DynamoDB)  
**Free Tier**: 10K requests/day  
**Pro**: $0.20 per 100K requests

**When to Use**: Development, low-traffic apps  
**When Not to Use**: High traffic (ElastiCache cheaper)

---

## 💰 Cost Comparison

### ElastiCache Redis:

| Node Size | RAM | Monthly Cost | Good For |
|-----------|-----|--------------|----------|
| t4g.micro | 0.5 GB | $12 | Testing, small apps |
| t4g.small | 1.5 GB | **$24** | **Production (recommended)** |
| t4g.medium | 3.1 GB | $48 | High traffic |
| m6g.large | 6.4 GB | $96 | Very high traffic |

**Recommendation**: Start with t4g.small, upgrade if needed

### Upstash Serverless:

**For 1000 Users:**
- Object saves: 3M/month
- Object reads: 15M/month
- Presence updates: 30M/month
- **Total**: 50M requests = $100/month

**Verdict**: ElastiCache cheaper for consistent traffic!

---

## 📈 Performance Benefits

| Operation | DynamoDB | Redis | Improvement |
|-----------|----------|-------|-------------|
| Read single object | 10-15ms | 1-2ms | **7x faster** |
| Write single object | 10-15ms | 1-2ms | **7x faster** |
| Get 100 objects | 100-150ms | 5-8ms | **18x faster** |
| Update presence | N/A | 1ms | **Instant** |
| Broadcast to users | N/A | 1-2ms | **Real-time** |

**Overall Result**: 5-10x better performance for active users!

---

## 🎯 Caching Patterns Explained

### Pattern 1: Write-Through Cache
**What it means**: Write to cache immediately, save to database later  
**Advantage**: Users see changes instantly (1-2ms)  
**Safety**: Background process ensures data persists  
**Use case**: All object creates and updates

### Pattern 2: Cache-Aside (Lazy Loading)
**What it means**: Check cache first, load from database on miss  
**Advantage**: Only cache what's actually used  
**Safety**: Database is source of truth  
**Use case**: Loading projects

### Pattern 3: Pub/Sub Broadcasting
**What it means**: Publish events to channels, subscribers receive them  
**Advantage**: Real-time across multiple servers  
**Safety**: Fire-and-forget (doesn't block operations)  
**Use case**: Collaboration events

---

## 🔐 Security Best Practices

### Network Isolation:
- Redis in private subnet (not internet-accessible)
- Only backend containers can connect
- Use AWS security groups for firewall rules
- VPN required for manual access

### Encryption:
- **In-Transit**: TLS encryption for all connections
- **At-Rest**: AWS KMS encryption for backup snapshots
- **Passwords**: Store in AWS Secrets Manager
- **No Plain Text**: Never log sensitive data

### Access Control:
- Use IAM roles (not API keys)
- Separate Redis for different environments (dev, prod)
- Rotate passwords regularly
- Monitor for unusual access patterns

---

## 🧪 Testing Strategy

### Local Development:
Run Redis locally using Docker:
- Same behavior as production
- No AWS costs during development
- Easy reset for testing
- Fast iteration cycles

### Load Testing:
Test with simulated traffic:
- 1000 concurrent users
- Object create/update/delete operations
- Measure latency under load
- Verify auto-scaling works
- Check memory usage patterns

### Failure Testing:
Test resilience:
- What happens if Redis crashes?
- Can system recover from DynamoDB?
- Do users experience downtime?
- Is data safe during failures?

**Expected Results:**
- Cache miss = Slower but still works
- Cache failure = Fall back to DynamoDB
- Data always safe in DynamoDB
- Users experience brief slowdown, not crash

---

## 📊 Monitoring & Alerts

### Key Metrics to Watch:

**Cache Performance:**
- Hit rate: Target over 95%
- Miss rate: Should be under 5%
- Eviction rate: Should be zero

**Memory Usage:**
- Current usage vs. maximum
- Alert if over 80%
- Track growth trends

**Connection Health:**
- Active connections count
- Connection errors
- Timeout errors

**Command Latency:**
- Average response time
- 95th percentile (P95)
- 99th percentile (P99)
- Target: P95 under 5ms

### Set Up CloudWatch Alarms For:
- Memory usage over 80%
- Hit rate below 90%
- Command latency over 10ms
- Connection failures
- Evictions occurring

---

## ✅ Implementation Checklist

### Week 1: Redis Setup
- [ ] Provision ElastiCache cluster in AWS
- [ ] Configure security groups for access
- [ ] Test connection from local development
- [ ] Install Redis client library in backend
- [ ] Create Redis service module
- [ ] Write unit tests for cache operations

### Week 2: Integration
- [ ] Migrate object storage to Redis
- [ ] Implement Pub/Sub for broadcasting
- [ ] Add presence tracking system
- [ ] Create auto-save worker process
- [ ] Implement cache warming on project load
- [ ] Test with multiple backend containers

### Week 3: Optimization & Monitoring
- [ ] Set appropriate TTL (time-to-live) policies
- [ ] Implement cache eviction strategy
- [ ] Add CloudWatch monitoring
- [ ] Set up alerting rules
- [ ] Run load tests
- [ ] Document everything

---

## 🎯 Success Criteria

### Performance Goals:
- Object operations under 5ms (95% of requests)
- Cache hit rate over 95%
- Zero evictions during normal operation
- Pub/Sub latency under 2ms
- Support 1000+ concurrent users

### Reliability Goals:
- Auto-recovery from Redis failures
- No data loss during Redis downtime
- Graceful degradation to DynamoDB
- Successful auto-save every 5 seconds
- Zero missed WebSocket broadcasts

### Cost Goals:
- Under $30/month for Redis
- No unexpected cost spikes
- Efficient memory usage
- Predictable scaling costs

---

## 🎓 Key Decisions Explained

**Why Redis Instead of Memcached?**
- Redis has Pub/Sub (Memcached doesn't)
- Redis has richer data types (hashes, sets, sorted sets)
- Redis has better persistence options
- Redis has atomic operations

**Why 5-Second Auto-Save?**
- Balance between cost and data safety
- Users don't notice the delay
- Reduces DynamoDB write costs
- Allows batching for efficiency

**Why Cache Objects in Hash Maps?**
- Faster than storing each object separately
- Easier to get all objects at once
- More efficient memory usage
- Simpler to manage

**Why Use Separate Pub/Sub Connection?**
- Redis requirement for pub/sub
- Prevents blocking regular operations
- Better connection management
- Cleaner error handling

---

## 📚 Additional Benefits

Beyond speed and reliability, Redis provides:

**Session Management**: Track active WebSocket connections  
**Rate Limiting**: Prevent abuse with counters  
**Leaderboards**: Sort users by activity (future)  
**Temporary Storage**: Draft states, undo history  
**Analytics**: Real-time usage statistics

---

**With Redis caching, CollabCanvas becomes lightning-fast! ⚡**

**Final Architecture**: Users experience sub-5ms latency while data remains 100% safe in DynamoDB.

