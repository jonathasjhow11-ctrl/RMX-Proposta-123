
export type ProposalStatus = 'aberto' | 'em_andamento' | 'fechado' | 'cancelado';

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
  salesperson: string; // Novo campo: Vendedor / Responsável Comercial
  items: ProposalItem[];
  delivery: string;
  payment: string;
  status: ProposalStatus;
  lastFollowUp: number;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'form' | 'preview' | 'management';
