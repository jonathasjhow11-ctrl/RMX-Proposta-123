
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  X, 
  Edit, 
  FileText, 
  Loader2, 
  Zap,
  Share2,
  MessageCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  UserCheck,
  BellRing
} from 'lucide-react';
import { Proposal, ViewState, ProposalStatus } from './types';
import { RaimundixLogo } from './constants';
import { storageService } from './services/storageService';
import { StableInput, StableTextArea, Notification } from './components/UI';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = storageService.getProposals();
    const migrated = loaded.map(p => ({
      ...p,
      status: p.status || 'aberto',
      lastFollowUp: p.lastFollowUp || p.createdAt || Date.now(),
      salesperson: p.salesperson || ''
    }));
    setProposals(migrated);
    setLoading(false);
  }, []);

  const showNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const createNewProposal = () => {
    const newP: Proposal = {
      id: Math.random().toString(36).substr(2, 9),
      number: `RMX-${String(proposals.length + 1).padStart(5, '0')}`,
      date: new Date().toLocaleDateString('pt-BR'),
      client: '',
      contact: '',
      phone: '',
      address: '',
      salesperson: '',
      items: [{ id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }],
      delivery: 'Até 3 dias úteis',
      payment: 'Boleto para 10 DDL',
      status: 'aberto',
      lastFollowUp: Date.now(),
      createdAt: Date.now()
    };
    setCurrentProposal(newP);
    setView('form');
  };

  const handleSave = () => {
    if (!currentProposal || !currentProposal.client) {
      showNotif("O nome do cliente é obrigatório!");
      return;
    }

    const isUpdate = proposals.some(p => p.id === currentProposal.id);
    let updated;
    if (isUpdate) {
      updated = storageService.updateProposal(currentProposal);
    } else {
      updated = storageService.addProposal(currentProposal);
    }
    setProposals(updated);
    showNotif("Orçamento salvo!");
    setView('dashboard');
  };

  const updateStatus = (id: string, newStatus: ProposalStatus) => {
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      const updatedProposal = { ...proposal, status: newStatus, lastFollowUp: Date.now() };
      const updatedList = storageService.updateProposal(updatedProposal);
      setProposals(updatedList);
      showNotif(`Status: ${newStatus.replace('_', ' ')}`);
    }
  };

  const markFollowUp = (id: string) => {
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      const updatedProposal = { ...proposal, lastFollowUp: Date.now() };
      const updatedList = storageService.updateProposal(updatedProposal);
      setProposals(updatedList);
      showNotif("Follow-up registrado!");
    }
  };

  const stats = useMemo(() => {
    const active = proposals.filter(p => p.status === 'aberto' || p.status === 'em_andamento');
    const closed = proposals.filter(p => p.status === 'fechado');
    const calculateTotal = (list: Proposal[]) => 
      list.reduce((acc, p) => acc + p.items.reduce((sum, item) => sum + item.total, 0), 0);
    const followUpPending = active.filter(p => (Date.now() - p.lastFollowUp) / (1000 * 60 * 60 * 24) > 7);
    return {
      totalActive: calculateTotal(active),
      totalClosed: calculateTotal(closed),
      pendingCount: followUpPending.length,
      activeCount: active.length
    };
  }, [proposals]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const shareViaWhatsApp = (p: Proposal) => {
    const total = p.items.reduce((acc, i) => acc + i.total, 0);
    const text = `*⚡ ORÇAMENTO RAIMUNDIX - ${p.number}*\n\n` +
      `*CLIENTE:* ${p.client}\n` +
      `*VENDEDOR:* ${p.salesperson || 'Direto'}\n` +
      `*DATA:* ${p.date}\n` +
      `*VALOR TOTAL:* ${formatCurrency(total)}\n\n` +
      `*DETALHAMENTO:*\n` +
      p.items.map(i => `✅ ${i.qty}x ${i.desc}`).join('\n') +
      `\n\n*CONDIÇÕES:* ${p.delivery} | ${p.payment}\n\n` +
      `_Agradecemos a oportunidade!_\n` +
      `*RAIMUNDIX SOLUÇÕES EM ELÉTRICA*`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendFollowUpMessage = (p: Proposal) => {
    const text = `Olá *${p.client}*, tudo bem?\n\nAqui é o ${p.salesperson || 'responsável'} da *RAIMUNDIX Soluções em Elétrica*.\n\nGostaria de saber se você conseguiu avaliar o orçamento *${p.number}* que enviamos no dia ${p.date}.\n\nSeguimos à disposição para qualquer dúvida ou ajuste no escopo. Aguardamos seu retorno!\n\nAtenciosamente.`;
    const cleanPhone = p.phone.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const printProposal = (p: Proposal) => {
    const totalGeral = p.items.reduce((acc, i) => acc + (i.total || 0), 0);
    const itemsHtml = p.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #eee; font-size: 11px; white-space: pre-wrap;">${item.desc}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: center; font-size: 11px;">${item.qty}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: right; font-weight: bold; font-size: 11px;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Orcamento_${p.number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
          .header { background: #000; padding: 40px; color: #fff; text-align: center; border-bottom: 8px solid #facc15; }
          .header h1 { margin: 0; font-size: 42px; font-weight: 900; font-style: italic; text-transform: uppercase; }
          .header .sub { color: #facc15; text-transform: uppercase; letter-spacing: 4px; font-size: 10px; font-weight: 800; margin-top: 5px; }
          .content { padding: 40px; }
          .client-box { background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .item-table th { background: #000; color: #fff; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; }
          .total-row { background: #facc15; font-weight: 900; font-size: 20px; text-align: right; padding: 20px; border-radius: 12px; margin-top: 20px; }
          .footer { padding: 30px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; margin-top: 50px; }
          .sales-info { font-size: 10px; font-weight: bold; color: #94a3b8; margin-top: 10px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header"><h1>RAIMUNDIX</h1><div class="sub">Soluções em Elétrica</div></div>
        <div class="content">
          <div class="client-box">
            <div>
              <strong style="font-size: 18px; text-transform: uppercase;">${p.client}</strong><br>
              A/C: ${p.contact || '---'}<br>
              <div class="sales-info">Vendedor: ${p.salesperson || 'Responsável Direto'}</div>
            </div>
            <div style="text-align: right;">${p.phone}<br>Orçamento: <strong>${p.number}</strong><br>${p.date}</div>
          </div>
          <table class="item-table">
            <thead><tr><th>Descrição dos Serviços</th><th style="width: 50px; text-align: center;">Qtd</th><th style="width: 120px; text-align: right;">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total-row">INVESTIMENTO TOTAL: ${formatCurrency(totalGeral)}</div>
          <div style="margin-top: 30px; font-size: 12px; background: #fdfdfd; padding: 20px; border-radius: 12px; border: 1px solid #f1f1f1;">
            <strong>CONDIÇÕES GERAIS:</strong><br>
            • Prazo de Execução: ${p.delivery}<br>
            • Forma de Pagamento: ${p.payment}<br>
            • Validade da Proposta: 10 dias úteis
          </div>
        </div>
        <div class="footer">
          <strong>RAIMUNDIX SOLUÇÕES EM ELÉTRICA</strong> | CNPJ: 48.664.811/0001-13<br>
          Estrada Hiroshi Tobinaga, 183 - Suzano/SP • (11) 94742-1770
        </div>
        <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); };</script>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) { win.document.write(htmlContent); win.document.close(); }
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch(status) {
      case 'fechado': return 'bg-green-100 text-green-700 border-green-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-yellow-400 gap-4">
      <Loader2 className="animate-spin" size={48} />
      <span className="font-black text-xs uppercase tracking-widest italic">RAIMUNDIX Soluções em Elétrica</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {notif && <Notification message={notif} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-4 flex justify-around items-center z-[60] shadow-2xl rounded-t-[2.5rem] max-w-2xl mx-auto">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <Zap size={24} fill={view === 'dashboard' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-black uppercase">Início</span>
        </button>
        <button onClick={() => setView('management')} className={`flex flex-col items-center gap-1 ${view === 'management' ? 'text-zinc-900' : 'text-zinc-400'}`}>
          <BarChart3 size={24} />
          <span className="text-[10px] font-black uppercase">Gestão</span>
        </button>
        <button onClick={createNewProposal} className="bg-yellow-400 text-zinc-900 p-4 rounded-full -mt-12 shadow-xl border-4 border-white active:scale-90 transition-transform">
          <Plus size={28} strokeWidth={4} />
        </button>
      </nav>

      {view === 'dashboard' && (
        <div className="max-w-2xl mx-auto">
          <header className="bg-zinc-900 text-white pt-16 pb-24 px-8 rounded-b-[4rem] border-b-8 border-yellow-400 relative shadow-2xl overflow-hidden text-center">
            <div className="mb-6 flex justify-center scale-110"><RaimundixLogo size={80} /></div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-1 uppercase">RAIMUNDIX</h1>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Soluções em Elétrica</p>
          </header>

          <div className="px-6 -mt-10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 text-center">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Negociações</h3>
                <p className="text-xl font-black text-zinc-900 leading-tight">{formatCurrency(stats.totalActive)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 text-center">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Faturado</h3>
                <p className="text-xl font-black text-green-600 leading-tight">{formatCurrency(stats.totalClosed)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Últimos Orçamentos</h2>
              </div>
              {proposals.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-zinc-200">
                  <FileText className="mx-auto text-zinc-200 mb-4" size={48} />
                  <p className="text-zinc-400 font-bold italic">Toque no + para iniciar.</p>
                </div>
              ) : (
                proposals.slice(0, 8).map(p => (
                  <div key={p.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-zinc-100 flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.99]">
                    <div className="flex-1 overflow-hidden" onClick={() => { setCurrentProposal(p); setView('preview'); }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${getStatusColor(p.status)}`}>
                          {p.status.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-300 uppercase italic">{p.number}</span>
                      </div>
                      <h3 className="font-black text-zinc-800 uppercase truncate mb-1">{p.client}</h3>
                      <p className="text-sm font-black text-zinc-900">{formatCurrency(p.items.reduce((a, b) => a + b.total, 0))}</p>
                    </div>
                    <button onClick={() => { setCurrentProposal(p); setView('form'); }} className="p-3 bg-zinc-50 text-zinc-400 rounded-xl"><Edit size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'management' && (
        <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-zinc-900 p-3 rounded-2xl text-yellow-400 shadow-lg"><BarChart3 size={24} /></div>
            <div>
              <h1 className="text-2xl font-black italic text-zinc-900">PAINEL COMERCIAL</h1>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Controle RAIMUNDIX</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative border-b-4 border-yellow-400">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><TrendingUp size={120} /></div>
              <div className="relative z-10">
                <h3 className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Total em Aberto</h3>
                <p className="text-4xl font-black italic">{formatCurrency(stats.totalActive)}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400">
                  <Clock size={12} /> {stats.activeCount} negociações ativas
                </div>
              </div>
            </div>

            {stats.pendingCount > 0 && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-center gap-4 border-l-8 border-l-red-500">
                <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg animate-pulse"><BellRing size={24} /></div>
                <div>
                  <p className="text-red-900 font-black text-xs uppercase">Alerta de Follow-up</p>
                  <p className="text-red-700 text-[10px] font-bold uppercase">{stats.pendingCount} Clientes aguardando retorno há mais de 7 dias.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest px-2">Pipeline de Vendas</h2>
            {proposals.filter(p => p.status !== 'cancelado').map(p => {
              const daysSinceFollowUp = Math.floor((Date.now() - p.lastFollowUp) / (1000 * 60 * 60 * 24));
              const isAlert = daysSinceFollowUp > 7 && (p.status === 'aberto' || p.status === 'em_andamento');

              return (
                <div key={p.id} className={`bg-white rounded-[2.5rem] p-6 shadow-sm border transition-all ${isAlert ? 'border-red-200 bg-red-50/20' : 'border-zinc-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-black text-zinc-900 uppercase truncate mb-1">{p.client}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">{p.number}</span>
                        <span>{formatCurrency(p.items.reduce((a,b)=>a+b.total,0))}</span>
                      </div>
                    </div>
                    <select 
                      value={p.status} 
                      onChange={(e) => updateStatus(p.id, e.target.value as ProposalStatus)}
                      className={`text-[9px] font-black uppercase py-2 px-3 rounded-xl border-2 outline-none appearance-none cursor-pointer ${getStatusColor(p.status)}`}
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em Obra</option>
                      <option value="fechado">Fechado</option>
                      <option value="cancelado">Perdido</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={12} className={isAlert ? 'text-red-500' : 'text-zinc-300'} />
                          <span className={`text-[10px] font-bold ${isAlert ? 'text-red-600 font-black' : 'text-zinc-400'}`}>
                            {daysSinceFollowUp === 0 ? 'Atualizado hoje' : `${isAlert ? 'ATRASADO:' : ''} Há ${daysSinceFollowUp} dias`}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Vendedor: {p.salesperson || 'Direto'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => sendFollowUpMessage(p)}
                          className="bg-green-600 text-white p-3 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                          title="Enviar Mensagem de Follow-up"
                        >
                          <MessageCircle size={18} />
                        </button>
                        {(p.status === 'aberto' || p.status === 'em_andamento') && (
                          <button 
                            onClick={() => markFollowUp(p.id)}
                            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${isAlert ? 'bg-red-500 text-white shadow-lg' : 'bg-zinc-100 text-zinc-500'}`}
                          >
                            Registrar Contato
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'form' && currentProposal && (
        <div className="max-w-2xl mx-auto bg-slate-50 min-h-screen pb-48 animate-in slide-in-from-right duration-500">
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-6 border-b z-[70] flex items-center justify-between shadow-sm">
            <button onClick={() => setView('dashboard')} className="p-3 bg-zinc-100 text-zinc-500 rounded-2xl"><ArrowLeft size={20} /></button>
            <div className="text-center">
              <h2 className="font-black italic text-zinc-800 text-lg uppercase tracking-tighter">Novo Orçamento</h2>
              <p className="text-[10px] font-bold text-yellow-500 tracking-widest">{currentProposal.number}</p>
            </div>
            <button onClick={handleSave} className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg">SALVAR</button>
          </div>
          
          <div className="p-6 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-yellow-400 font-black">1</div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Identificação da Proposta</h3>
              </div>
              <div className="space-y-2">
                <StableInput label="Cliente / Razão Social" value={currentProposal.client} onChange={v => setCurrentProposal({...currentProposal, client: v})} placeholder="Ex: Maria Oliveira ou Construtora X" />
                <div className="grid grid-cols-2 gap-4">
                  <StableInput label="Responsável Comercial" value={currentProposal.salesperson} onChange={v => setCurrentProposal({...currentProposal, salesperson: v})} placeholder="Nome do Vendedor" />
                  <StableInput label="Contato Direto (A/C)" value={currentProposal.contact} onChange={v => setCurrentProposal({...currentProposal, contact: v})} placeholder="Pessoa de contato" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <StableInput label="WhatsApp / Telefone" value={currentProposal.phone} onChange={v => setCurrentProposal({...currentProposal, phone: v})} placeholder="(00) 00000-0000" />
                </div>
                <StableTextArea label="Local da Prestação do Serviço" value={currentProposal.address} onChange={v => setCurrentProposal({...currentProposal, address: v})} placeholder="Endereço da obra" />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-yellow-400 font-black">2</div>
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Descrição Técnica</h3>
                </div>
                <button onClick={() => setCurrentProposal({ ...currentProposal, items: [...currentProposal.items, { id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }] })} className="bg-yellow-400 text-zinc-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-2">
                  <Plus size={14} strokeWidth={4} /> ADICIONAR ITEM
                </button>
              </div>

              <div className="space-y-6">
                {currentProposal.items.map((item, idx) => (
                  <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 relative shadow-sm">
                    {currentProposal.items.length > 1 && (
                      <button onClick={() => setCurrentProposal({ ...currentProposal, items: currentProposal.items.filter(i => i.id !== item.id) })} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg"><X size={16} /></button>
                    )}
                    <StableTextArea label={`Item #${idx+1} - Descrição do Serviço`} value={item.desc} onChange={v => {
                      const n = currentProposal.items.map(i => i.id === item.id ? {...i, desc: v} : i);
                      setCurrentProposal({...currentProposal, items: n});
                    }} placeholder="Ex: Instalação de quadro elétrico completo..." rows={4} />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <StableInput label="Quantidade" type="number" value={item.qty} onChange={v => {
                        const q = parseFloat(v) || 0;
                        const n = currentProposal.items.map(i => i.id === item.id ? {...i, qty: q, total: q * i.unit} : i);
                        setCurrentProposal({...currentProposal, items: n});
                      }} />
                      <StableInput label="Valor Unit. (R$)" type="number" value={item.unit} onChange={v => {
                        const u = parseFloat(v) || 0;
                        const n = currentProposal.items.map(i => i.id === item.id ? {...i, unit: u, total: item.qty * u} : i);
                        setCurrentProposal({...currentProposal, items: n});
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-yellow-400 font-black">3</div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Prazos e Pagamento</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StableInput label="Prazo de Entrega/Execução" value={currentProposal.delivery} onChange={v => setCurrentProposal({...currentProposal, delivery: v})} placeholder="Ex: 5 dias úteis" />
                <StableInput label="Condições de Pagamento" value={currentProposal.payment} onChange={v => setCurrentProposal({...currentProposal, payment: v})} placeholder="Ex: 50% entrada e 50% entrega" />
              </div>
            </section>
          </div>

          <div className="fixed bottom-24 left-6 right-6 p-6 bg-zinc-900 text-white flex items-center justify-between rounded-[2rem] shadow-2xl z-40 border-t-4 border-yellow-400">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-yellow-400 uppercase">Investimento Estimado</span>
              <span className="text-2xl font-black italic tracking-tighter">{formatCurrency(currentProposal.items.reduce((a,b)=>a+b.total,0))}</span>
            </div>
            <button onClick={handleSave} className="bg-yellow-400 text-zinc-900 px-8 py-4 rounded-2xl font-black shadow-xl uppercase text-xs">FINALIZAR</button>
          </div>
        </div>
      )}

      {view === 'preview' && currentProposal && (
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center pb-32 duration-500 animate-in fade-in">
          <div className="w-full bg-black/80 backdrop-blur-md p-6 flex justify-between items-center sticky top-0 z-[70] border-b border-white/5">
            <button onClick={() => setView('dashboard')} className="text-white font-black flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-xl transition-colors hover:bg-white/10"><ArrowLeft size={18} /> VOLTAR</button>
            <div className="flex items-center gap-2">
              <button onClick={() => shareViaWhatsApp(currentProposal)} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl hover:bg-green-700 transition-all"><MessageCircle size={16} /> WHATSAPP</button>
              <button onClick={() => printProposal(currentProposal)} className="bg-yellow-400 text-zinc-900 px-5 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl hover:bg-yellow-500 transition-all"><Printer size={16} /> PDF / PRINT</button>
            </div>
          </div>
          
          <div className="p-4 w-full max-w-2xl mt-4">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center border-t-[10px] border-yellow-400 relative overflow-hidden">
               <div className="mb-8 flex flex-col items-center text-center">
                 <div className="mb-4 bg-zinc-900 p-4 rounded-3xl shadow-lg"><RaimundixLogo size={80} /></div>
                 <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 uppercase leading-none">RAIMUNDIX</h2>
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-2 text-center">Soluções em Elétrica</p>
               </div>

               <div className="w-full space-y-6 border-t-2 border-zinc-100 pt-8">
                 <div className="flex justify-between items-start">
                   <div className="flex-1 overflow-hidden pr-4">
                     <p className="text-[9px] font-black text-zinc-300 uppercase">Cliente</p>
                     <p className="text-xl font-black italic text-zinc-900 uppercase leading-tight truncate">{currentProposal.client}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <UserCheck size={12} className="text-yellow-500" />
                        <span className="text-[9px] font-black uppercase text-zinc-400">Vendedor: {currentProposal.salesperson || 'Direto'}</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] font-black text-zinc-300 uppercase">Nº Orçamento</p>
                     <p className="text-xl font-black italic text-yellow-600 leading-tight">{currentProposal.number}</p>
                     <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">{currentProposal.date}</p>
                   </div>
                 </div>

                 <div className="bg-zinc-900 rounded-[2rem] p-8 text-center shadow-xl border-b-4 border-yellow-400">
                    <h3 className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Investimento Total da Proposta</h3>
                    <p className="text-4xl font-black italic text-yellow-400 leading-none tracking-tighter">{formatCurrency(currentProposal.items.reduce((a,b)=>a+b.total,0))}</p>
                 </div>

                 <div className="space-y-4">
                   <p className="text-[9px] font-black text-zinc-300 uppercase border-b pb-2 tracking-widest">Resumo dos Itens</p>
                   {currentProposal.items.map(i => (
                     <div key={i.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-zinc-100">
                       <span className="bg-zinc-900 text-yellow-400 font-black text-[10px] px-2 py-0.5 rounded-lg h-5 flex items-center">{i.qty}x</span>
                       <div className="flex-1">
                         <p className="text-xs font-bold text-zinc-700 leading-relaxed whitespace-pre-wrap">{i.desc}</p>
                         <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase">{formatCurrency(i.total)}</p>
                       </div>
                     </div>
                   ))}
                 </div>

                 <div className="grid grid-cols-2 gap-4 border-t pt-6">
                   <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[9px] font-black text-zinc-300 uppercase mb-1">Prazo</p>
                     <p className="text-xs font-bold text-zinc-800">{currentProposal.delivery}</p>
                   </div>
                   <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[9px] font-black text-zinc-300 uppercase mb-1 text-right">Pagamento</p>
                     <p className="text-xs font-bold text-zinc-800 text-right">{currentProposal.payment}</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
