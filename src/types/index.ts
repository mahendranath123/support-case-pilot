
export interface Lead {
  sr_no: string;
  ckt: string; // Lead number
  cust_name: string; // Company name
  address: string;
  email_id: string;
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
  id: string;
  leadCkt: string;
  ipAddress: string;
  connectivity: "Stable" | "Unstable" | "Unknown";
  assignedDate: Date;
  dueDate: Date;
  caseRemarks: string;
  status: "Pending" | "Overdue" | "Completed" | "OnHold";
  lead?: Lead;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  createdAt: Date;
}
