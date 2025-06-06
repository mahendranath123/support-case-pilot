// src/services/api.ts

import { User } from "@/contexts/AuthContext";

const API_BASE_URL = "http://103.127.117.182:3001/api";

export interface ApiLead {
  sr_no: string;
  ckt: string;
  cust_name: string;
  address: string;
  email_id: string;
  reserved_field: string;
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

// ─── ApiCase now includes “assignedToUser” instead of “assignedBy” ───────────────────────
export interface ApiCase {
  id: number;
  leadCkt: string;
  ipAddress: string;
  connectivity: string;
  assignedDate: string;
  dueDate: string;
  caseRemarks: string;
  status: string;
  createdAt: string;
  lastUpdated: string;
  timeSpent?: number;

  // ─── “assignedToUser” field returned by the API (username of assignee) ───────────────
  assignedToUser?: string | null;

  createdBy: number;
  createdByUser: string;
  device?: string;
  companyName?: string;
}

export interface ApiUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

// Utility to build role‐based headers (x-user-id, x-user-role)
function buildAuthHeaders(user: User | null): Record<string, string> {
  if (!user) return {};
  return {
    "x-user-id": String(user.id),
    "x-user-role": user.role,
  };
}

// ─── Leads ─────────────────────────────────────────────────────────────────────

export const searchLeads = async (query: string): Promise<ApiLead[]> => {
  const response = await fetch(
    `${API_BASE_URL}/leads?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error("Failed to search leads");
  return response.json();
};

export const getLeadByCkt = async (ckt: string): Promise<ApiLead> => {
  const response = await fetch(
    `${API_BASE_URL}/leads/${encodeURIComponent(ckt)}`
  );
  if (!response.ok) throw new Error("Failed to fetch lead details");
  return response.json();
};

// ─── Cases ─────────────────────────────────────────────────────────────────────

export const getCases = async (user: User | null): Promise<ApiCase[]> => {
  const headers = buildAuthHeaders(user);
  const response = await fetch(`${API_BASE_URL}/cases`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch cases");
  return response.json();
};

// ─── CreateCasePayload now includes “assignedTo” (a numeric user ID) ───────────────
interface CreateCasePayload {
  leadCkt: string;
  ipAddress: string | null;
  connectivity: string;
  assignedDate: string;
  dueDate: string;
  caseRemarks: string | null;
  status: string;
  timeSpent: number;
  device?: string | null;

  // ─── “assignedTo” is the numeric user ID (or null if unassigned) ─────────────────
  assignedTo: number | null;
}

/**
 * Create a new case.
 * Backend requires x-user-id and x-user-role headers to know who is creating it.
 */
export const createCase = async (
  caseData: CreateCasePayload,
  user: User | null
): Promise<ApiCase> => {
  const headers = buildAuthHeaders(user);
  const response = await fetch(`${API_BASE_URL}/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(caseData),
  });
  if (!response.ok) throw new Error("Failed to create case");
  return response.json();
};

export const updateCase = async (
  id: number,
  updates: Partial<
    Pick<ApiCase, "status" | "caseRemarks" | "timeSpent" | "device" | "assignedToUser">
  > & { assignedTo?: number | null },
  user: User | null
): Promise<ApiCase> => {
  const headers = buildAuthHeaders(user);
  const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update case");
  return response.json();
};

export const deleteCase = async (id: number, user: User | null): Promise<void> => {
  const headers = buildAuthHeaders(user);
  const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete case");
};

// ─── Auth / Users ───────────────────────────────────────────────────────────────

export const login = async (
  username: string,
  password: string
): Promise<{ user: ApiUser }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
};

export const getUsers = async (user: User | null): Promise<ApiUser[]> => {
  const headers = buildAuthHeaders(user);
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

interface CreateUserPayload {
  username: string;
  password: string;
  role: string;
}

export const createUser = async (
  userData: CreateUserPayload,
  currentUser: User | null
): Promise<ApiUser> => {
  const headers = buildAuthHeaders(currentUser);
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
};

interface UpdateUserPayload {
  username?: string;
  password?: string;
  role?: string;
}

export const updateUser = async (
  id: number,
  updates: UpdateUserPayload,
  currentUser: User | null
): Promise<ApiUser> => {
  const headers = buildAuthHeaders(currentUser);
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

export const deleteUser = async (id: number, currentUser: User | null): Promise<void> => {
  const headers = buildAuthHeaders(currentUser);
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) throw new Error("Failed to delete user");
};

