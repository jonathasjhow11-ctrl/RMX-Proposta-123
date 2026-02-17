
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Printer, ArrowLeft, X, Edit, FileText, Loader2, Zap,
  Share2, MessageCircle, BarChart3, Calendar, CheckCircle2, Clock,
  AlertCircle, TrendingUp, ChevronRight, UserCheck, BellRing, Download,
  Eye, Trophy, History, Ban, FileDown, Share
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
  const [generating, setGenerating] = useState(false);

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
      client: '', contact: '', phone: '', address: '', salesperson: '',
      items: [{ id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }],
      delivery: 'Até 3 dias úteis', payment: 'Boleto para 10 DDL',
      status: 'aberto', lastFollowUp: Date.now(), createdAt: Date.now()
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
    const updated = isUpdate ? storageService.updateProposal(currentProposal) : storageService.addProposal(currentProposal);
    setProposals(updated);
    showNotif("Orçamento salvo!");
    setView('dashboard');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

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
      counts: {
        aberto: proposals.filter(p => p.status === 'aberto').length,
        em_andamento: proposals.filter(p => p.status === 'em_andamento').length,
        fechado: proposals.filter(p => p.status === 'fechado').length,
        cancelado: proposals.filter(p => p.status === 'cancelado').length,
      }
    };
  }, [proposals]);

  const getProposalHtml = (p: Proposal) => {
    const totalGeral = p.items.reduce((acc, i) => acc + (i.total || 0), 0);
    const itemsHtml = p.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #eee; font-size: 11px;">${item.desc}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: center;">${item.qty}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');

    return `
      <div style="padding: 20px; font-family: 'Inter', sans-serif; background: #fff;">
        <div style="background: #000; color: #fff; padding: 30px; text-align: center; border-bottom: 6px solid #facc15;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 900; font-style: italic;">RAIMUNDIX</h1>
          <p style="margin: 5px 0 0; font-size: 10px; letter-spacing: 3px; font-weight: 800; color: #facc15;">SOLUÇÕES EM ELÉTRICA</p>
        </div>
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <p style="font-size: 10px; color: #999; margin: 0;">CLIENTE</p>
              <p style="font-size: 16px; font-weight: 800; margin: 0; text-transform: uppercase;">${p.client}</p>
              <p style="font-size: 11px; margin: 5px 0 0;">A/C: <strong>${p.contact || 'Responsável'}</strong></p>
              <p style="font-size: 11px; margin: 2px 0 0;">Vendedor: <strong>${p.salesperson || 'Direto'}</strong></p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #999; margin: 0;">PROPOSTA</p>
              <p style="font-size: 16px; font-weight: 800; margin: 0; color: #b45309;">${p.number}</p>
              <p style="font-size: 11px; margin: 5px 0 0;">${p.date}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead><tr style="background: #000; color: #fff; font-size: 10px; text-transform: uppercase;">
              <th style="padding: 10px; text-align: left;">Descrição do Serviço</th>
              <th style="padding: 10px; width: 50px;">Qtd</th>
              <th style="padding: 10px; text-align: right; width: 100px;">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="background: #facc15; padding: 15px; text-align: right; font-weight: 900; font-size: 18px; border-radius: 8px;">
            INVESTIMENTO TOTAL: ${formatCurrency(totalGeral)}
          </div>
          <div style="margin-top: 30px; font-size: 11px; color: #444; background: #fafafa; padding: 15px; border-radius: 8px;">
            <p><strong>CONDIÇÕES GERAIS:</strong></p>
            <p>• Prazo de Entrega: ${p.delivery}</p>
            <p>• Forma de Pagamento: ${p.payment}</p>
            <p>• Validade da Proposta: 10 dias úteis</p>
          </div>
        </div>
      </div>
    `;
  };

  const handleSharePDF = async (p: Proposal, mode: 'save' | 'share' = 'share') => {
    if (!p) return;
    setGenerating(true);
    showNotif("Preparando arquivo...");

    const element = document.createElement('div');
    element.innerHTML = getProposalHtml(p);
    element.style.width = '210mm';

    const opt = {
      margin: 0,
      filename: `Orcamento_${p.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      const worker = html2pdf().set(opt).from(element);
      
      if (mode === 'save') {
        await worker.save();
        showNotif("Salvo com sucesso!");
      } else {
        const pdfBlob = await worker.output('blob');
        const file = new File([pdfBlob], `Orcamento_${p.number}.pdf`, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Orçamento Raimundix - ${p.number}`,
            text: `Olá ${p.client}, segue o orçamento solicitado.`
          });
        } else {
          await worker.save();
          showNotif("Salvo localmente (Share não suportado)");
        }
      }
    } catch (err) {
      showNotif("Erro ao gerar PDF");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const sendFollowUpMessage = (p: Proposal) => {
    const text = `Olá *${p.client}*, tudo bem?\n\nAqui é o ${p.salesperson || 'responsável'} da *RAIMUNDIX Soluções em Elétrica*.\n\nGostaria de saber se você conseguiu avaliar o orçamento *${p.number}*.\n\nSeguimos à disposição!`;
    const cleanPhone = p.phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(text)}`, '_blank');
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
      <span className="font-black text-[10px] uppercase tracking-widest italic">RAIMUNDIX Soluções</span>
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
          <header className="bg-zinc-900 text-white pt-16 pb-24 px-8 rounded-b-[4rem] border-b-8 border-yellow-400 relative shadow-2xl text-center">
            <div className="mb-6 flex justify-center"><RaimundixLogo size={80} /></div>
            <h1 className="text-4xl font-black italic tracking-tighter mb-1 uppercase">RAIMUNDIX</h1>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Soluções em Elétrica</p>
          </header>

          <div className="px-6 -mt-10 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 text-center">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Em Aberto</h3>
                <p className="text-xl font-black text-zinc-900">{formatCurrency(stats.totalActive)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 text-center">
                <h3 className="text-[10px] font-black text-zinc-400 uppercase mb-1 tracking-widest">Faturado</h3>
                <p className="text-xl font-black text-green-600">{formatCurrency(stats.totalClosed)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest px-2">Recentes</h2>
              {proposals.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-zinc-200 text-zinc-400 font-bold italic">Toque no + para iniciar.</div>
              ) : (
                proposals.slice(0, 5).map(p => (
                  <div key={p.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-zinc-100 flex items-center gap-4 active:scale-[0.98] transition-all" onClick={() => { setCurrentProposal(p); setView('preview'); }}>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase border ${getStatusColor(p.status)}`}>{p.status}</span>
                        <span className="text-[9px] font-bold text-zinc-300 italic">{p.number}</span>
                      </div>
                      <h3 className="font-black text-zinc-800 uppercase truncate">{p.client}</h3>
                      <p className="text-sm font-black text-zinc-900">{formatCurrency(p.items.reduce((a, b) => a + b.total, 0))}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setCurrentProposal(p); setView('form'); }} className="p-3 bg-zinc-50 text-slate-500 rounded-xl"><Edit size={18} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'management' && (
        <div className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 p-3 rounded-2xl text-yellow-400 shadow-lg"><BarChart3 size={24} /></div>
            <div>
              <h1 className="text-2xl font-black italic text-zinc-900 uppercase">Gestão Comercial</h1>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest tracking-tighter">Status e Performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Abertos', count: stats.counts.aberto, icon: Clock, color: 'text-yellow-500' },
              { label: 'Em Obra', count: stats.counts.em_andamento, icon: Zap, color: 'text-blue-500' },
              { label: 'Fechados', count: stats.counts.fechado, icon: Trophy, color: 'text-green-500' },
              { label: 'Perdidos', count: stats.counts.cancelado, icon: Ban, color: 'text-red-400' }
            ].map((st, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                <st.icon size={16} className={`${st.color} mb-2`} />
                <h4 className="text-[9px] font-black text-zinc-400 uppercase">{st.label}</h4>
                <p className="text-xl font-black text-zinc-900 leading-none mt-1">{st.count}</p>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden border-b-8 border-yellow-400">
            <TrendingUp size={120} className="absolute top-0 right-0 p-8 opacity-10 rotate-12" />
            <div className="relative z-10">
              <h3 className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Previsão de Receita (Ativos)</h3>
              <p className="text-4xl font-black italic">{formatCurrency(stats.totalActive)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest px-2">Pipeline Ativo</h2>
            {proposals.map(p => (
              <div key={p.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-zinc-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-black text-zinc-900 uppercase truncate">{p.client}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
                      <span>{p.number}</span> • <span>{formatCurrency(p.items.reduce((a,b)=>a+b.total,0))}</span>
                    </div>
                  </div>
                  <select 
                    value={p.status} 
                    onChange={(e) => {
                      const updated = proposals.map(prop => prop.id === p.id ? {...prop, status: e.target.value as ProposalStatus, lastFollowUp: Date.now()} : prop);
                      storageService.saveProposals(updated);
                      setProposals(updated);
                    }}
                    className={`text-[9px] font-black uppercase py-2 px-3 rounded-xl border-2 ${getStatusColor(p.status)}`}
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Obra</option>
                    <option value="fechado">Fechado</option>
                    <option value="cancelado">Perdido</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <span className="text-[10px] font-black text-zinc-400 uppercase">A/C: {p.contact || 'Direto'}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrentProposal(p); setView('form'); }} className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Edit size={18} /></button>
                    <button onClick={() => sendFollowUpMessage(p)} className="p-2 bg-green-500 text-white rounded-xl shadow-lg"><MessageCircle size={18} /></button>
                    <button onClick={() => handleSharePDF(p)} className="p-2 bg-blue-500 text-white rounded-xl shadow-lg"><Share size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'form' && currentProposal && (
        <div className="max-w-2xl mx-auto bg-slate-50 min-h-screen pb-48 animate-in slide-in-from-right duration-500">
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-6 border-b z-[70] flex items-center justify-between shadow-sm">
            <button onClick={() => setView('dashboard')} className="p-3 bg-zinc-100 text-zinc-500 rounded-2xl"><ArrowLeft size={20} /></button>
            <div className="text-center">
              <h2 className="font-black italic text-zinc-800 text-lg uppercase tracking-tighter">Proposta Comercial</h2>
              <p className="text-[10px] font-bold text-yellow-500 tracking-widest">{currentProposal.number}</p>
            </div>
            <button onClick={handleSave} className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg uppercase">SALVAR</button>
          </div>
          
          <div className="p-6 space-y-12">
            <section className="space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1 mb-2">Dados do Cliente</h3>
              <StableInput label="Cliente / Empresa" value={currentProposal.client} onChange={v => setCurrentProposal({...currentProposal, client: v})} placeholder="Nome completo" />
              <div className="grid grid-cols-2 gap-4">
                <StableInput label="Contato (A/C)" value={currentProposal.contact} onChange={v => setCurrentProposal({...currentProposal, contact: v})} placeholder="Responsável" />
                <StableInput label="WhatsApp (Com 55)" value={currentProposal.phone} onChange={v => setCurrentProposal({...currentProposal, phone: v})} placeholder="Ex: 5511947421770" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StableInput label="Vendedor" value={currentProposal.salesperson} onChange={v => setCurrentProposal({...currentProposal, salesperson: v})} placeholder="Seu nome" />
                <StableInput label="Prazo de Entrega" value={currentProposal.delivery} onChange={v => setCurrentProposal({...currentProposal, delivery: v})} placeholder="Ex: 3 dias úteis" />
              </div>
              <StableInput label="Forma de Pagamento" value={currentProposal.payment} onChange={v => setCurrentProposal({...currentProposal, payment: v})} placeholder="Ex: Boleto 10 DDL" />
              <StableTextArea label="Endereço da Obra" value={currentProposal.address} onChange={v => setCurrentProposal({...currentProposal, address: v})} placeholder="Local do serviço" />
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1">Itens do Orçamento</h3>
                <button onClick={() => setCurrentProposal({ ...currentProposal, items: [...currentProposal.items, { id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }] })} className="bg-yellow-400 text-zinc-900 p-2 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase"><Plus size={14} /> Adicionar</button>
              </div>
              {currentProposal.items.map((item, idx) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 relative shadow-sm">
                  {currentProposal.items.length > 1 && (
                    <button onClick={() => setCurrentProposal({ ...currentProposal, items: currentProposal.items.filter(i => i.id !== item.id) })} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg"><X size={16} /></button>
                  )}
                  <StableTextArea label={`Serviço #${idx+1}`} value={item.desc} onChange={v => {
                    const n = currentProposal.items.map(i => i.id === item.id ? {...i, desc: v} : i);
                    setCurrentProposal({...currentProposal, items: n});
                  }} placeholder="O que será feito?" />
                  <div className="grid grid-cols-2 gap-4">
                    <StableInput label="Qtd" type="number" value={item.qty} onChange={v => {
                      const q = parseFloat(v) || 0;
                      const n = currentProposal.items.map(i => i.id === item.id ? {...i, qty: q, total: q * i.unit} : i);
                      setCurrentProposal({...currentProposal, items: n});
                    }} />
                    <StableInput label="Unit (R$)" type="number" value={item.unit} onChange={v => {
                      const u = parseFloat(v) || 0;
                      const n = currentProposal.items.map(i => i.id === item.id ? {...i, unit: u, total: item.qty * u} : i);
                      setCurrentProposal({...currentProposal, items: n});
                    }} />
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="fixed bottom-24 left-6 right-6 p-6 bg-zinc-900 text-white flex items-center justify-between rounded-[2rem] shadow-2xl z-40 border-t-4 border-yellow-400">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-yellow-400 uppercase">Total Estimado</span>
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
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => sendFollowUpMessage(currentProposal)} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl hover:bg-green-700 transition-all whitespace-nowrap"><MessageCircle size={16} /> WHATSAPP</button>
              <button disabled={generating} onClick={() => handleSharePDF(currentProposal, 'share')} className="bg-blue-500 text-white px-5 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl hover:bg-blue-600 transition-all whitespace-nowrap">
                {generating ? <Loader2 size={16} className="animate-spin" /> : <Share size={16} />} COMPARTILHAR
              </button>
              <button disabled={generating} onClick={() => handleSharePDF(currentProposal, 'save')} className="bg-white text-zinc-900 px-5 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 shadow-xl hover:bg-zinc-100 transition-all whitespace-nowrap">
                <Download size={16} /> SALVAR
              </button>
            </div>
          </div>
          
          <div className="p-4 w-full max-w-2xl mt-4">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl flex flex-col items-center border-t-[10px] border-yellow-400 relative">
               <div className="mb-8 text-center flex flex-col items-center">
                 <div className="mb-4 bg-zinc-900 p-4 rounded-3xl shadow-lg"><RaimundixLogo size={80} /></div>
                 <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 uppercase">RAIMUNDIX</h2>
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-2">Soluções em Elétrica</p>
               </div>
               <div className="w-full space-y-6 border-t-2 border-zinc-50 pt-8">
                 <div className="flex justify-between">
                   <div className="flex-1 overflow-hidden pr-4">
                     <p className="text-[9px] font-black text-zinc-300 uppercase">Cliente</p>
                     <p className="text-xl font-black italic text-zinc-900 uppercase truncate leading-none">{currentProposal.client}</p>
                     <p className="text-[9px] font-black uppercase text-zinc-400 mt-2">A/C: {currentProposal.contact || 'Responsável'}</p>
                     <p className="text-[9px] font-black uppercase text-zinc-400">Vendedor: {currentProposal.salesperson || 'Direto'}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] font-black text-zinc-300 uppercase">Orçamento</p>
                     <p className="text-xl font-black italic text-yellow-600 leading-none">{currentProposal.number}</p>
                     <p className="text-[9px] font-bold text-zinc-400 mt-1">{currentProposal.date}</p>
                   </div>
                 </div>
                 <div className="bg-zinc-900 rounded-[2rem] p-8 text-center shadow-xl border-b-4 border-yellow-400">
                    <h3 className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Investimento Total</h3>
                    <p className="text-4xl font-black italic text-yellow-400 tracking-tighter">{formatCurrency(currentProposal.items.reduce((a,b)=>a+b.total,0))}</p>
                 </div>
                 <div className="space-y-4">
                   <p className="text-[9px] font-black text-zinc-300 uppercase border-b pb-2 tracking-widest">Itens Detalhados</p>
                   {currentProposal.items.map(i => (
                     <div key={i.id} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-zinc-100">
                       <span className="bg-zinc-900 text-yellow-400 font-black text-[10px] px-2 py-0.5 rounded-lg h-5 flex items-center">{i.qty}x</span>
                       <div className="flex-1">
                         <p className="text-xs font-bold text-zinc-700 leading-relaxed whitespace-pre-wrap">{i.desc}</p>
                         <p className="text-[10px] font-black text-zinc-400 mt-1">{formatCurrency(i.total)}</p>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-6">
                   <div className="bg-slate-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-zinc-300 uppercase mb-1">Prazo</p>
                     <p className="text-xs font-bold text-zinc-800 uppercase">{currentProposal.delivery}</p>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl">
                     <p className="text-[9px] font-black text-zinc-300 uppercase mb-1">Pagamento</p>
                     <p className="text-xs font-bold text-zinc-800 uppercase">{currentProposal.payment}</p>
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
