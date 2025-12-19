#!/usr/bin/env node

/**
 * Setup script for Pebble MCP Server
 * 
 * This script helps configure the Pebble MCP server for Cursor IDE.
 * It copies the template config from .cursor-config/ to .cursor/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TEMPLATE_MCP_CONFIG = path.join(projectRoot, '.cursor-config', 'mcp.json');
const WORKSPACE_MCP_CONFIG = path.join(projectRoot, '.cursor', 'mcp.json');
const USER_MCP_CONFIG = path.join(os.homedir(), '.cursor', 'mcp.json');

const PEBBLE_MCP_CONFIG = {
  "Pebble": {
    "command": "npx",
    "args": ["@rippling/pebble-mcp"]
  }
};

function readJsonFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error reading ${filepath}:`, e.message);
  }
  return null;
}

function writeJsonFile(filepath, data) {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
}

function setup() {
  console.log('\n🪨 Setting up Pebble MCP...\n');
  
  // Check if workspace config already exists
  if (fs.existsSync(WORKSPACE_MCP_CONFIG)) {
    const existing = readJsonFile(WORKSPACE_MCP_CONFIG);
    if (existing?.mcpServers?.Pebble) {
      console.log('✅ Pebble MCP already configured in .cursor/mcp.json');
      return;
    }
  }
  
  // Copy template to .cursor/
  if (fs.existsSync(TEMPLATE_MCP_CONFIG)) {
    const template = readJsonFile(TEMPLATE_MCP_CONFIG);
    
    // Merge with existing config if present
    let config = readJsonFile(WORKSPACE_MCP_CONFIG) || { mcpServers: {} };
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    config.mcpServers.Pebble = template.mcpServers.Pebble;
    
    writeJsonFile(WORKSPACE_MCP_CONFIG, config);
    console.log('✅ Created .cursor/mcp.json with Pebble MCP');
    console.log('   Restart Cursor to activate the MCP server\n');
  } else {
    console.log('❌ Template config not found at .cursor-config/mcp.json');
    console.log('   Creating default config...\n');
    
    writeJsonFile(WORKSPACE_MCP_CONFIG, { mcpServers: PEBBLE_MCP_CONFIG });
    console.log('✅ Created .cursor/mcp.json with Pebble MCP');
  }
}

function checkMcpStatus() {
  console.log('\n🔍 Checking MCP Configuration...\n');
  
  // Check workspace config
  const workspaceConfig = readJsonFile(WORKSPACE_MCP_CONFIG);
  if (workspaceConfig?.mcpServers?.Pebble) {
    console.log('✅ Workspace MCP config found (.cursor/mcp.json)');
    console.log('   Pebble MCP is configured for this project\n');
  } else {
    console.log('❌ Workspace MCP config missing or incomplete');
    console.log('   Run: yarn mcp:setup\n');
  }
  
  // Check user config
  const userConfig = readJsonFile(USER_MCP_CONFIG);
  if (userConfig?.mcpServers?.Pebble) {
    console.log('✅ User MCP config has Pebble (~/.cursor/mcp.json)');
  } else {
    console.log('ℹ️  User MCP config does not have Pebble configured');
    console.log('   (This is fine - workspace config takes precedence)\n');
  }
  
  // Check if package is installed
  const nodeModulesPath = path.join(projectRoot, 'node_modules', '@rippling', 'pebble-mcp');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ @rippling/pebble-mcp is installed\n');
  } else {
    console.log('❌ @rippling/pebble-mcp is NOT installed');
    console.log('   Run: yarn install\n');
  }
}

function setupGlobal() {
  console.log('\n🔧 Adding Pebble MCP to user config...\n');
  
  let userConfig = readJsonFile(USER_MCP_CONFIG) || { mcpServers: {} };
  
  if (!userConfig.mcpServers) {
    userConfig.mcpServers = {};
  }
  
  userConfig.mcpServers.Pebble = PEBBLE_MCP_CONFIG.Pebble;
  
  writeJsonFile(USER_MCP_CONFIG, userConfig);
  
  console.log('✅ Added Pebble MCP to ~/.cursor/mcp.json');
  console.log('   Restart Cursor to activate\n');
}

function printUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    🪨 Pebble MCP Setup                         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  The Pebble MCP server gives AI assistants access to:          ║
║  • Component documentation and props                           ║
║  • Usage examples from Storybook                               ║
║  • List of all available components                            ║
║                                                                ║
║  Available commands:                                           ║
║                                                                ║
║    yarn mcp:setup   - Set up MCP for this workspace            ║
║    yarn mcp:status  - Check MCP configuration status           ║
║    yarn mcp:global  - Add Pebble to global Cursor config       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
}

// Main
const command = process.argv[2];

switch (command) {
  case 'setup':
    setup();
    break;
  case 'status':
    checkMcpStatus();
    break;
  case 'global':
    setupGlobal();
    break;
  default:
    printUsage();
    checkMcpStatus();
}
