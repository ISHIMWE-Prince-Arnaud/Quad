/**
 * Centralized logging utility for the Quad application
 * Provides different log levels and production-safe logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: any): void {
    if (this.level <= LogLevel.DEBUG && !this.isProduction) {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log info messages 
   */
  info(message: string, data?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(`ℹ️  [INFO] ${message}`, data || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`⚠️  [WARN] ${message}`, data || '');
    }
  }

  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: any): void {
    console.error(`❌ [ERROR] ${message}`, error || '');
  }

  /**
   * Log successful operations (production safe)
   */
  success(message: string, data?: any): void {
    if (!this.isProduction) {
      console.log(`✅ [SUCCESS] ${message}`, data || '');
    }
  }

  /**
   * Log server startup messages
   */
  server(message: string): void {
    console.log(`🚀 [SERVER] ${message}`);
  }

  /**
   * Log database operations
   */
  database(message: string, data?: any): void {
    if (!this.isProduction) {
      console.log(`🗄️  [DB] ${message}`, data || '');
    }
  }

  /**
   * Log socket events (development only)
   */
  socket(message: string, data?: any): void {
    if (!this.isProduction) {
      console.log(`🔌 [SOCKET] ${message}`, data || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
