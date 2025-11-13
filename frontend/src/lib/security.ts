// Security utilities for the Quad application

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and sanitize URLs to prevent malicious redirects
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    // Only allow HTTP and HTTPS protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

/**
 * Generate a secure random string for CSP nonces
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * Validate file types for uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

/**
 * Rate limiting helper (client-side basic implementation)
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private maxAttempts: number
  private windowMs: number
  
  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the time window
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    // Add current attempt
    validAttempts.push(now)
    this.attempts.set(key, validAttempts)
    
    return true
  }
  
  reset(key: string): void {
    this.attempts.delete(key)
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://clerk.com", "https://*.clerk.accounts.dev"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://api.clerk.com", "wss://"],
  fontSrc: ["'self'", "https:", "data:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["https://clerk.com", "https://*.clerk.accounts.dev"],
} as const

/**
 * Secure local storage wrapper
 */
export class SecureStorage {
  private static readonly PREFIX = 'quad_secure_'
  
  static setItem(key: string, value: string, encrypt = false): void {
    const finalKey = this.PREFIX + key
    let finalValue = value
    
    if (encrypt) {
      // In a real app, you'd use proper encryption here
      finalValue = btoa(value)
    }
    
    try {
      localStorage.setItem(finalKey, finalValue)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }
  
  static getItem(key: string, decrypt = false): string | null {
    const finalKey = this.PREFIX + key
    
    try {
      const value = localStorage.getItem(finalKey)
      if (!value) return null
      
      if (decrypt) {
        return atob(value)
      }
      
      return value
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return null
    }
  }
  
  static removeItem(key: string): void {
    const finalKey = this.PREFIX + key
    localStorage.removeItem(finalKey)
  }
  
  static clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * Permission checking utilities
 */
export const Permission = {
  CREATE_POST: 'create:post',
  EDIT_POST: 'edit:post',
  DELETE_POST: 'delete:post',
  MODERATE_CONTENT: 'moderate:content',
  ADMIN_ACCESS: 'admin:access',
} as const

export type PermissionType = typeof Permission[keyof typeof Permission]

export function hasPermission(userPermissions: string[], required: PermissionType): boolean {
  return userPermissions.includes(required)
}

export function hasAnyPermission(userPermissions: string[], required: PermissionType[]): boolean {
  return required.some(permission => userPermissions.includes(permission))
}

export function hasAllPermissions(userPermissions: string[], required: PermissionType[]): boolean {
  return required.every(permission => userPermissions.includes(permission))
}
