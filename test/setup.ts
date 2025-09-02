// Global test setup
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set default test timeout
jest.setTimeout(30000);