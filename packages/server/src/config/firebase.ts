import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '../../service-account.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

// Get Firestore instance
export const db = admin.firestore();

// Get Auth instance
export const auth = admin.auth();

// Export admin for other uses
export { admin }; 