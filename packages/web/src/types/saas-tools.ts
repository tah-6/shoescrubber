export interface SaaSTool {
  id?: string; // Firestore document ID
  name: string;
  monthlyCost: number;
  seats: number;
  lastUsed: string; // ISO date string
  category?: string; // Optional: productivity, design, development, etc.
  description?: string; // Optional: brief description
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SaaSToolFormData {
  name: string;
  monthlyCost: number;
  seats: number;
  lastUsed: string;
  category?: string;
  description?: string;
} 