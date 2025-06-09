const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// For API/server side
export const serverLogger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    // Errors should always be logged, even in production for server monitoring
    console.error(...args);
  },

  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args);
    }
  },
};
