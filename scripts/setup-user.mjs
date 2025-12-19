#!/usr/bin/env node

/**
 * Setup User Script
 * 
 * Automatically configures personalized user settings from git config.
 * Creates a .env.local file with user name, email, and avatar URLs.
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, '.env.local');

/**
 * Execute git config command
 */
function getGitConfig(key) {
  try {
    return execSync(`git config --get ${key}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Generate Gravatar URL from email
 */
function getGravatarUrl(email) {
  if (!email) return null;
  const hash = createHash('md5').update(email.toLowerCase().trim()).digest('hex');
  // Use 'mp' (mystery person) as default instead of identicon for a cleaner look
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
}

/**
 * Try to get GitHub username from git config
 * 
 * NOTE: We intentionally do NOT parse the remote URL because that gives us
 * the repo OWNER (pbest), not the person who cloned it. Users must explicitly
 * set their GitHub username via: git config --global github.user "username"
 */
function getGitHubUsername() {
  // Only use explicitly configured github.user
  // Do NOT parse remote URL - that's the repo owner, not the current user
  return getGitConfig('github.user');
}

/**
 * Main setup function
 */
function setup() {
  console.log('🔧 Setting up user preferences from git config...\n');
  
  let userName, userEmail, githubUsername;
  
  try {
    userName = getGitConfig('user.name');
    userEmail = getGitConfig('user.email');
    githubUsername = getGitHubUsername();
  } catch (error) {
    console.log('⚠️  Could not read git config. Using default settings.');
    console.log('   The playground will show generic greeting: "Hi Rippler"\n');
    // Exit successfully - this is not a critical failure
    process.exit(0);
  }
  
  if (!userName && !userEmail && !githubUsername) {
    console.log('⚠️  No git config found. Using default settings.');
    console.log('   The playground will show generic greeting: "Hi Rippler"');
    console.log('   To personalize, run:');
    console.log('   git config --global user.name "Your Name"');
    console.log('   git config --global user.email "your.email@example.com"');
    console.log('');
    console.log('   For GitHub avatar (optional):');
    console.log('   git config --global github.user "your-github-username"\n');
    // Exit successfully - this is not a critical failure
    process.exit(0);
  }
  
  // Build env vars
  const envVars = [];
  
  if (userName) {
    envVars.push(`VITE_USER_NAME="${userName}"`);
    console.log(`✅ Name: ${userName}`);
  }
  
  if (userEmail) {
    envVars.push(`VITE_USER_EMAIL="${userEmail}"`);
    const gravatarUrl = getGravatarUrl(userEmail);
    envVars.push(`VITE_USER_GRAVATAR="${gravatarUrl}"`);
    console.log(`✅ Email: ${userEmail}`);
    console.log(`✅ Gravatar: ${gravatarUrl}`);
  }
  
  if (githubUsername) {
    const githubAvatarUrl = `https://github.com/${githubUsername}.png?size=200`;
    envVars.push(`VITE_USER_GITHUB="${githubUsername}"`);
    envVars.push(`VITE_USER_GITHUB_AVATAR="${githubAvatarUrl}"`);
    console.log(`✅ GitHub: ${githubUsername}`);
    console.log(`✅ GitHub Avatar: ${githubAvatarUrl}`);
  } else if (userName || userEmail) {
    // Only show hint if we have other user info but no GitHub
    console.log(`ℹ️  No GitHub username set (will use Gravatar or initials)`);
    console.log(`   To show your GitHub avatar, run:`);
    console.log(`   git config --global github.user "your-github-username"`);
  }
  
  // Read existing .env.local if it exists and preserve other vars
  let existingEnvVars = [];
  try {
    if (existsSync(envPath)) {
      const existingContent = readFileSync(envPath, 'utf8');
      existingEnvVars = existingContent
        .split('\n')
        .filter(line => {
          // Keep non-user vars
          return line.trim() && 
                 !line.startsWith('VITE_USER_') &&
                 !line.startsWith('#');
        });
    }
  } catch (error) {
    console.log('⚠️  Could not read existing .env.local, creating new one...');
  }
  
  // Combine and write
  const envContent = [
    '# Auto-generated user preferences from git config',
    '# This file is gitignored and personal to you',
    '',
    ...envVars,
    '',
    ...existingEnvVars,
  ].join('\n');
  
  try {
    writeFileSync(envPath, envContent);
    console.log(`\n✨ User preferences saved to .env.local`);
  } catch (error) {
    console.log(`\n⚠️  Could not write to .env.local: ${error.message}`);
    console.log('   Continuing without saved preferences...');
  }
}

// Run setup with top-level error handling
try {
  setup();
} catch (error) {
  console.log('⚠️  Setup script encountered an error, but continuing...');
  console.log(`   Error: ${error.message}`);
  console.log('   The playground will use default settings: "Hi Rippler"\n');
  // Always exit successfully - this should never block the dev server
  process.exit(0);
}

