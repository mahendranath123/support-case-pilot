// src/components/NewCaseForm.tsx

import React, { useState, useEffect } from 'react';
import { Case } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from '../hooks/use-toast';
import { useCreateCase, useCases } from '../hooks/useCases';
import { useLeads } from '../hooks/useLeads';
import { getUsers, ApiUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface NewCaseFormProps {
  onCaseAdded: (case_: Case) => void;
}

export function NewCaseForm({ onCaseAdded }: NewCaseFormProps) {
  const { user: currentUser } = useAuth();
  const { data: allCases = [] } = useCases();

  const [selectedLeadCkt, setSelectedLeadCkt] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [device, setDevice] = useState<string>('');
  const [connectivity, setConnectivity] = useState<'Stable' | 'Unstable' | 'Unknown'>(
    'Unknown'
  );

  const [dropboxUsers, setDropboxUsers] = useState<ApiUser[]>([]);
  const [assignedTo, setAssignedTo] = useState<number | ''>('');

  const todayString = new Date().toISOString().split('T')[0]; // e.g. "2025-06-07"
  const [assignedDate, setAssignedDate] = useState<string>(todayString);

  const [assignedHour, setAssignedHour] = useState<number>(12);
  const [assignedMinute, setAssignedMinute] = useState<number>(0);
  const [assignedAMPM, setAssignedAMPM] = useState<'AM' | 'PM'>('AM');

  const [dueDate, setDueDate] = useState<string>(todayString);
  const [dueHour, setDueHour] = useState<number>(11);
  const [dueMinute, setDueMinute] = useState<number>(59);
  const [dueAMPM, setDueAMPM] = useState<'AM' | 'PM'>('PM');

  const [caseRemarks, setCaseRemarks] = useState<string>('');
  const [status, setStatus] = useState<Case['status']>('Pending');
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const [open, setOpen] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const { data: leads = [], searchLeads, isSearching } = useLeads();

  useEffect(() => {
    if (searchValue.length >= 2) {
      searchLeads(searchValue);
    }
  }, [searchValue, searchLeads]);

  const selectedLead = leads.find((lead) => lead.ckt === selectedLeadCkt);
  useEffect(() => {
    if (selectedLead) {
      setIpAddress(selectedLead.usable_ip_address || '');
      setDevice(selectedLead.device || '');
    } else {
      setIpAddress('');
      setDevice('');
    }
  }, [selectedLead]);

  const handleLeadSelect = (leadCkt: string) => {
    setSelectedLeadCkt(leadCkt);
    setOpen(false);
    setSearchValue('');
  };

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      (async () => {
        try {
          const users = await getUsers(currentUser);
          setDropboxUsers(users);
          if (users.length > 0) {
            setAssignedTo(users[0].id);
          }
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      })();
    } else {
      setAssignedTo(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    let ampm: 'AM' | 'PM' = 'AM';

    if (hour >= 12) {
      ampm = 'PM';
      if (hour > 12) hour -= 12;
    } else {
      ampm = 'AM';
      if (hour === 0) hour = 12;
    }

    setAssignedHour(hour);
    setAssignedMinute(minute);
    setAssignedAMPM(ampm);
  }, []);

  const createCaseMutation = useCreateCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLead || !dueDate || assignedTo === '') {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Lead, Due Date, Assigned To).',
        variant: 'destructive',
      });
      return;
    }

    const existing = allCases.find((c) => c.leadCkt === selectedLeadCkt);
    if (existing) {
      const dueDtLocal = new Date(existing.dueDate);
      const formattedDue = dueDtLocal.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      const assignedUsername = existing.assignedToUser
        ? existing.assignedToUser
        : '(unassigned)';
      toast({
        title: 'Lead Already Exists',
        description: `Lead ${selectedLeadCkt} is already assigned to ${assignedUsername} with due date ${formattedDue}.`,
        variant: 'destructive',
      });
      return;
    }

    if (assignedDate < todayString) {
      toast({
        title: 'Invalid Date',
        description: 'Assigned Date cannot be in the past.',
        variant: 'destructive',
      });
      return;
    }

    let aH24 = assignedHour % 12;
    if (assignedAMPM === 'PM') aH24 += 12;
    const aHH = String(aH24).padStart(2, '0');
    const aMM = String(assignedMinute).padStart(2, '0');
    const assignedDateTime = `${assignedDate}T${aHH}:${aMM}`;

    let dH24 = dueHour % 12;
    if (dueAMPM === 'PM') dH24 += 12;
    const dHH = String(dH24).padStart(2, '0');
    const dMM = String(dueMinute).padStart(2, '0');
    const dueDateTime = `${dueDate}T${dHH}:${dMM}`;

    // Validate: due >= now and due >= assigned
    const now = new Date();
    const dueCheck = new Date(dueDateTime);
    const assignedCheck = new Date(assignedDateTime);
    if (dueCheck < now) {
      toast({
        title: 'Invalid Due Date',
        description: 'Due Date/Time cannot be in the past.',
        variant: 'destructive',
      });
      return;
    }
    if (dueCheck < assignedCheck) {
      toast({
        title: 'Invalid Due Date',
        description: 'Due Date/Time must be on or after Assigned Date/Time.',
        variant: 'destructive',
      });
      return;
    }

    const caseData = {
      leadCkt: selectedLeadCkt,
      ipAddress: ipAddress.trim() || null,
      connectivity,
      assignedDate: assignedDateTime,
      dueDate: dueDateTime,
      caseRemarks: caseRemarks.trim() || null,
      status,
      timeSpent: timeSpent || 0,
      device: device.trim() || null,
      assignedTo: assignedTo === '' ? null : assignedTo,
    };

    try {
      const createdApiCase = await createCaseMutation.mutateAsync(caseData);

      const newCase: Case = {
        id: createdApiCase.id.toString(),
        leadCkt: createdApiCase.leadCkt,
        ipAddress: createdApiCase.ipAddress,
        connectivity: createdApiCase.connectivity as 'Stable' | 'Unstable' | 'Unknown',
        assignedDate: createdApiCase.assignedDate,
        dueDate: createdApiCase.dueDate,
        caseRemarks: createdApiCase.caseRemarks || '',
        status: createdApiCase.status as 'Pending' | 'Overdue' | 'Completed' | 'OnHold',
        createdAt: createdApiCase.createdAt,
        lastUpdated: createdApiCase.lastUpdated,
        timeSpent: createdApiCase.timeSpent,
        lead: selectedLead,
        createdBy: createdApiCase.createdBy,
        createdByUser: createdApiCase.createdByUser,
        device: createdApiCase.device || '',
        assignedTo: createdApiCase.assignedTo ?? null,
        assignedToUser: createdApiCase.assignedToUser ?? null,
        companyName: createdApiCase.companyName || '',
      };

      onCaseAdded(newCase);

      setSelectedLeadCkt('');
      setIpAddress('');
      setDevice('');
      setConnectivity('Unknown');
      setAssignedDate(todayString);

      const now2 = new Date();
      let h2 = now2.getHours();
      const m2 = now2.getMinutes();
      let ap2: 'AM' | 'PM' = 'AM';
      if (h2 >= 12) {
        ap2 = 'PM';
        if (h2 > 12) h2 -= 12;
      } else {
        ap2 = 'AM';
        if (h2 === 0) h2 = 12;
      }
      setAssignedHour(h2);
      setAssignedMinute(m2);
      setAssignedAMPM(ap2);

      setDueDate(todayString);
      setDueHour(11);
      setDueMinute(59);
      setDueAMPM('PM');

      setCaseRemarks('');
      setStatus('Pending');
      setTimeSpent(0);
      setSearchValue('');

      if (currentUser.role === 'admin' && dropboxUsers.length > 0) {
        setAssignedTo(dropboxUsers[0].id);
      } else if (currentUser.role !== 'admin') {
        setAssignedTo(currentUser.id);
      }
    } catch (error: any) {
      console.error('Error creating case:', error);
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedUserObj = dropboxUsers.find((u) => u.id === assignedTo);

  return (
    <Card className="bg-white/80 backdrop-blur-lg border-white/20 shadow-sm max-w-4xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Support Case</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Lead Selection ──────────────────────────────────────────────────── */}
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
                      ? `${selectedLeadCkt} – ${selectedLead?.cust_name}`
                      : 'Search and select a lead number...'}
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
                      {isSearching && <CommandEmpty>Searching...</CommandEmpty>}
                      {!isSearching && leads.length === 0 && searchValue.length >= 2 && (
                        <CommandEmpty>No lead found.</CommandEmpty>
                      )}
                      {!isSearching && searchValue.length < 2 && (
                        <CommandEmpty>Type ≥2 characters to search.</CommandEmpty>
                      )}
                      <CommandGroup>
                        {leads.map((lead) => (
                          <CommandItem
                            key={lead.ckt}
                            value={lead.ckt}
                            onSelect={() => handleLeadSelect(lead.ckt)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedLeadCkt === lead.ckt ? 'opacity-100' : 'opacity-0'
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

            {currentUser?.role === 'admin' && (
              /* ── Assign To (visible only to admins) ───────────────────────────── */
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Select
                  value={assignedTo === '' ? '' : assignedTo.toString()}
                  onValueChange={(value) =>
                    setAssignedTo(value === '' ? '' : parseInt(value))
                  }
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {dropboxUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUserObj && (
                  <p className="mt-1 text-sm text-gray-700">
                    Selected user:&nbsp;
                    <span className="font-medium">{selectedUserObj.username}</span>
                  </p>
                )}
              </div>
            )}

            {/* ── IP Address ─────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter IP address"
              />
            </div>

            {/* ── Device ─────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Input
                id="device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="Enter device"
              />
            </div>

            {/* ── Company Name (Read-only) ────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={selectedLead?.cust_name || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* ── Contact Person (Read-only) ─────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={selectedLead?.contact_name || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* ── Email (Read-only) ──────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={selectedLead?.email_id || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* ── Bandwidth (Read-only) ──────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="bandwidth">Bandwidth</Label>
              <Input
                id="bandwidth"
                value={selectedLead?.bandwidth || ''}
                readOnly
                className="bg-gray-50"
              />
            </div>

            {/* ── Assigned Date ───────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="assignedDate">Assigned Date *</Label>
              <Input
                id="assignedDate"
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                required
                min={todayString}
              />
            </div>

            {/* ── Assigned Time (12-hour) ──────────────────────────────────────────── */}
            <div className="space-y-1">
              <Label>Assigned Time *</Label>
              <div className="flex space-x-2">
                <div>
                  <Select
                    value={assignedHour.toString().padStart(2, '0')}
                    onValueChange={(val) => setAssignedHour(parseInt(val))}
                  >
                    <SelectTrigger id="assignedHour">
                      <SelectValue placeholder="HH">
                        {assignedHour.toString().padStart(2, '0')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <SelectItem key={h} value={h.toString().padStart(2, '0')}>
                          {h.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={assignedMinute.toString().padStart(2, '0')}
                    onValueChange={(val) => setAssignedMinute(parseInt(val))}
                  >
                    <SelectTrigger id="assignedMinute">
                      <SelectValue placeholder="MM">
                        {assignedMinute.toString().padStart(2, '0')}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <SelectItem key={m} value={m.toString().padStart(2, '0')}>
                          {m.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={assignedAMPM}
                    onValueChange={(val) => setAssignedAMPM(val as 'AM' | 'PM')}
                  >
                    <SelectTrigger id="assignedAMPM">
                      <SelectValue placeholder="AM/PM">{assignedAMPM}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Due Date ────────────────────────────────────────────────────────── */}
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

            {/* ── Due Time (12-hour) ──────────────────────────────────────────────── */}
            <div className="space-y-1">
              <Label>Due Time *</Label>
              <div className="flex space-x-2">
                <div>
                  <Select
                    value={dueHour.toString().padStart(2, '0')}
                    onValueChange={(val) => setDueHour(parseInt(val))}
                  >
                    <SelectTrigger id="dueHour">
                      <SelectValue placeholder="HH">{dueHour.toString().padStart(2, '0')}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <SelectItem key={h} value={h.toString().padStart(2, '0')}>
                          {h.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={dueMinute.toString().padStart(2, '0')}
                    onValueChange={(val) => setDueMinute(parseInt(val))}
                  >
                    <SelectTrigger id="dueMinute">
                      <SelectValue placeholder="MM">{dueMinute.toString().padStart(2, '0')}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                        <SelectItem key={m} value={m.toString().padStart(2, '0')}>
                          {m.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={dueAMPM}
                    onValueChange={(val) => setDueAMPM(val as 'AM' | 'PM')}
                  >
                    <SelectTrigger id="dueAMPM">
                      <SelectValue placeholder="AM/PM">{dueAMPM}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* ── Time Spent ──────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
              <Input
                id="timeSpent"
                type="number"
                min="0"
                value={timeSpent}
                onChange={(e) => setTimeSpent(Number(e.target.value))}
                placeholder="Enter time spent in minutes"
              />
            </div>

            {/* ── Status ──────────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Case['status'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
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

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={selectedLead?.address || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-3">
            <Label>Connectivity Status</Label>
            <RadioGroup
              value={connectivity}
              onValueChange={(value) => setConnectivity(value as typeof connectivity)}
            >
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
            disabled={createCaseMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            {createCaseMutation.isPending ? 'Creating Case...' : 'Create Support Case'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

