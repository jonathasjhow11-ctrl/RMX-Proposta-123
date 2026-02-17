
import { Proposal } from '../types';

const STORAGE_KEY = 'raimundix_proposals_v1';

export const storageService = {
  saveProposals: (proposals: Proposal[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  },
  
  getProposals: (): Proposal[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addProposal: (proposal: Proposal) => {
    const existing = storageService.getProposals();
    const updated = [proposal, ...existing];
    storageService.saveProposals(updated);
    return updated;
  },

  updateProposal: (proposal: Proposal) => {
    const existing = storageService.getProposals();
    const updated = existing.map(p => p.id === proposal.id ? proposal : p);
    storageService.saveProposals(updated);
    return updated;
  },

  deleteProposal: (id: string) => {
    const existing = storageService.getProposals();
    const updated = existing.filter(p => p.id !== id);
    storageService.saveProposals(updated);
    return updated;
  }
};
