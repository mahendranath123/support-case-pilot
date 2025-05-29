const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiLead {
  sr_no: string;
  ckt: string;
  cust_name: string;
  address: string;
  email_id: string;
  empty: string;
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
  timeSpent?: number;
  lastUpdated: string;
}

export interface ApiUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

// Lead API functions
export const searchLeads = async (query: string): Promise<ApiLead[]> => {
  const response = await fetch(`${API_BASE_URL}/leads?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search leads');
  }
  return response.json();
};

export const getLeadByCkt = async (ckt: string): Promise<ApiLead> => {
  const response = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(ckt)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lead details');
  }
  return response.json();
};

// Case API functions
export const getCases = async (): Promise<ApiCase[]> => {
  const response = await fetch(`${API_BASE_URL}/cases`);
  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  return response.json();
};

export const createCase = async (caseData: {
  leadCkt: string;
  ipAddress: string;
  connectivity: string;
  assignedDate: string;
  dueDate: string;
  caseRemarks: string;
  status: string;
}): Promise<{ id: number }> => {
  const response = await fetch(`${API_BASE_URL}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(caseData),
  });
  if (!response.ok) {
    throw new Error('Failed to create case');
  }
  return response.json();
};

export const updateCase = async (id: number, updates: Partial<ApiCase>): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update case');
  }
};

export const deleteCase = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete case');
  }
};

// Auth API functions
export const login = async (username: string, password: string): Promise<{ user: ApiUser; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  return response.json();
};

export const changePassword = async (userId: number, oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, oldPassword, newPassword }),
  });
  if (!response.ok) {
    throw new Error('Failed to change password');
  }
};

export const createUser = async (userData: {
  username: string;
  password: string;
  role: string;
}): Promise<{ id: number }> => {
  const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
};

export const getUsers = async (): Promise<ApiUser[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};
