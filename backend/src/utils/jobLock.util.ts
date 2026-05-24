/**
 * Distributed job locking utility
 * Prevents duplicate job execution when multiple server instances are running
 * 
 * Note: This is a simple in-memory implementation suitable for single-instance
 * deployments. For multi-instance production deployments, replace with Redis-based
 * locking using a library like Redlock.
 */

import { logger } from "./logger.util.js";

/**
 * Lock information stored in memory
 */
interface LockInfo {
  timestamp: number;
  timeoutSeconds: number;
  instanceId: string;
}

/**
 * Result of acquiring a lock
 */
export interface LockResult {
  acquired: boolean;
  release: () => Promise<void>;
  lockId: string;
}

// In-memory lock store
// In production with multiple instances, replace with Redis
const activeLocks = new Map<string, LockInfo>();

// Generate unique instance ID for this server
const INSTANCE_ID = `${process.pid}-${Date.now()}`;

/**
 * Generate a unique lock ID
 */
const generateLockId = (lockName: string): string => {
  return `${lockName}:${INSTANCE_ID}:${Date.now()}`;
};

/**
 * Clean up expired locks
 */
const cleanupExpiredLocks = (): void => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [lockName, info] of activeLocks.entries()) {
    const expirationTime = info.timestamp + info.timeoutSeconds * 1000;
    if (now > expirationTime) {
      activeLocks.delete(lockName);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.debug(`Cleaned up ${cleanedCount} expired job locks`);
  }
};

/**
 * Attempt to acquire a lock for a job
 * 
 * @param lockName - Unique name for the job/operation
 * @param timeoutSeconds - How long the lock should be held (prevents indefinite locks)
 * @returns LockResult with acquire status and release function
 * 
 * @example
 * ```typescript
 * const lock = await acquireLock('poll-expiry-job', 300);
 * if (!lock.acquired) {
 *   logger.info('Job already running, skipping');
 *   return;
 * }
 * 
 * try {
 *   // Run your job here
 *   await expirePolls();
 * } finally {
 *   await lock.release();
 * }
 * ```
 */
export const acquireLock = async (
  lockName: string,
  timeoutSeconds: number = 60,
): Promise<LockResult> => {
  // Clean up expired locks before attempting
  cleanupExpiredLocks();

  const now = Date.now();
  const existingLock = activeLocks.get(lockName);

  // Check if there's an active lock
  if (existingLock) {
    const expirationTime = existingLock.timestamp + existingLock.timeoutSeconds * 1000;

    // If lock is still valid
    if (now < expirationTime) {
      logger.debug(`Lock "${lockName}" is already held by ${existingLock.instanceId}`);
      return {
        acquired: false,
        release: async () => {
          // No-op - we didn't acquire the lock
        },
        lockId: "",
      };
    }

    // Lock expired, we can steal it
    logger.warn(
      `Lock "${lockName}" held by ${existingLock.instanceId} expired after ${existingLock.timeoutSeconds}s, stealing`,
    );
  }

  // Acquire the lock
  const lockId = generateLockId(lockName);
  activeLocks.set(lockName, {
    timestamp: now,
    timeoutSeconds,
    instanceId: INSTANCE_ID,
  });

  logger.debug(`Acquired lock "${lockName}" with timeout ${timeoutSeconds}s`);

  return {
    acquired: true,
    lockId,
    release: async () => {
      const currentLock = activeLocks.get(lockName);
      // Only release if we still hold the lock
      if (currentLock?.instanceId === INSTANCE_ID) {
        activeLocks.delete(lockName);
        logger.debug(`Released lock "${lockName}"`);
      } else {
        logger.warn(
          `Attempted to release lock "${lockName}" but it's held by another instance or expired`,
        );
      }
    },
  };
};

/**
 * Check if a lock is currently held (without acquiring)
 * 
 * @param lockName - Name of the lock to check
 * @returns true if the lock is currently held
 */
export const isLockHeld = (lockName: string): boolean => {
  cleanupExpiredLocks();
  return activeLocks.has(lockName);
};

/**
 * Get information about a lock
 * 
 * @param lockName - Name of the lock
 * @returns Lock information or null if not held
 */
export const getLockInfo = (lockName: string): LockInfo | null => {
  cleanupExpiredLocks();
  return activeLocks.get(lockName) || null;
};

/**
 * Force release a lock (use with caution)
 * Only use for administrative/debugging purposes
 * 
 * @param lockName - Name of the lock to release
 * @returns true if a lock was released
 */
export const forceReleaseLock = (lockName: string): boolean => {
  const existed = activeLocks.has(lockName);
  if (existed) {
    activeLocks.delete(lockName);
    logger.warn(`Force released lock "${lockName}"`);
  }
  return existed;
};

/**
 * Get statistics about current locks
 */
export const getLockStats = (): {
  totalLocks: number;
  locks: Array<{ name: string; heldBy: string; remainingSeconds: number }>;
} => {
  cleanupExpiredLocks();
  const now = Date.now();
  const locks: Array<{ name: string; heldBy: string; remainingSeconds: number }> = [];

  for (const [name, info] of activeLocks.entries()) {
    const expirationTime = info.timestamp + info.timeoutSeconds * 1000;
    const remainingSeconds = Math.max(0, Math.ceil((expirationTime - now) / 1000));
    locks.push({
      name,
      heldBy: info.instanceId,
      remainingSeconds,
    });
  }

  return {
    totalLocks: locks.length,
    locks,
  };
};
