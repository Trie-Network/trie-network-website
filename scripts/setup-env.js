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
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ENV_TEMPLATE);
  }
  
  if (!fs.existsSync(envProductionPath)) {
    fs.writeFileSync(envProductionPath, ENV_PRODUCTION_TEMPLATE);
  }
  
}

function validateEnvironment() {
  const envNetwork = process.env.VITE_NETWORK;
  
  if (!envNetwork) {
    return false;
  }
  
  const supportedNetworks = ['mainnet', 'testnet', 'devnet'];
  if (!supportedNetworks.includes(envNetwork)) {
    return false;
  }
  
  return true;
}

const command = process.argv[2];

switch (command) {
  case 'create':
    createEnvFile();
    break;
  case 'validate':
    validateEnvironment();
    break;
  default:
    break;
}
