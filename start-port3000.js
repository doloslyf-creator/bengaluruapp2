#!/usr/bin/env node

// Set PORT environment variable to 3000 and start the server
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';

// Import and run the server
import('./server/index.ts');