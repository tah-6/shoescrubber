const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const projectId = process.env.FIREBASE_PROJECT_ID;
const serviceAccountPath = path.join(__dirname, '../service-account.json');

if (!projectId) {
  console.error('FIREBASE_PROJECT_ID environment variable is required');
  process.exit(1);
}

// Create .firebaserc
const firebaseRc = {
  projects: {
    default: projectId
  }
};

fs.writeFileSync(
  path.join(__dirname, '../.firebaserc'),
  JSON.stringify(firebaseRc, null, 2)
);

// Create firebase.json if it doesn't exist
const firebaseJson = {
  functions: {
    source: ".",
    predeploy: [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  firestore: {
    rules: "firestore.rules",
    indexes: "firestore.indexes.json"
  }
};

fs.writeFileSync(
  path.join(__dirname, '../firebase.json'),
  JSON.stringify(firebaseJson, null, 2)
);

// Create firestore.rules
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
`;

fs.writeFileSync(
  path.join(__dirname, '../firestore.rules'),
  firestoreRules.trim()
);

// Create firestore.indexes.json
const firestoreIndexes = {
  indexes: [],
  fieldOverrides: []
};

fs.writeFileSync(
  path.join(__dirname, '../firestore.indexes.json'),
  JSON.stringify(firestoreIndexes, null, 2)
);

console.log('Firebase configuration files created successfully');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  console.error('Please create a service account key in the Firebase Console and save it as service-account.json');
  process.exit(1);
}

console.log('Firebase setup completed successfully'); 