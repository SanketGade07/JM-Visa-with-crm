// Environment variables with fallback values
const env = {
  // Sanity CMS
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gdey5o8v',
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-13',

  // Email Configuration
  NEXT_PUBLIC_EMAIL_USER: process.env.NEXT_PUBLIC_EMAIL_USER || 'info@jmvisaservices.com',
  NEXT_PUBLIC_EMAIL_APP_PASS: process.env.NEXT_PUBLIC_EMAIL_APP_PASS || 'gdwv vyog pcjn fhpo',
  NEXT_PUBLIC_EMAIL_RECEIVER: process.env.NEXT_PUBLIC_EMAIL_RECEIVER || 'info@jmvisaservices.com',

  // Google reCAPTCHA
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',

  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Helper function to get environment variables with fallback
export const getEnv = (key) => {
  if (!(key in env)) {
    console.warn(`Environment variable ${key} is not defined in config`);
    return process.env[key];
  }
  return env[key];
};

// Export all environment variables
export default env; 