# Frontend Caching Usage Guide

## Quick Start

### Using Custom Hooks (Recommended)

The easiest way to use caching is through the custom hooks:

```typescript
import { useClasses, useStudents, useSubjects } from '@/lib/hooks';

function MyComponent() {
  // Automatically cached, deduplicated, and handles loading/error states
  const { data: classes, loading, error, refresh } = useClasses();
  const { data: students } = useStudents();
  const { data: subjects } = useSubjects();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Classes: {classes?.length}</h1>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### Using Cached API Wrapper

When creating, updating, or deleting data:

```typescript
import { cachedStudentApi, cachedClassApi } from '@/lib/cachedApi';

async function createStudent(data) {
  try {
    // Automatically invalidates cache after creation
    const result = await cachedStudentApi.create(data);
    console.log('Student created:', result);
    // No need to manually refresh - cache is invalidated
  } catch (error) {
    console.error('Failed to create student:', error);
  }
}

async function updateStudent(id, data) {
  // Automatically invalidates cache after update
  await cachedStudentApi.update(id, data);
}

async function deleteStudent(id) {
  // Automatically invalidates cache after deletion
  await cachedStudentApi.delete(id);
}
```

## Complete Example: Student Management Page

```typescript
'use client';

import { useState } from 'react';
import { useStudents, useClasses } from '@/lib/hooks';
import { cachedStudentApi } from '@/lib/cachedApi';

export default function StudentsPage() {
  const { data: students, loading, error, refresh } = useStudents();
  const { data: classes } = useClasses();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStudent = async (formData) => {
    setIsCreating(true);
    try {
      await cachedStudentApi.create(formData);
      // Cache automatically invalidated
      // Component will re-fetch fresh data
      alert('Student created successfully!');
    } catch (error) {
      alert('Failed to create student');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await cachedStudentApi.delete(id);
      // Cache automatically invalidated
      alert('Student deleted successfully!');
    } catch (error) {
      alert('Failed to delete student');
    }
  };

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Students ({students?.length})</h1>
      <button onClick={refresh}>Refresh</button>
      
      <ul>
        {students?.map(student => (
          <li key={student.id}>
            {student.name} - {student.gr_number}
            <button onClick={() => handleDeleteStudent(student.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => setIsCreating(true)} disabled={isCreating}>
        Add New Student
      </button>
    </div>
  );
}
```

## Benefits

### 1. No Duplicate API Calls
Before:
```
Component A requests /students -> API call
Component B requests /students -> API call (duplicate!)
```

After:
```
Component A requests /students -> API call
Component B requests /students -> Returns cached data (instant!)
```

### 2. Request Deduplication
Before:
```
User clicks button twice quickly -> 2 API calls
```

After:
```
User clicks button twice quickly -> 1 API call (second returns same promise)
```

### 3. Automatic Cache Invalidation
Before:
```
Create student -> manually call refresh() in every component
```

After:
```
Create student -> all components automatically get fresh data
```

## Advanced Usage

### Manual Cache Invalidation

If you need to manually invalidate cache:

```typescript
import { 
  invalidateStudentCache, 
  invalidateClassCache,
  invalidateSubjectCache 
} from '@/lib/hooks';

// Invalidate all student caches
invalidateStudentCache();

// Invalidate all class caches
invalidateClassCache();

// Invalidate all subject caches
invalidateSubjectCache();
```

### Custom Cache TTL

Modify TTL in `lib/hooks.ts`:

```typescript
const result = await requestCache.execute(
  '/students',
  () => studentApi.getAll(classId).then((res) => res.data),
  { class_id: classId },
  5 * 60 * 1000 // Change to 5 minutes
);
```

### Using Direct Request Cache

For custom endpoints:

```typescript
import { requestCache } from '@/lib/requestCache';

async function fetchCustomData() {
  const data = await requestCache.execute(
    '/custom-endpoint',
    async () => {
      const response = await fetch('/api/custom-endpoint');
      return response.json();
    },
    { param1: 'value' }, // Optional params
    2 * 60 * 1000 // 2 minute TTL
  );
  
  return data;
}
```

## Migration Guide

### Old Code (Without Caching)

```typescript
function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getAll()
      .then(res => setStudents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return <div>{/* render students */}</div>;
}
```

### New Code (With Caching)

```typescript
function StudentList() {
  const { data: students, loading } = useStudents();

  return <div>{/* render students */}</div>;
}
```

## Troubleshooting

### Issue: Stale data after update

**Solution**: Make sure you're using `cachedStudentApi` instead of direct `studentApi`:

```typescript
// ❌ Wrong - doesn't invalidate cache
await studentApi.update(id, data);

// ✅ Correct - invalidates cache automatically
await cachedStudentApi.update(id, data);
```

### Issue: Too many API calls in development

**Cause**: React Strict Mode causes double renders in development.

**Solution**: This is normal and only happens in development. Production will only make one call.

### Issue: Need to force refresh

**Solution**: Use the `refresh()` function from hooks:

```typescript
const { data, refresh } = useStudents();

// Force refresh
await refresh();
```

## Performance Tips

1. **Use specific hooks**: `useStudents(classId)` instead of filtering in component
2. **Let cache work**: Don't call `refresh()` unnecessarily
3. **Batch operations**: Use batch endpoints when creating multiple records
4. **Monitor cache**: Check browser console for cache hit/miss

## Cache Statistics

Get cache statistics for debugging:

```typescript
import { requestCache } from '@/lib/requestCache';

console.log(requestCache.getStats());
// Output: { cacheSize: 15, pendingRequests: 2 }
```
