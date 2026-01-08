// Shared debug utility for React components
// Set to true to enable debug logs, false for production
const DEBUG_MODE = false;

// Safe logging function that only logs when DEBUG_MODE is true
export const safeLog = (...messages) => {
  if (DEBUG_MODE) {
    console.log(...messages);
  }
};

// Safe logging with component context
export const createDebugLogger = (componentName) => ({
  log: (...messages) => safeLog(`[${componentName}]`, ...messages),
  info: (...messages) => safeLog(`ℹ️ [${componentName}]`, ...messages),
  warn: (...messages) => safeLog(`⚠️ [${componentName}]`, ...messages),
  error: (...messages) => console.error(`❌ [${componentName}]`, ...messages), // Errors always show
});

// Quick debug functions for common use
export const debugAuth = (...messages) => safeLog('🔐 AUTH:', ...messages);
export const debugAPI = (...messages) => safeLog('🔗 API:', ...messages);
export const debugState = (...messages) => safeLog('📊 STATE:', ...messages);
export const debugLifecycle = (...messages) => safeLog('🔄 LIFE:', ...messages);

// For React Strict Mode - only log once per component instance
const loggedComponents = new Set();

export const logOnce = (componentId, ...messages) => {
  if (DEBUG_MODE && !loggedComponents.has(componentId)) {
    loggedComponents.add(componentId);
    console.log(...messages);
  }
};
