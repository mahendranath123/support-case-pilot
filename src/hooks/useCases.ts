// src/hooks/useCases.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
  ApiCase,
} from '@/services/api';
import { Case } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Convert ApiCase → frontend Case, picking up all fields including:
 *   - createdBy
 *   - createdByUser
 *   - assignedTo
 *   - assignedToUser
 *   - device
 *   - companyName
 */
const convertApiCaseToCase = (apiCase: ApiCase): Case => ({
  id: apiCase.id,
  leadCkt: apiCase.leadCkt,
  ipAddress: apiCase.ipAddress,
  connectivity: apiCase.connectivity as 'Stable' | 'Unstable' | 'Unknown',
  assignedDate: apiCase.assignedDate,
  dueDate: apiCase.dueDate,
  caseRemarks: apiCase.caseRemarks,
  status: apiCase.status as 'Pending' | 'Overdue' | 'Completed' | 'OnHold',
  createdAt: apiCase.createdAt,
  lastUpdated: apiCase.lastUpdated,
  timeSpent: apiCase.timeSpent,

  // ─── New fields ────────────────────────────────────
  assignedTo: apiCase.assignedTo ?? null,
  assignedToUser: apiCase.assignedToUser ?? null,

  createdBy: apiCase.createdBy,
  createdByUser: apiCase.createdByUser,
  device: apiCase.device || '',
  companyName: apiCase.companyName || '',
});

/**
 * Fetch Cases
 *  - Admin sees all; user sees only those where assignedTo = their user ID.
 *  - Relies on x-user-id / x-user-role headers, courtesy of useAuth().
 */
export const useCases = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cases', user?.id, user?.role],
    queryFn: async () => {
      const apiCases = await getCases(user);
      return apiCases.map(convertApiCaseToCase);
    },
    enabled: !!user, // only run when user is defined
  });
};

/**
 * Create Case
 *  - After creating, we invalidate the same queryKey so that the new case
 *    (with its assignedToUser) shows up immediately.
 */
export const useCreateCase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (caseData: {
      leadCkt: string;
      ipAddress: string | null;
      connectivity: string;
      assignedDate: string;
      dueDate: string;
      caseRemarks: string | null;
      status: string;
      timeSpent: number;
      device?: string | null;
      assignedTo: number | null;
    }) => createCase(caseData, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', user?.id, user?.role] });
      toast({
        title: 'Success',
        description: 'Case created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Update Case
 *  - Now that the backend can update { status, caseRemarks, timeSpent, device, assignedTo },
 *    we simply invalidate the same queryKey afterward.
 */
export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (args: {
      id: number;
      updates: Partial<
        Pick<
          ApiCase,
          'status' | 'caseRemarks' | 'timeSpent' | 'device' | 'assignedTo'
        >
      >;
    }) => updateCase(args.id, args.updates, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', user?.id, user?.role] });
      toast({
        title: 'Success',
        description: 'Case updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Delete Case
 *  - After a successful delete, we re‐invalidate to refetch.
 */
export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: number) => deleteCase(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', user?.id, user?.role] });
      toast({
        title: 'Success',
        description: 'Case deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });
};

