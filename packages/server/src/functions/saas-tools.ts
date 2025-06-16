import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

// Use the existing Firebase Admin instance
const dbAdmin = getFirestore();

interface SaaSToolData {
  name: string;
  monthlyCost: number;
  seats: number;
  lastUsed: string;
  category?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper function to clean undefined values from object
function cleanSaaSToolData(data: SaaSToolData): SaaSToolData {
  const cleaned: SaaSToolData = {
    name: data.name,
    monthlyCost: data.monthlyCost,
    seats: data.seats,
    lastUsed: data.lastUsed,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
  
  if (data.category !== undefined && data.category !== null && data.category !== '') {
    cleaned.category = data.category;
  }
  if (data.description !== undefined && data.description !== null && data.description !== '') {
    cleaned.description = data.description;
  }
  
  return cleaned;
}

// Create a new SaaS tool for a user
export const createSaaSTool = onCall(async (request) => {
  try {
    logger.info('createSaaSTool called with request:', JSON.stringify(request.data, null, 2));
    
    const data = request.data;
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      logger.error('Invalid request data:', data);
      throw new HttpsError('invalid-argument', 'Invalid request data');
    }
    
    if (!data.clerkUserId || !data.name || data.monthlyCost === undefined || data.seats === undefined || !data.lastUsed) {
      logger.error('Missing required fields:', data);
      throw new HttpsError('invalid-argument', 'Missing required fields: clerkUserId, name, monthlyCost, seats, lastUsed');
    }

    const toolData: SaaSToolData = {
      name: data.name,
      monthlyCost: Number(data.monthlyCost),
      seats: Number(data.seats),
      lastUsed: data.lastUsed,
      category: data.category,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Clean undefined values before saving to Firestore
    const cleanedData = cleanSaaSToolData(toolData);
    logger.info('Cleaned SaaS tool data:', cleanedData);

    // Save to Firestore in user's tools subcollection
    const toolRef = await dbAdmin
      .collection('users')
      .doc(data.clerkUserId)
      .collection('tools')
      .add(cleanedData);
    
    logger.info('SaaS tool created successfully:', toolRef.id);
    return { success: true, toolId: toolRef.id };
  } catch (error) {
    logger.error('Error creating SaaS tool:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error creating SaaS tool: ' + (error as Error).message);
  }
});

// Get all SaaS tools for a user
export const getSaaSTools = onCall(async (request) => {
  try {
    logger.info('getSaaSTools called with request:', JSON.stringify(request.data, null, 2));
    
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

    // Get all tools from user's tools subcollection
    const toolsSnapshot = await dbAdmin
      .collection('users')
      .doc(data.clerkUserId)
      .collection('tools')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const tools = toolsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    logger.info(`Found ${tools.length} tools for user:`, data.clerkUserId);
    return { success: true, tools };
  } catch (error) {
    logger.error('Error getting SaaS tools:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error fetching SaaS tools: ' + (error as Error).message);
  }
});

// Update a SaaS tool
export const updateSaaSTool = onCall(async (request) => {
  try {
    logger.info('updateSaaSTool called with request:', JSON.stringify(request.data, null, 2));
    
    const data = request.data;
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      logger.error('Invalid request data:', data);
      throw new HttpsError('invalid-argument', 'Invalid request data');
    }
    
    if (!data.clerkUserId || !data.toolId) {
      logger.error('Missing required fields:', data);
      throw new HttpsError('invalid-argument', 'Missing required fields: clerkUserId, toolId');
    }

    const updateData: Partial<SaaSToolData> = {
      updatedAt: new Date().toISOString(),
    };

    // Only update provided fields
    if (data.name !== undefined) updateData.name = data.name;
    if (data.monthlyCost !== undefined) updateData.monthlyCost = Number(data.monthlyCost);
    if (data.seats !== undefined) updateData.seats = Number(data.seats);
    if (data.lastUsed !== undefined) updateData.lastUsed = data.lastUsed;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;

    // Clean undefined values before saving to Firestore
    const cleanedData = cleanSaaSToolData(updateData as SaaSToolData);
    logger.info('Cleaned update data:', cleanedData);

    // Update in Firestore - cast to any to avoid TypeScript issues with Firestore update
    await dbAdmin
      .collection('users')
      .doc(data.clerkUserId)
      .collection('tools')
      .doc(data.toolId)
      .update(cleanedData as any);
    
    logger.info('SaaS tool updated successfully:', data.toolId);
    return { success: true, toolId: data.toolId };
  } catch (error) {
    logger.error('Error updating SaaS tool:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error updating SaaS tool: ' + (error as Error).message);
  }
});

// Delete a SaaS tool
export const deleteSaaSTool = onCall(async (request) => {
  try {
    logger.info('deleteSaaSTool called with request:', JSON.stringify(request.data, null, 2));
    
    const data = request.data;
    
    // Validate required fields
    if (!data || typeof data !== 'object') {
      logger.error('Invalid request data:', data);
      throw new HttpsError('invalid-argument', 'Invalid request data');
    }
    
    if (!data.clerkUserId || !data.toolId) {
      logger.error('Missing required fields:', data);
      throw new HttpsError('invalid-argument', 'Missing required fields: clerkUserId, toolId');
    }

    // Delete from Firestore
    await dbAdmin
      .collection('users')
      .doc(data.clerkUserId)
      .collection('tools')
      .doc(data.toolId)
      .delete();
    
    logger.info('SaaS tool deleted successfully:', data.toolId);
    return { success: true, toolId: data.toolId };
  } catch (error) {
    logger.error('Error deleting SaaS tool:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Error deleting SaaS tool: ' + (error as Error).message);
  }
}); 