import { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { SaaSTool, SaaSToolFormData } from '../types/saas-tools';

export const useSaaSTools = () => {
  const { user } = useUser();
  const [tools, setTools] = useState<SaaSTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Firebase function references
  const createSaaSToolFunction = httpsCallable(functions, 'createSaaSTool');
  const getSaaSToolsFunction = httpsCallable(functions, 'getSaaSTools');
  const updateSaaSToolFunction = httpsCallable(functions, 'updateSaaSTool');
  const deleteSaaSToolFunction = httpsCallable(functions, 'deleteSaaSTool');

  // Fetch all tools for the current user
  const fetchTools = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getSaaSToolsFunction({ clerkUserId: user.id });
      const responseData = result.data as any;

      if (responseData?.success) {
        setTools(responseData.tools || []);
      } else {
        setError('Failed to fetch SaaS tools');
      }
    } catch (err) {
      console.error('Error fetching SaaS tools:', err);
      setError('Failed to fetch SaaS tools');
    } finally {
      setLoading(false);
    }
  }, [user?.id, getSaaSToolsFunction]);

  // Create a new tool
  const createTool = useCallback(async (toolData: SaaSToolFormData) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const result = await createSaaSToolFunction({
        clerkUserId: user.id,
        ...toolData,
      });
      const responseData = result.data as any;

      if (responseData?.success) {
        // Refresh the tools list
        await fetchTools();
        return true;
      } else {
        setError('Failed to create SaaS tool');
        return false;
      }
    } catch (err) {
      console.error('Error creating SaaS tool:', err);
      setError('Failed to create SaaS tool');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, createSaaSToolFunction, fetchTools]);

  // Update an existing tool
  const updateTool = useCallback(async (toolId: string, toolData: Partial<SaaSToolFormData>) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const result = await updateSaaSToolFunction({
        clerkUserId: user.id,
        toolId,
        ...toolData,
      });
      const responseData = result.data as any;

      if (responseData?.success) {
        // Refresh the tools list
        await fetchTools();
        return true;
      } else {
        setError('Failed to update SaaS tool');
        return false;
      }
    } catch (err) {
      console.error('Error updating SaaS tool:', err);
      setError('Failed to update SaaS tool');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, updateSaaSToolFunction, fetchTools]);

  // Delete a tool
  const deleteTool = useCallback(async (toolId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const result = await deleteSaaSToolFunction({
        clerkUserId: user.id,
        toolId,
      });
      const responseData = result.data as any;

      if (responseData?.success) {
        // Refresh the tools list
        await fetchTools();
        return true;
      } else {
        setError('Failed to delete SaaS tool');
        return false;
      }
    } catch (err) {
      console.error('Error deleting SaaS tool:', err);
      setError('Failed to delete SaaS tool');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, deleteSaaSToolFunction, fetchTools]);

  // Calculate total monthly spending
  const totalMonthlySpending = tools.reduce((total, tool) => total + tool.monthlyCost, 0);

  // Calculate total seats
  const totalSeats = tools.reduce((total, tool) => total + tool.seats, 0);

  return {
    tools,
    loading,
    error,
    totalMonthlySpending,
    totalSeats,
    fetchTools,
    createTool,
    updateTool,
    deleteTool,
  };
}; 