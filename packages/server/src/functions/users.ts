import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { db } from '../config/firebase';
import { User } from '../types';

  // Use the existing Firebase Admin instance
  const dbAdmin = getFirestore();

interface UserData {  
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Helper function to clean undefined values from object
function cleanUserData(data: UserData): UserData {
  const cleaned: UserData = {
    clerkUserId: data.clerkUserId,
    email: data.email,
  };
  
  if (data.firstName !== undefined && data.firstName !== null) {
    cleaned.firstName = data.firstName;
  }
  if (data.lastName !== undefined && data.lastName !== null) {
    cleaned.lastName = data.lastName;
  }
  if (data.createdAt !== undefined) {
    cleaned.createdAt = data.createdAt;
  }
  if (data.updatedAt !== undefined) {
    cleaned.updatedAt = data.updatedAt;
  }
  
  return cleaned;
}

// Original Firebase Auth functions (converted to v2)
export const createUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const data = request.data as Partial<User>;
    const userRef = db.collection('users').doc(request.auth.uid);
    const userData: User = {
      id: request.auth.uid,
      email: data.email || '',
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await userRef.set(userData);
    return { success: true, data: userData };
  } catch (error) {
    throw new HttpsError('internal', 'Error creating user');
  }
});

export const getUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userRef = db.collection('users').doc(request.auth.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    return { success: true, data: userDoc.data() };
  } catch (error) {
    throw new HttpsError('internal', 'Error fetching user');
  }
});

// New Clerk integration functions (v2)
export const userCreateWithClerk = onCall(async (request) => {
  try {
    logger.info('createUserWithClerk called with request:', JSON.stringify(request.data, null, 2));
    
    const data = request.data;
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      logger.error('Invalid request data:', data);
      throw new HttpsError('invalid-argument', 'Invalid request data');
    }
    
    if (!data.clerkUserId || !data.email) {
      logger.error('Missing required fields:', { clerkUserId: data.clerkUserId, email: data.email });
      throw new HttpsError('invalid-argument', 'Missing required fields: clerkUserId and email');
    }

    const userData: UserData = {
      clerkUserId: data.clerkUserId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Clean undefined values before saving to Firestore
    const cleanedData = cleanUserData(userData);
    logger.info('Cleaned user data:', cleanedData);

    // Save to Firestore using clerkUserId as document ID
    await dbAdmin.collection('users').doc(data.clerkUserId).set(cleanedData);
    
    logger.info('User created successfully:', data.clerkUserId);
    return { success: true, userId: data.clerkUserId };
  } catch (error) {
    logger.error('Error creating user with Clerk:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error creating user: ' + (error as Error).message);
  }
});

export const userGetWithClerk = onCall(async (request) => {
  try {
    logger.info('getUserWithClerk called with request:', JSON.stringify(request.data, null, 2));
    
    const data = request.data;
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      logger.error('Invalid request data:', data);
      throw new HttpsError('invalid-argument', 'Invalid request data');
    }
    
    if (!data.clerkUserId) {
      logger.error('Missing clerkUserId:', data);
      throw new HttpsError('invalid-argument', 'Missing required field: clerkUserId');
    }

    // Get from Firestore using clerkUserId as document ID
    const userDoc = await dbAdmin.collection('users').doc(data.clerkUserId).get();
    
    if (!userDoc.exists) {
      logger.info('User not found:', data.clerkUserId);
      throw new HttpsError('not-found', 'User not found');
    }
    
    const userData = userDoc.data();
    logger.info('User found:', userData);
    return { success: true, user: userData };
  } catch (error) {
    logger.error('Error getting user with Clerk:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error fetching user: ' + (error as Error).message);
  }
});

// HTTP endpoint for creating user (fallback)
export const userCreateHttp = onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    logger.info('HTTP createUser called with body:', req.body);
    
    const { clerkUserId, email, firstName, lastName } = req.body;
    
    if (!clerkUserId || !email) {
      logger.error('HTTP Missing required fields:', { clerkUserId, email });
      res.status(400).json({ error: 'Missing required fields: clerkUserId and email' });
      return;
    }

    const userData: UserData = {
      clerkUserId,
      email,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Clean undefined values before saving to Firestore
    const cleanedData = cleanUserData(userData);
    logger.info('HTTP Cleaned user data:', cleanedData);

    // Save to Firestore using clerkUserId as document ID
    await dbAdmin.collection('users').doc(clerkUserId).set(cleanedData);
    
    logger.info('HTTP User created successfully:', clerkUserId);
    res.json({ success: true, userId: clerkUserId });
  } catch (error) {
    logger.error('HTTP Error creating user:', error);
    res.status(500).json({ error: 'Error creating user: ' + (error as Error).message });
  }
}); 