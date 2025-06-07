// src/components/Insert.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface Lead {
  sr_no?: string;
  ckt: string;
  cust_name?: string;
  address?: string;
  email_id?: string;
  reserved_field?: string;
  contact_name?: string;
  comm_date?: string;
  pop_name?: string;
  nas_ip_1?: string;
  switch_ip_1?: string;
  port_no_1?: string;
  vlan_id_1?: string;
  primary_pop?: string;
  pop_name_2?: string;
  nas_ip_2?: string;
  switch_ip_2?: string;
  port_no_2?: string;
  vlan_id_2?: string;
  backup?: string;
  usable_ip_address?: string;
  subnet_mask?: string;
  gateway?: string;
  bandwidth?: string;
  sales_person?: string;
  testing_fe?: string;
  device?: string;
  remarks?: string;
  mrtg?: string;
}

// ── Use VITE_API_BASE_URL (from .env) or fallback to localhost:3001 ──
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function Insert() {
  const { user: currentUser } = useAuth();

  // ─── Local state ─────────────────────────────────────────────────
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form fields (including auto-generated srNo)
  const [srNo, setSrNo] = useState<string>('');
  const [ckt, setCkt] = useState<string>('');
  const [custName, setCustName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [emailId, setEmailId] = useState<string>('');
  const [reservedField, setReservedField] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [commDate, setCommDate] = useState<string>('');
  const [popName, setPopName] = useState<string>('');
  const [nasIp1, setNasIp1] = useState<string>('');
  const [switchIp1, setSwitchIp1] = useState<string>('');
  const [portNo1, setPortNo1] = useState<string>('');
  const [vlanId1, setVlanId1] = useState<string>('');
  const [primaryPop, setPrimaryPop] = useState<string>('');
  const [popName2, setPopName2] = useState<string>('');
  const [nasIp2, setNasIp2] = useState<string>('');
  const [switchIp2, setSwitchIp2] = useState<string>('');
  const [portNo2, setPortNo2] = useState<string>('');
  const [vlanId2, setVlanId2] = useState<string>('');
  const [backup, setBackup] = useState<string>('');
  const [usableIp, setUsableIp] = useState<string>('');
  const [subnetMask, setSubnetMask] = useState<string>('');
  const [gateway, setGateway] = useState<string>('');
  const [bandwidth, setBandwidth] = useState<string>('');
  const [salesPerson, setSalesPerson] = useState<string>('');
  const [testingFe, setTestingFe] = useState<string>('');
  const [device, setDevice] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [mrtg, setMrtg] = useState<string>('');

  // Hold “ckt” of the lead we’re currently editing (null if creating new)
  const [editingCkt, setEditingCkt] = useState<string | null>(null);

  // ─── on mount: fetch leads + auto-generate srNo ─────────────────────────────────
  useEffect(() => {
    fetchLeads('');
    generateNewSrNo();
  }, []);

  // Generate a new “Sr No” (e.g. timestamp). You can replace this scheme if needed.
  function generateNewSrNo() {
    setSrNo(Date.now().toString());
  }

  // ─── FETCH LEADS (either “all” or filtered by query) ─────────────────────────────
  async function fetchLeads(query: string) {
    setLoading(true);
    try {
      // Use API_BASE from env
      const resp = await fetch(`${API_BASE}/api/leads?q=${encodeURIComponent(query)}`);
      if (!resp.ok) throw new Error('Failed to fetch leads');
      const data: Lead[] = await resp.json();
      setAllLeads(data);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Could not load leads.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  // ─── RESET FORM (and re-generate a fresh Sr No) ─────────────────────────────────
  function resetForm() {
    generateNewSrNo();
    setCkt('');
    setCustName('');
    setAddress('');
    setEmailId('');
    setReservedField('');
    setContactName('');
    setCommDate('');
    setPopName('');
    setNasIp1('');
    setSwitchIp1('');
    setPortNo1('');
    setVlanId1('');
    setPrimaryPop('');
    setPopName2('');
    setNasIp2('');
    setSwitchIp2('');
    setPortNo2('');
    setVlanId2('');
    setBackup('');
    setUsableIp('');
    setSubnetMask('');
    setGateway('');
    setBandwidth('');
    setSalesPerson('');
    setTestingFe('');
    setDevice('');
    setRemarks('');
    setMrtg('');
    setEditingCkt(null);
  }

  // ─── CREATE OR UPDATE LEAD ON FORM SUBMIT ────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!ckt.trim()) {
      toast({
        title: 'Error',
        description: 'Circuit (ckt) is required.',
        variant: 'destructive'
      });
      return;
    }

    // Build payload
    const payload: Lead = {
      sr_no: srNo || Date.now().toString(),
      ckt: ckt.trim(),
      cust_name: custName || null,
      address: address || null,
      email_id: emailId || null,
      reserved_field: reservedField || null,
      contact_name: contactName || null,
      comm_date: commDate || null,
      pop_name: popName || null,
      nas_ip_1: nasIp1 || null,
      switch_ip_1: switchIp1 || null,
      port_no_1: portNo1 || null,
      vlan_id_1: vlanId1 || null,
      primary_pop: primaryPop || null,
      pop_name_2: popName2 || null,
      nas_ip_2: nasIp2 || null,
      switch_ip_2: switchIp2 || null,
      port_no_2: portNo2 || null,
      vlan_id_2: vlanId2 || null,
      backup: backup || null,
      usable_ip_address: usableIp || null,
      subnet_mask: subnetMask || null,
      gateway: gateway || null,
      bandwidth: bandwidth || null,
      sales_person: salesPerson || null,
      testing_fe: testingFe || null,
      device: device || null,
      remarks: remarks || null,
      mrtg: mrtg || null
    };

    try {
      let resp: Response;
      if (editingCkt) {
        // ── UPDATE MODE ─────────────────────────────────────────────
        resp = await fetch(
          `${API_BASE}/api/leads/${encodeURIComponent(editingCkt)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );
      } else {
        // ── CREATE MODE ─────────────────────────────────────────────
        resp = await fetch(`${API_BASE}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        const msg = (errBody as any).error || 'Failed to save lead';
        throw new Error(msg);
      }

      toast({
        title: 'Success',
        description: editingCkt ? 'Lead updated.' : 'Lead created.'
      });

      resetForm();
      fetchLeads('');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  }

  // ─── POPULATE FORM FOR EDIT ─────────────────────────────────────────────────────
  async function handleEdit(lead: Lead) {
    setEditingCkt(lead.ckt);
    setSrNo(lead.sr_no || '');
    setCkt(lead.ckt);
    setCustName(lead.cust_name || '');
    setAddress(lead.address || '');
    setEmailId(lead.email_id || '');
    setReservedField(lead.reserved_field || '');
    setContactName(lead.contact_name || '');
    setCommDate(lead.comm_date || '');
    setPopName(lead.pop_name || '');
    setNasIp1(lead.nas_ip_1 || '');
    setSwitchIp1(lead.switch_ip_1 || '');
    setPortNo1(lead.port_no_1 || '');
    setVlanId1(lead.vlan_id_1 || '');
    setPrimaryPop(lead.primary_pop || '');
    setPopName2(lead.pop_name_2 || '');
    setNasIp2(lead.nas_ip_2 || '');
    setSwitchIp2(lead.switch_ip_2 || '');
    setPortNo2(lead.port_no_2 || '');
    setVlanId2(lead.vlan_id_2 || '');
    setBackup(lead.backup || '');
    setUsableIp(lead.usable_ip_address || '');
    setSubnetMask(lead.subnet_mask || '');
    setGateway(lead.gateway || '');
    setBandwidth(lead.bandwidth || '');
    setSalesPerson(lead.sales_person || '');
    setTestingFe(lead.testing_fe || '');
    setDevice(lead.device || '');
    setRemarks(lead.remarks || '');
    setMrtg(lead.mrtg || '');
  }

  // ─── DELETE LEAD ───────────────────────────────────────────────────────────────
  async function handleDelete(cktToDelete: string) {
    if (!confirm(`Delete lead “${cktToDelete}” forever?`)) return;

    try {
      const resp = await fetch(
        `${API_BASE}/api/leads/${encodeURIComponent(cktToDelete)}`,
        { method: 'DELETE' }
      );
      if (!resp.ok) {
        throw new Error('Failed to delete lead');
      }
      toast({
        title: 'Deleted',
        description: `Lead ${cktToDelete} removed.`
      });
      if (editingCkt === cktToDelete) {
        resetForm();
      }
      fetchLeads('');
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Could not delete lead.',
        variant: 'destructive'
      });
    }
  }

  return (
    <Card className="max-w-5xl mx-auto mt-8 bg-white/80 backdrop-blur-lg border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          Manage Leads (Insert / Update / Delete)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ─── FORM ───────────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sr No */}
            <div className="space-y-2">
              <Label htmlFor="sr_no">Sr No</Label>
              <Input
                id="sr_no"
                value={srNo}
                onChange={(e) => setSrNo(e.target.value)}
                placeholder="Auto-generated (editable)"
              />
            </div>

            {/* Circuit (ckt) */}
            <div className="space-y-2">
              <Label htmlFor="ckt">Circuit (ckt) *</Label>
              <Input
                id="ckt"
                value={ckt}
                onChange={(e) => setCkt(e.target.value)}
                placeholder="ckt (required)"
                required
                disabled={!!editingCkt} // lock ckt when editing
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="cust_name">Customer Name</Label>
              <Input
                id="cust_name"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Customer Name"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                rows={2}
              />
            </div>

            {/* Email ID */}
            <div className="space-y-2">
              <Label htmlFor="email_id">Email ID</Label>
              <Input
                id="email_id"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            {/* Reserved Field */}
            <div className="space-y-2">
              <Label htmlFor="reserved_field">Reserved Field</Label>
              <Input
                id="reserved_field"
                value={reservedField}
                onChange={(e) => setReservedField(e.target.value)}
                placeholder="Reserved"
              />
            </div>

            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contact Name"
              />
            </div>

            {/* Comm Date */}
            <div className="space-y-2">
              <Label htmlFor="comm_date">Comm Date</Label>
              <Input
                id="comm_date"
                value={commDate}
                onChange={(e) => setCommDate(e.target.value)}
                placeholder="Communication Date"
              />
            </div>

            {/* POP Name */}
            <div className="space-y-2">
              <Label htmlFor="pop_name">POP Name</Label>
              <Input
                id="pop_name"
                value={popName}
                onChange={(e) => setPopName(e.target.value)}
                placeholder="POP Name"
              />
            </div>

            {/* NAS IP 1 */}
            <div className="space-y-2">
              <Label htmlFor="nas_ip_1">NAS IP 1</Label>
              <Input
                id="nas_ip_1"
                value={nasIp1}
                onChange={(e) => setNasIp1(e.target.value)}
                placeholder="NAS IP 1"
              />
            </div>

            {/* Switch IP 1 */}
            <div className="space-y-2">
              <Label htmlFor="switch_ip_1">Switch IP 1</Label>
              <Input
                id="switch_ip_1"
                value={switchIp1}
                onChange={(e) => setSwitchIp1(e.target.value)}
                placeholder="Switch IP 1"
              />
            </div>

            {/* Port No 1 */}
            <div className="space-y-2">
              <Label htmlFor="port_no_1">Port No 1</Label>
              <Input
                id="port_no_1"
                value={portNo1}
                onChange={(e) => setPortNo1(e.target.value)}
                placeholder="Port No 1"
              />
            </div>

            {/* VLAN ID 1 */}
            <div className="space-y-2">
              <Label htmlFor="vlan_id_1">VLAN ID 1</Label>
              <Input
                id="vlan_id_1"
                value={vlanId1}
                onChange={(e) => setVlanId1(e.target.value)}
                placeholder="VLAN ID 1"
              />
            </div>

            {/* Primary POP */}
            <div className="space-y-2">
              <Label htmlFor="primary_pop">Primary POP</Label>
              <Input
                id="primary_pop"
                value={primaryPop}
                onChange={(e) => setPrimaryPop(e.target.value)}
                placeholder="Primary POP"
              />
            </div>

            {/* POP Name 2 */}
            <div className="space-y-2">
              <Label htmlFor="pop_name_2">POP Name 2</Label>
              <Input
                id="pop_name_2"
                value={popName2}
                onChange={(e) => setPopName2(e.target.value)}
                placeholder="POP Name 2"
              />
            </div>

            {/* NAS IP 2 */}
            <div className="space-y-2">
              <Label htmlFor="nas_ip_2">NAS IP 2</Label>
              <Input
                id="nas_ip_2"
                value={nasIp2}
                onChange={(e) => setNasIp2(e.target.value)}
                placeholder="NAS IP 2"
              />
            </div>

            {/* Switch IP 2 */}
            <div className="space-y-2">
              <Label htmlFor="switch_ip_2">Switch IP 2</Label>
              <Input
                id="switch_ip_2"
                value={switchIp2}
                onChange={(e) => setSwitchIp2(e.target.value)}
                placeholder="Switch IP 2"
              />
            </div>

            {/* Port No 2 */}
            <div className="space-y-2">
              <Label htmlFor="port_no_2">Port No 2</Label>
              <Input
                id="port_no_2"
                value={portNo2}
                onChange={(e) => setPortNo2(e.target.value)}
                placeholder="Port No 2"
              />
            </div>

            {/* VLAN ID 2 */}
            <div className="space-y-2">
              <Label htmlFor="vlan_id_2">VLAN ID 2</Label>
              <Input
                id="vlan_id_2"
                value={vlanId2}
                onChange={(e) => setVlanId2(e.target.value)}
                placeholder="VLAN ID 2"
              />
            </div>

            {/* Backup */}
            <div className="space-y-2">
              <Label htmlFor="backup">Backup</Label>
              <Input
                id="backup"
                value={backup}
                onChange={(e) => setBackup(e.target.value)}
                placeholder="Backup"
              />
            </div>

            {/* Usable IP Address */}
            <div className="space-y-2">
              <Label htmlFor="usable_ip_address">Usable IP Address</Label>
              <Input
                id="usable_ip_address"
                value={usableIp}
                onChange={(e) => setUsableIp(e.target.value)}
                placeholder="Usable IP Address"
              />
            </div>

            {/* Subnet Mask */}
            <div className="space-y-2">
              <Label htmlFor="subnet_mask">Subnet Mask</Label>
              <Input
                id="subnet_mask"
                value={subnetMask}
                onChange={(e) => setSubnetMask(e.target.value)}
                placeholder="Subnet Mask"
              />
            </div>

            {/* Gateway */}
            <div className="space-y-2">
              <Label htmlFor="gateway">Gateway</Label>
              <Input
                id="gateway"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
                placeholder="Gateway"
              />
            </div>

            {/* Bandwidth */}
            <div className="space-y-2">
              <Label htmlFor="bandwidth">Bandwidth</Label>
              <Input
                id="bandwidth"
                value={bandwidth}
                onChange={(e) => setBandwidth(e.target.value)}
                placeholder="Bandwidth"
              />
            </div>

            {/* Sales Person */}
            <div className="space-y-2">
              <Label htmlFor="sales_person">Sales Person</Label>
              <Input
                id="sales_person"
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                placeholder="Sales Person"
              />
            </div>

            {/* Testing FE */}
            <div className="space-y-2">
              <Label htmlFor="testing_fe">Testing FE</Label>
              <Input
                id="testing_fe"
                value={testingFe}
                onChange={(e) => setTestingFe(e.target.value)}
                placeholder="Testing FE"
              />
            </div>

            {/* Device */}
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Input
                id="device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="Device"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks"
                rows={2}
              />
            </div>

            {/* MRTG */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="mrtg">MRTG</Label>
              <Textarea
                id="mrtg"
                value={mrtg}
                onChange={(e) => setMrtg(e.target.value)}
                placeholder="MRTG"
                rows={2}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              {editingCkt ? 'Update Lead' : 'Create Lead'}
            </Button>

            {editingCkt && (
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (editingCkt) handleDelete(editingCkt);
                }}
              >
                Delete Lead
              </Button>
            )}

            <Button type="button" variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
          </div>
        </form>

        {/* ─── LEAD TABLE ───────────────────────────────────────────────────────────────── */}
        <div className="mt-8">
          <Label htmlFor="search">Search Leads:</Label>
          <Input
            id="search"
            placeholder="Type to filter by ckt, customer, contact..."
            onChange={(e) => fetchLeads(e.target.value)}
          />

          <div className="overflow-x-auto mt-4">
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Sr No</th>
                  <th className="p-2 border">Ckt</th>
                  <th className="p-2 border">Customer</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Bandwidth</th>
                  <th className="p-2 border">Usable IP</th>
                  <th className="p-2 border">Device</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-2 border text-center" colSpan={9}>
                      Loading…
                    </td>
                  </tr>
                ) : allLeads.length === 0 ? (
                  <tr>
                    <td className="p-2 border text-center" colSpan={9}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  allLeads.map((lead) => (
                    <tr key={lead.ckt}>
                      <td className="p-2 border">{lead.sr_no || '—'}</td>
                      <td className="p-2 border">{lead.ckt}</td>
                      <td className="p-2 border">{lead.cust_name || '—'}</td>
                      <td className="p-2 border">{lead.contact_name || '—'}</td>
                      <td className="p-2 border">{lead.email_id || '—'}</td>
                      <td className="p-2 border">{lead.bandwidth || '—'}</td>
                      <td className="p-2 border">{lead.usable_ip_address || '—'}</td>
                      <td className="p-2 border">{lead.device || '—'}</td>
                      <td className="p-2 border">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(lead)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="ml-2 bg-red-500 hover:bg-red-600"
                          onClick={() => handleDelete(lead.ckt)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

