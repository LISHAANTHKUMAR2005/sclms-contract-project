// Logger utility for controlled logging
// Set to false for production to disable debug logs
const DEBUG_MODE = process.env.NODE_ENV === 'development';

class Logger {
  constructor(context) {
    this.context = context;
  }

  // Info logs - only show in development
  info(message, ...args) {
    if (DEBUG_MODE) {
      console.log(`ℹ️ ${this.context}: ${message}`, ...args);
    }
  }

  // Warning logs - always show
  warn(message, ...args) {
    console.warn(`⚠️ ${this.context}: ${message}`, ...args);
  }

  // Error logs - always show with red color
  error(message, ...args) {
    console.error(`❌ ${this.context}: ${message}`, ...args);
  }

  // Critical errors - always show
  critical(message, ...args) {
    console.error(`🚨 ${this.context}: ${message}`, ...args);
  }

  // Auth-related logs - only show in development
  auth(message, ...args) {
    if (DEBUG_MODE) {
      console.log(`🔐 ${this.context}: ${message}`, ...args);
    }
  }

  // API-related logs - errors always, info only in development
  api(message, ...args) {
    if (DEBUG_MODE) {
      console.log(`🔗 ${this.context}: ${message}`, ...args);
    }
  }

  apiError(message, ...args) {
    console.error(`🔗 ${this.context}: ${message}`, ...args);
  }
}

// Export a factory function to create context-specific loggers
export const createLogger = (context) => new Logger(context);

// Export default logger for general use
export default new Logger('App');
