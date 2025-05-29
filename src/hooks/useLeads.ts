
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchLeads, ApiLead } from '../services/api';
import { Lead } from '../types';

// Convert API lead to frontend lead format
const convertApiLeadToLead = (apiLead: ApiLead): Lead => ({
  sr_no: apiLead.sr_no,
  ckt: apiLead.ckt,
  cust_name: apiLead.cust_name,
  address: apiLead.address,
  email_id: apiLead.email_id,
  contact_name: apiLead.contact_name,
  comm_date: apiLead.comm_date,
  pop_name: apiLead.pop_name,
  nas_ip_1: apiLead.nas_ip_1,
  switch_ip_1: apiLead.switch_ip_1,
  port_no_1: apiLead.port_no_1,
  vlan_id_1: apiLead.vlan_id_1,
  primary_pop: apiLead.primary_pop,
  pop_name_2: apiLead.pop_name_2,
  nas_ip_2: apiLead.nas_ip_2,
  switch_ip_2: apiLead.switch_ip_2,
  port_no_2: apiLead.port_no_2,
  vlan_id_2: apiLead.vlan_id_2,
  backup: apiLead.backup,
  usable_ip_address: apiLead.usable_ip_address,
  subnet_mask: apiLead.subnet_mask,
  gateway: apiLead.gateway,
  bandwidth: apiLead.bandwidth,
  sales_person: apiLead.sales_person,
  testing_fe: apiLead.testing_fe,
  device: apiLead.device,
  remarks: apiLead.remarks,
  mrtg: apiLead.mrtg,
});

export const useLeadSearch = (query: string) => {
  return useQuery({
    queryKey: ['leads', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const apiLeads = await searchLeads(query);
      return apiLeads.map(convertApiLeadToLead);
    },
    enabled: query.length >= 2,
  });
};

export const useLeads = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data = [], isLoading: isSearching } = useQuery({
    queryKey: ['leads', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const apiLeads = await searchLeads(searchQuery);
      return apiLeads.map(convertApiLeadToLead);
    },
    enabled: searchQuery.length >= 2,
  });

  const searchLeads = (query: string) => {
    setSearchQuery(query);
  };

  return {
    data,
    searchLeads,
    isSearching
  };
};
