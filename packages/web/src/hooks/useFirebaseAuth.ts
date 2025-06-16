import { useUser } from '@clerk/clerk-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Types matching our server-side types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useFirebaseAuth = () => {
  const { user, isLoaded } = useUser();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncInProgress = useRef(false);
  const lastSyncedUserId = useRef<string | null>(null);

  // Fallback HTTP method
  const createUserHttp = async (userData: any) => {
    const response = await fetch('https://usercreatehttp-fuvbasfqzq-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  };

  const syncUserWithFirebase = useCallback(async () => {
    if (!isLoaded || !user || syncInProgress.current) return;
    
    // Prevent duplicate syncs for the same user
    if (lastSyncedUserId.current === user.id && firebaseUser) {
      console.log('User already synced, skipping...');
      return;
    }
    
    syncInProgress.current = true;

    // Create function references at the beginning so they're available throughout
    const createUserFunction = httpsCallable(functions, 'userCreateWithClerk');
    const getUserFunction = httpsCallable(functions, 'userGetWithClerk');

    try {
      setLoading(true);
      setError(null);

      console.log('=== FIREBASE SYNC DEBUG ===');
      console.log('Clerk user object:', user);
      console.log('Clerk user ID:', user.id);
      console.log('Functions object:', functions);

      // First, try to get existing user from Firebase
      try {
        const getUserData = { clerkUserId: user.id };
        console.log('Calling getUserFunction with:', getUserData);
        
        const result = await getUserFunction(getUserData);
        console.log('getUserFunction result:', result);
        
        // Fix: The response structure is {data: {success: true, user: {...}}}
        const responseData = result.data as any;
        if (responseData?.success && responseData?.user) {
          console.log('Found existing user in Firebase:', responseData.user);
          setFirebaseUser(responseData.user);
          lastSyncedUserId.current = user.id;
          setLoading(false);
          return;
        }
      } catch (getUserError) {
        console.log('User not found in Firebase, creating new user...', getUserError);
      }

      // Create user in Firebase using our Cloud Function
      const createUserData = {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      console.log('Calling createUserFunction with:', createUserData);
      console.log('Data stringified:', JSON.stringify(createUserData));
      
      let createResult;
      try {
        // Try callable function first
        createResult = await createUserFunction(createUserData);
        console.log('createUserFunction result:', createResult);
      } catch (callableError) {
        console.log('Callable function failed, trying HTTP endpoint:', callableError);
        // Fallback to HTTP endpoint
        createResult = { data: await createUserHttp(createUserData) };
        console.log('HTTP endpoint result:', createResult);
      }
      
      // Fix: The response structure is {data: {success: true, userId: '...'}}
      const responseData = createResult.data as any;
      
      if (responseData?.success) {
        console.log('Successfully created user in Firebase with ID:', responseData.userId);
        
        // After creating, fetch the user data
        try {
          const getUserData = { clerkUserId: user.id };
          const getUserResult = await getUserFunction(getUserData);
          const getUserResponseData = getUserResult.data as any;
          
          if (getUserResponseData?.success && getUserResponseData?.user) {
            console.log('Fetched created user data:', getUserResponseData.user);
            setFirebaseUser(getUserResponseData.user);
            lastSyncedUserId.current = user.id;
          } else {
            console.error('Could not fetch created user data');
            setError('User created but could not fetch user data');
          }
        } catch (fetchError) {
          console.error('Error fetching created user:', fetchError);
          setError('User created but could not fetch user data');
        }
      } else {
        console.error('Failed to create user in Firebase');
        setError('Failed to create user in Firebase');
      }
    } catch (err) {
      console.error('Error syncing user with Firebase:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`Failed to sync user data: ${err}`);
    } finally {
      setLoading(false);
      syncInProgress.current = false;
    }
  }, [user?.id, isLoaded, firebaseUser]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      setFirebaseUser(null);
      setLoading(false);
      syncInProgress.current = false;
      lastSyncedUserId.current = null;
      return;
    }

    // Only sync if we haven't synced this user yet
    if (lastSyncedUserId.current !== user.id) {
      syncUserWithFirebase();
    }
  }, [user?.id, isLoaded, syncUserWithFirebase]);

  return {
    user: firebaseUser,
    clerkUser: user,
    loading,
    error,
    isAuthenticated: !!user && !!firebaseUser,
  };
}; 