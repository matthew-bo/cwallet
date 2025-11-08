/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables are set
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  'GOOGLE_KMS_PROJECT',
  'GOOGLE_KMS_KEYRING',
  'GOOGLE_KMS_KEY',
  'INFURA_PROJECT_ID',
  'APP_ENCRYPTION_KEY'
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
}

/**
 * Validate environment variables
 * 
 * @returns Validation result with list of missing variables
 */
export function validateEnvironment(): ValidationResult {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Environment validation failed!');
    console.error('Missing required variables:', missing);
    return { valid: false, missing };
  }
  
  // Validate APP_ENCRYPTION_KEY length
  if (process.env.APP_ENCRYPTION_KEY?.length !== 64) {
    console.error('❌ APP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    return { 
      valid: false, 
      missing: ['APP_ENCRYPTION_KEY (invalid length)'] 
    };
  }
  
  console.log('✅ Environment validation passed');
  return { valid: true, missing: [] };
}

// If run directly
if (require.main === module) {
  const result = validateEnvironment();
  if (!result.valid) {
    console.error('\nPlease set all required environment variables.');
    console.error('See .env.example for required variables and generation instructions.');
    process.exit(1);
  }
}

