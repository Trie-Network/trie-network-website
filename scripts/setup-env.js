#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps configure the correct environment variables for deployment
 */

const fs = require('fs');
const path = require('path');

const ENV_TEMPLATE = `# Network Configuration
# Set to one of: mainnet, testnet, devnet
VITE_NETWORK=devnet

# Optional: Override specific endpoints if needed
# VITE_API_NODE_URL=https://your-custom-node-url.com
# VITE_API_DAPP_URL=https://your-custom-dapp-url.com
`;

const ENV_PRODUCTION_TEMPLATE = `# Production Environment Configuration
VITE_NETWORK=devnet
`;

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envProductionPath = path.join(process.cwd(), '.env.production');
  
  // Create .env file if it doesn't exist
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ENV_TEMPLATE);
    console.log('✅ Created .env file with default configuration');
  } else {
    console.log('ℹ️  .env file already exists');
  }
  
  // Create .env.production file if it doesn't exist
  if (!fs.existsSync(envProductionPath)) {
    fs.writeFileSync(envProductionPath, ENV_PRODUCTION_TEMPLATE);
    console.log('✅ Created .env.production file for production deployment');
  } else {
    console.log('ℹ️  .env.production file already exists');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Update VITE_NETWORK in .env files to match your target network');
  console.log('2. For production deployment, ensure your hosting platform has VITE_NETWORK set');
  console.log('3. Redeploy your application');
}

function validateEnvironment() {
  const envNetwork = process.env.VITE_NETWORK;
  
  if (!envNetwork) {
    console.log('❌ VITE_NETWORK environment variable is not set');
    console.log('   This will cause wallet connection issues in production');
    return false;
  }
  
  const supportedNetworks = ['mainnet', 'testnet', 'devnet'];
  if (!supportedNetworks.includes(envNetwork)) {
    console.log(`❌ Invalid VITE_NETWORK value: ${envNetwork}`);
    console.log(`   Supported values: ${supportedNetworks.join(', ')}`);
    return false;
  }
  
  console.log(`✅ VITE_NETWORK is correctly set to: ${envNetwork}`);
  return true;
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'create':
    createEnvFile();
    break;
  case 'validate':
    validateEnvironment();
    break;
  default:
    console.log('Environment Setup Script');
    console.log('Usage:');
    console.log('  node scripts/setup-env.js create   - Create .env files');
    console.log('  node scripts/setup-env.js validate - Validate current environment');
    break;
}
