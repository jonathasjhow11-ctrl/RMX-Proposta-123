
export interface ProposalItem {
  id: string;
  desc: string;
  qty: number;
  unit: number;
  total: number;
}

export interface Proposal {
  id: string;
  number: string;
  date: string;
  client: string;
  contact: string;
  phone: string;
  address: string;
  items: ProposalItem[];
  delivery: string;
  payment: string;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'form' | 'preview';
