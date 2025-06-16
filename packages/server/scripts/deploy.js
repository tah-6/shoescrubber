const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to service account file
const serviceAccountPath = path.join(__dirname, '../service-account.json');

// Check if service account exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  process.exit(1);
}

try {
  // Read service account
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  // Set environment variables
  process.env.FIREBASE_PROJECT_ID = serviceAccount.project_id;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
  
  // Deploy functions
  console.log('Deploying Firebase functions...');
  execSync('firebase deploy --only functions --non-interactive', { stdio: 'inherit' });
  
  console.log('Deployment completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error);
  process.exit(1);
} 