import { createUser, getUser, userCreateWithClerk, userGetWithClerk, userCreateHttp } from './functions/users';
import { createSubscription, cancelSubscription } from './functions/subscriptions';
import { createSaaSTool, getSaaSTools, updateSaaSTool, deleteSaaSTool } from './functions/saas-tools';

// User functions (Firebase Auth)
export const userCreate = createUser;
export const userGet = getUser;

// User functions (Clerk Auth)
export { userCreateWithClerk };
export { userGetWithClerk };

// HTTP endpoints for debugging
export { userCreateHttp };

// Subscription functions
export const subscriptionCreate = createSubscription;
export const subscriptionCancel = cancelSubscription;

// SaaS Tools functions
export { createSaaSTool };
export { getSaaSTools };
export { updateSaaSTool };
export { deleteSaaSTool }; 