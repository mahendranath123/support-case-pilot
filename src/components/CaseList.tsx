
import React, { useState } from 'react';
import { Case } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface CaseListProps {
  cases: Case[];
  onCaseUpdated: (updatedCase: Case) => void;
}

export function CaseList({ cases, onCaseUpdated }: CaseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.leadCkt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.lead?.cust_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (caseItem: Case, newStatus: Case['status']) => {
    const updatedCase = { ...caseItem, status: newStatus };
    onCaseUpdated(updatedCase);
    toast({
      title: "Status Updated",
      description: `Case ${caseItem.leadCkt} status changed to ${newStatus}`,
    });
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'OnHold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectivityColor = (connectivity: string) => {
    switch (connectivity) {
      case 'Stable': return 'bg-green-100 text-green-800';
      case 'Unstable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm">
        <CardHeader>
          <CardTitle>Case Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by lead number or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="OnHold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCases.map((caseItem, index) => (
          <Card 
            key={caseItem.id} 
            className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{caseItem.leadCkt}</CardTitle>
                  <p className="text-sm text-gray-600">{caseItem.lead?.cust_name}</p>
                </div>
                <Badge className={getStatusColor(caseItem.status)}>
                  {caseItem.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">IP Address:</p>
                  <p className="font-medium">{caseItem.ipAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500">Connectivity:</p>
                  <Badge className={getConnectivityColor(caseItem.connectivity)} variant="outline">
                    {caseItem.connectivity}
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-gray-500">Due Date:</p>
                <p className="font-medium">{caseItem.dueDate.toLocaleDateString()}</p>
              </div>

              {caseItem.caseRemarks && (
                <div className="text-sm">
                  <p className="text-gray-500">Remarks:</p>
                  <p className="text-gray-700 text-xs bg-gray-50 p-2 rounded">{caseItem.caseRemarks}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-2">
                {['Pending', 'Overdue', 'Completed', 'OnHold'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={caseItem.status === status ? "default" : "outline"}
                    onClick={() => handleStatusUpdate(caseItem, status as Case['status'])}
                    className="text-xs transition-all duration-200"
                  >
                    {status === 'OnHold' ? 'On Hold' : status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">Create a new case to get started with case management.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
