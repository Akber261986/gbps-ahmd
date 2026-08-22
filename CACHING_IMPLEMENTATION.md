# Caching Implementation

## Overview

This document describes the caching system implemented to reduce database queries and improve application performance.

## Backend Caching

### Implementation Details

**File**: `backend/cache.py`

A thread-safe in-memory cache with TTL (Time To Live) support:

- **User Cache**: Stores authenticated user data for 5 minutes
- **School Cache**: Stores school data for 10 minutes

### How It Works

1. **Authentication Flow**:
   - When a user makes an authenticated request, the system first checks the cache
   - If data exists and hasn't expired, it returns cached data (no database query)
   - If cache miss, queries database and stores result in cache
   - Subsequent requests within the TTL window use cached data

2. **Cache Invalidation**:
   - Cache is automatically invalidated when data changes:
     - User profile updates
     - User profile image changes
     - School information updates
     - School logo uploads
     - User-school association changes

### Performance Impact

**Before**: Every authenticated request = 1 database query
**After**: First request = 1 database query, next ~N requests within 5 minutes = 0 database queries

For a user making 100 requests in 5 minutes:
- Before: 100 database queries
- After: 1-2 database queries (depending on cache expiration timing)

## Frontend Caching

### Implementation Details

**Files**:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/contexts/SchoolContext.tsx`

### How It Works

1. **User Data Caching**:
   - Stored in `localStorage` with timestamp
   - TTL: 5 minutes
   - On login: Fresh data fetched and cached
   - On page load: Uses cached data if fresh, otherwise refreshes
   - On logout: Cache cleared

2. **School Data Caching**:
   - Stored in `localStorage` with timestamp
   - TTL: 10 minutes
   - On authentication: Checks cache first
   - Only fetches from server if cache is stale
   - Manual refresh available via `refreshSchool()` function

### Benefits

1. **Faster Initial Load**: App loads instantly from cached data
2. **Reduced Server Load**: Fewer API calls to backend
3. **Offline Resilience**: App continues to work with cached data if network is temporarily unavailable
4. **Better UX**: No loading spinners for cached data

## Cache Keys

### Backend
- User: `user:{user_id}`
- School: `school:{school_id}`

### Frontend (localStorage)
- User data: `user_data`
- User timestamp: `user_data_timestamp`
- School data: `school_data`
- School timestamp: `school_data_timestamp`

## Cache Invalidation Points

### Backend
- `/auth/profile` (PUT) - User profile update
- `/auth/upload-profile-image` (POST) - Profile image change
- `/schools/onboard` (POST) - New school creation
- `/schools/my-school` (PUT) - School update
- `/schools/upload-logo` (POST) - School logo update

### Frontend
- Login/Google Login - Fresh fetch and cache
- Logout - Clear all caches
- Manual refresh - Force fetch from server

## Testing the Implementation

### Backend Cache Test
```python
# First request - cache miss (database query)
GET /auth/me
# Response time: ~50ms

# Second request within 5 minutes - cache hit (no database query)
GET /auth/me
# Response time: ~5ms
```

### Frontend Cache Test
```javascript
// 1. Login and refresh page immediately
// Expected: Loads instantly from localStorage cache

// 2. Wait 6 minutes and refresh page
// Expected: Fetches fresh data from server

// 3. Update profile
// Expected: Fresh data fetched and cached
```

## Monitoring

To verify caching is working:

1. **Backend**: Add logging to `cache.py`:
   ```python
   print(f"Cache HIT: {key}") # when cache returns data
   print(f"Cache MISS: {key}") # when database query needed
   ```

2. **Frontend**: Check browser DevTools:
   - Network tab: Should see fewer API calls after initial load
   - Application tab > Local Storage: Should see cached data

## Configuration

### Adjust Cache TTL

**Backend** (`backend/cache.py`):
```python
user_cache = SimpleCache(default_ttl_seconds=300)  # Change 300 to desired seconds
school_cache = SimpleCache(default_ttl_seconds=600)  # Change 600 to desired seconds
```

**Frontend** (`frontend/src/contexts/AuthContext.tsx`):
```typescript
const fiveMinutes = 5 * 60 * 1000; // Change 5 to desired minutes
```

**Frontend** (`frontend/src/contexts/SchoolContext.tsx`):
```typescript
const tenMinutes = 10 * 60 * 1000; // Change 10 to desired minutes
```

## Best Practices

1. **Cache Invalidation**: Always invalidate cache when updating data
2. **TTL Selection**: Balance between performance and data freshness
3. **Error Handling**: Cached data is preserved on network errors (offline resilience)
4. **Security**: Never cache sensitive data like passwords or tokens beyond session

## Future Enhancements

1. **Redis Integration**: Replace in-memory cache with Redis for:
   - Persistence across server restarts
   - Shared cache in multi-server deployments
   - Advanced cache patterns (LRU, LFU)

2. **Cache Preloading**: Preload frequently accessed data on login

3. **Selective Caching**: Add cache control headers for fine-grained control

4. **Cache Metrics**: Add monitoring to track hit/miss ratios
