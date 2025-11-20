/**
 * Production-safe logger utility
 * Automatically disables console logs in production builds
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        // Always log errors, even in production
        console.error(...args);
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
    }
};
