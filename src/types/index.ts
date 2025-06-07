// src/types/index.ts

export interface Lead {
  sr_no: string;
  ckt: string;            // Lead number
  cust_name: string;      // Company name
  address: string;
  email_id: string;
  reserved_field: string; // was “empty” before—matches ApiLead
  contact_name: string;
  comm_date: string;
  pop_name: string;
  nas_ip_1: string;
  switch_ip_1: string;
  port_no_1: string;
  vlan_id_1: string;
  primary_pop: string;
  pop_name_2: string;
  nas_ip_2: string;
  switch_ip_2: string;
  port_no_2: string;
  vlan_id_2: string;
  backup: string;
  usable_ip_address: string;
  subnet_mask: string;
  gateway: string;
  bandwidth: string;
  sales_person: string;
  testing_fe: string;
  device: string;
  remarks: string;
  mrtg: string;
}

export interface Case {
  id: number;
  leadCkt: string;
  ipAddress: string;
  connectivity: "Stable" | "Unstable" | "Unknown";
  assignedDate: string;    // ISO string from backend
  dueDate: string;         // ISO string from backend
  caseRemarks: string;
  status: "Pending" | "Overdue" | "Completed" | "OnHold";
  createdAt: string;       // ISO string from backend
  lastUpdated: string;     // ISO string from backend
  timeSpent?: number;      // Time spent in minutes (optional)

  //
  // ─── New assignment fields ───────────────────────────────────────────────────
  //

  // Numeric user‐ID of who this case is assigned to (or null if unassigned)
  assignedTo?: number | null;

  // Username of the assignee (populated by the API JOIN); if unassigned, null
  assignedToUser?: string | null;

  createdBy: number;       // user‐ID who originally created this case
  createdByUser: string;   // username of that creator
  device?: string;         // optional device field
  companyName?: string;    // optional company name (JOINed from LeadDemoData)
  lead?: Lead;             // if you ever populate the full Lead object
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  createdAt: string;       // ISO string from backend
}

