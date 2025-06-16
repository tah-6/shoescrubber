const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to get Firebase token
function getFirebaseToken() {
  try {
    // This will open a browser window for authentication
    const token = execSync('firebase login:ci', { stdio: 'inherit' });
    return token.toString().trim();
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    process.exit(1);
  }
}

// Function to save token to .firebaserc
function saveFirebaseToken(token) {
  const firebaseRcPath = path.join(__dirname, '..', '.firebaserc');
  const config = {
    token: token
  };
  
  fs.writeFileSync(firebaseRcPath, JSON.stringify(config, null, 2));
  console.log('Firebase token saved successfully');
}

// Main execution
const token = getFirebaseToken();
saveFirebaseToken(token); 