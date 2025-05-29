
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCases, createCase, updateCase, deleteCase, ApiCase } from '../services/api';
import { Case } from '../types';
import { toast } from '@/hooks/use-toast';

// Convert API case to frontend case format
const convertApiCaseToCase = (apiCase: ApiCase): Case => ({
  id: apiCase.id.toString(),
  leadCkt: apiCase.leadCkt,
  ipAddress: apiCase.ipAddress,
  connectivity: apiCase.connectivity as "Stable" | "Unstable" | "Unknown",
  assignedDate: new Date(apiCase.assignedDate),
  dueDate: new Date(apiCase.dueDate),
  caseRemarks: apiCase.caseRemarks,
  status: apiCase.status as "Pending" | "Overdue" | "Completed" | "OnHold",
  createdAt: new Date(apiCase.createdAt),
  timeSpent: apiCase.timeSpent,
  lastUpdated: new Date(apiCase.lastUpdated),
});

export const useCases = () => {
  return useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const apiCases = await getCases();
      return apiCases.map(convertApiCaseToCase);
    },
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Success",
        description: "Case created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<ApiCase> }) =>
      updateCase(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Success",
        description: "Case updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Success",
        description: "Case deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
