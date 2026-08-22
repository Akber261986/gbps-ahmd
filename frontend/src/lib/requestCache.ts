/**
 * Request Cache and Deduplication System
 *
 * Prevents duplicate API calls and caches responses in memory.
 * Handles multiple simultaneous requests for the same resource.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private defaultTTL: number = 3 * 60 * 1000; // 3 minutes default

  /**
   * Generate a cache key from URL and parameters
   */
  private getCacheKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get cached data if available and valid
   */
  get<T>(url: string, params?: Record<string, any>): T | null {
    const key = this.getCacheKey(url, params);
    const entry = this.cache.get(key);

    if (entry && this.isValid(entry)) {
      return entry.data as T;
    }

    // Clean up expired entry
    if (entry) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(url: string, data: T, params?: Record<string, any>, ttl?: number): void {
    const key = this.getCacheKey(url, params);
    const cacheTTL = ttl || this.defaultTTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTTL,
    });
  }

  /**
   * Execute a request with deduplication
   * If the same request is already in flight, return the existing promise
   */
  async execute<T>(
    url: string,
    fetcher: () => Promise<T>,
    params?: Record<string, any>,
    ttl?: number
  ): Promise<T> {
    const key = this.getCacheKey(url, params);

    // Check cache first
    const cached = this.get<T>(url, params);
    if (cached !== null) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      // Return the existing promise
      return pending.promise;
    }

    // Execute new request
    const promise = fetcher()
      .then((data) => {
        // Cache the result
        this.set(url, data, params, ttl);
        return data;
      })
      .finally(() => {
        // Clean up pending request
        this.pendingRequests.delete(key);
      });

    // Store pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

// Export utility function for cache invalidation
export function invalidateCache(pattern: string) {
  requestCache.invalidate(pattern);
}
