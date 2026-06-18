import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function deployMove() {
  console.log("Deploying Move contracts...");

  try {
    console.log("Simulating Move deployment for Hackathon context...");

    const envPath = path.join(__dirname, '../../.env');
    const mockPackageId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockRegistryId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    envContent += `\nMOVE_PACKAGE_ID=${mockPackageId}\nAGENT_REGISTRY_ID=${mockRegistryId}\n`;
    fs.writeFileSync(envPath, envContent);

    console.log(`Package ID: ${mockPackageId}`);
    console.log(`Registry ID: ${mockRegistryId}`);
  } catch(e) {
    console.error("Failed to deploy", e);
  }
}

if (require.main === module) {
  deployMove().catch(console.error);
}
