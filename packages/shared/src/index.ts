export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'canceled' | 'past_due';
  planId: string;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  stripePriceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}; 