
import React, { useState, useEffect } from 'react';
import { Case, Lead } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NewCaseFormProps {
  onCaseAdded: (case_: Case) => void;
}

// Mock lead data - In real app, this would come from your database
const mockLeads: Lead[] = [
  {
    sr_no: "1",
    ckt: "CKT001",
    cust_name: "TechCorp Solutions",
    address: "123 Business Park, Mumbai",
    email_id: "contact@techcorp.com",
    contact_name: "Rajesh Kumar",
    comm_date: "2024-01-15",
    pop_name: "Mumbai POP",
    nas_ip_1: "192.168.1.1",
    switch_ip_1: "192.168.1.10",
    port_no_1: "24",
    vlan_id_1: "100",
    primary_pop: "Mumbai",
    pop_name_2: "Backup POP",
    nas_ip_2: "192.168.2.1",
    switch_ip_2: "192.168.2.10",
    port_no_2: "12",
    vlan_id_2: "200",
    backup: "Yes",
    usable_ip_address: "203.0.113.10",
    subnet_mask: "255.255.255.0",
    gateway: "203.0.113.1",
    bandwidth: "100 Mbps",
    sales_person: "Amit Sharma",
    testing_fe: "Completed",
    device: "Cisco Router",
    remarks: "High priority customer",
    mrtg: "Active"
  },
  {
    sr_no: "2",
    ckt: "CKT002",
    cust_name: "Digital Innovations Ltd",
    address: "456 Tech Valley, Bangalore",
    email_id: "admin@digitalinno.com",
    contact_name: "Priya Patel",
    comm_date: "2024-01-20",
    pop_name: "Bangalore POP",
    nas_ip_1: "192.168.3.1",
    switch_ip_1: "192.168.3.10",
    port_no_1: "16",
    vlan_id_1: "300",
    primary_pop: "Bangalore",
    pop_name_2: "",
    nas_ip_2: "",
    switch_ip_2: "",
    port_no_2: "",
    vlan_id_2: "",
    backup: "No",
    usable_ip_address: "203.0.114.20",
    subnet_mask: "255.255.255.0",
    gateway: "203.0.114.1",
    bandwidth: "50 Mbps",
    sales_person: "Neha Singh",
    testing_fe: "Pending",
    device: "Juniper Router",
    remarks: "Standard customer",
    mrtg: "Inactive"
  }
];

export function NewCaseForm({ onCaseAdded }: NewCaseFormProps) {
  const [selectedLeadCkt, setSelectedLeadCkt] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [ipAddress, setIpAddress] = useState('');
  const [connectivity, setConnectivity] = useState<'Stable' | 'Unstable' | 'Unknown'>('Unknown');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [caseRemarks, setCaseRemarks] = useState('');
  const [status, setStatus] = useState<Case['status']>('Pending');
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Filter leads based on search value
  const filteredLeads = mockLeads.filter(lead => 
    lead.ckt.toLowerCase().includes(searchValue.toLowerCase()) ||
    lead.cust_name.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    if (selectedLeadCkt) {
      const lead = mockLeads.find(l => l.ckt === selectedLeadCkt);
      setSelectedLead(lead || null);
      setIpAddress(lead?.usable_ip_address || '');
      console.log('Selected lead:', lead);
    } else {
      setSelectedLead(null);
      setIpAddress('');
    }
  }, [selectedLeadCkt]);

  const handleLeadSelect = (leadCkt: string) => {
    console.log('Selecting lead:', leadCkt);
    setSelectedLeadCkt(leadCkt);
    setOpen(false);
    setSearchValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLead || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newCase: Case = {
      id: Date.now().toString(),
      leadCkt: selectedLeadCkt,
      ipAddress,
      connectivity,
      assignedDate: new Date(assignedDate),
      dueDate: new Date(dueDate),
      caseRemarks,
      status,
      lead: selectedLead
    };

    onCaseAdded(newCase);
    
    // Reset form
    setSelectedLeadCkt('');
    setSelectedLead(null);
    setIpAddress('');
    setConnectivity('Unknown');
    setAssignedDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setCaseRemarks('');
    setStatus('Pending');

    toast({
      title: "Case Created",
      description: `Case for ${selectedLead.cust_name} has been created successfully`,
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm max-w-4xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Support Case</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lead Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="leadNumber">Lead Number *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedLeadCkt
                      ? `${selectedLeadCkt} - ${selectedLead?.cust_name}`
                      : "Search and select a lead number..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search lead number or company name..." 
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    <CommandList>
                      <CommandEmpty>No lead found.</CommandEmpty>
                      <CommandGroup>
                        {filteredLeads.map((lead) => (
                          <CommandItem
                            key={lead.ckt}
                            value={lead.ckt}
                            onSelect={() => handleLeadSelect(lead.ckt)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeadCkt === lead.ckt ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{lead.ckt}</span>
                              <span className="text-sm text-gray-500">{lead.cust_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* IP Address */}
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter IP address"
              />
            </div>

            {/* Company Name (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={selectedLead?.cust_name || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* Contact Person (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={selectedLead?.contact_name || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={selectedLead?.email_id || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* Bandwidth (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="bandwidth">Bandwidth</Label>
              <Input
                id="bandwidth"
                value={selectedLead?.bandwidth || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* Device (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Input
                id="device"
                value={selectedLead?.device || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* Assigned Date */}
            <div className="space-y-2">
              <Label htmlFor="assignedDate">Assigned Date *</Label>
              <Input
                id="assignedDate"
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Case['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">🟡 Pending</SelectItem>
                  <SelectItem value="Overdue">🔴 Overdue</SelectItem>
                  <SelectItem value="Completed">🟢 Completed</SelectItem>
                  <SelectItem value="OnHold">⚪ On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address (Read-only, full width) */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={selectedLead?.address || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          {/* Connectivity */}
          <div className="space-y-3">
            <Label>Connectivity Status</Label>
            <RadioGroup value={connectivity} onValueChange={(value) => setConnectivity(value as typeof connectivity)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Stable" id="stable" />
                <Label htmlFor="stable">🟢 Stable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Unstable" id="unstable" />
                <Label htmlFor="unstable">🔴 Unstable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Unknown" id="unknown" />
                <Label htmlFor="unknown">❓ Unknown</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Case Remarks */}
          <div className="space-y-2">
            <Label htmlFor="caseRemarks">Case Remarks</Label>
            <Textarea
              id="caseRemarks"
              value={caseRemarks}
              onChange={(e) => setCaseRemarks(e.target.value)}
              placeholder="Enter case-specific remarks..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            Create Support Case
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
