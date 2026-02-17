
import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Share2,
  MessageCircle
} from 'lucide-react';
import { Proposal, ViewState } from './types';
import { RaimundixLogo } from './constants';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { StableInput, StableTextArea, Notification } from './components/UI';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = storageService.getProposals();
    setProposals(loaded);
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
      items: [{ id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }],
      delivery: 'Até 3 dias úteis',
      payment: 'Boleto para 10 DDL',
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
    showNotif("Orçamento salvo com sucesso!");
    setView('dashboard');
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja apagar este orçamento?")) {
      const updated = storageService.deleteProposal(id);
      setProposals(updated);
      showNotif("Orçamento removido.");
    }
  };

  const optimizeItemDescription = async (itemId: string) => {
    if (!currentProposal) return;
    const item = currentProposal.items.find(i => i.id === itemId);
    if (!item || !item.desc) return;

    setOptimizingId(itemId);
    const optimized = await geminiService.optimizeDescription(item.desc);
    
    const newItems = currentProposal.items.map(i => 
      i.id === itemId ? { ...i, desc: optimized } : i
    );
    setCurrentProposal({ ...currentProposal, items: newItems });
    setOptimizingId(null);
    showNotif("Descrição otimizada pela IA!");
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const shareViaWhatsApp = (p: Proposal) => {
    const total = p.items.reduce((acc, i) => acc + i.total, 0);
    const text = `*Orçamento Raimundix: ${p.number}*\n\n` +
      `*Cliente:* ${p.client}\n` +
      `*Data:* ${p.date}\n` +
      `*Total:* ${formatCurrency(total)}\n\n` +
      `*Resumo dos Serviços:*\n` +
      p.items.map(i => `- ${i.qty}x ${i.desc.substring(0, 50)}${i.desc.length > 50 ? '...' : ''}`).join('\n') +
      `\n\n*Condições:*\n` +
      `- Entrega: ${p.delivery}\n` +
      `- Pagamento: ${p.payment}\n\n` +
      `_Obrigado pela preferência!_`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const printProposal = (p: Proposal) => {
    const totalGeral = p.items.reduce((acc, i) => acc + (i.total || 0), 0);
    const itemsHtml = p.items.map(item => `
      <tr>
        <td style="padding: 12px; border: 1px solid #eee; font-size: 11px; white-space: pre-wrap; color: #333;">${item.desc}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: center; font-size: 11px;">${item.qty}</td>
        <td style="padding: 12px; border: 1px solid #eee; text-align: right; font-weight: bold; font-size: 11px; color: #000;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento ${p.number}</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #fff; color: #1a1a1a; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
          .header { background: #000; padding: 40px; color: #fff; text-align: center; border-bottom: 8px solid #facc15; }
          .header h1 { margin: 0; font-size: 42px; font-weight: 900; letter-spacing: -2px; font-style: italic; }
          .header .sub { color: #facc15; text-transform: uppercase; letter-spacing: 4px; font-size: 10px; font-weight: 800; margin-top: 5px; }
          .content { padding: 40px; }
          .section-title { font-weight: 900; text-transform: uppercase; font-size: 12px; color: #facc15; background: #000; display: inline-block; padding: 4px 12px; border-radius: 4px; margin-bottom: 15px; margin-top: 30px; }
          .client-box { background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .item-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .item-table th { background: #000; color: #fff; padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; }
          .total-row { background: #facc15; font-weight: 900; font-size: 20px; text-align: right; padding: 20px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .footer { padding: 30px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; margin-top: 50px; }
          .stamp { text-align: right; margin-top: 40px; }
          .stamp-badge { background: #000; color: #fff; display: inline-block; padding: 15px 25px; border-radius: 20px; border-bottom: 4px solid #facc15; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RAIMUNDIX</h1>
          <div class="sub">Materiais Elétricos e Instalações</div>
        </div>
        <div class="content">
          <div class="section-title">Dados do Cliente</div>
          <div class="client-box">
            <div>
              <div style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #000;">${p.client}</div>
              <div style="font-size: 13px; color: #64748b; margin-top: 5px;">A/C: ${p.contact || '---'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; font-size: 14px;">${p.phone}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px; max-width: 250px;">${p.address}</div>
            </div>
          </div>
          <table class="item-table">
            <thead>
              <tr>
                <th>Descrição do Serviço / Produto</th>
                <th style="width: 80px; text-align: center;">Qtd</th>
                <th style="width: 150px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total-row">TOTAL DO INVESTIMENTO: ${formatCurrency(totalGeral)}</div>
          <div style="display: flex; gap: 40px; margin-top: 40px;">
            <div style="flex: 1;">
               <div class="section-title">Condições Gerais</div>
               <div style="font-size: 12px; line-height: 1.6;">
                 • Prazo: ${p.delivery}<br>
                 • Pagamento: ${p.payment}<br>
                 • Validade: 10 dias corridos
               </div>
            </div>
            <div class="stamp">
              <div class="stamp-badge">
                <div style="font-size: 20px; font-weight: 900; font-style: italic;">${p.number}</div>
                <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">Data: ${p.date}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <strong>RAIMUNDIX SOLUÇÕES EM ELÉTRICA | CNPJ: 48.664.811/0001-13</strong><br>
          Estrada Hiroshi Tobinaga, 183 - Suzano/SP • (11) 94742-1770
        </div>
        <script>window.onload = () => { setTimeout(() => window.print(), 500); };</script>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 text-yellow-400 gap-4">
      <Loader2 className="animate-spin" size={48} />
      <span className="font-black text-xs uppercase tracking-widest">Carregando Raimundix Pro...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {notif && <Notification message={notif} />}

      {view === 'dashboard' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <header className="bg-zinc-900 text-white pt-16 pb-32 px-10 rounded-b-[4rem] border-b-8 border-yellow-400 text-center relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap size={150} fill="#facc15" />
            </div>
            <div className="mb-6 flex justify-center scale-110">
              <RaimundixLogo size={80} />
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter mb-1">RAIMUNDIX</h1>
            <p className="text-yellow-400 text-[11px] font-black uppercase tracking-[0.5em] opacity-90">Soluções em Elétrica</p>
          </header>

          <div className="px-4 -mt-12 mb-10 relative z-20">
            <button 
              onClick={createNewProposal} 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 h-24 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all group"
            >
              <div className="bg-zinc-900 text-yellow-400 p-2 rounded-2xl group-hover:rotate-90 transition-transform">
                <Plus size={28} strokeWidth={4} />
              </div>
              NOVO ORÇAMENTO
            </button>
          </div>

          <div className="space-y-4 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-widest">Histórico Recente</h2>
              <span className="text-[10px] font-bold text-zinc-400">{proposals.length} orçamentos</span>
            </div>
            
            {proposals.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-zinc-200">
                <FileText className="mx-auto text-zinc-200 mb-4" size={48} />
                <p className="text-zinc-400 font-bold italic">Nenhum orçamento encontrado.</p>
              </div>
            ) : (
              proposals.map(p => (
                <div key={p.id} className="group bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 flex items-center gap-6 hover:shadow-xl hover:border-yellow-100 transition-all">
                  <div className="flex-1 cursor-pointer overflow-hidden" onClick={() => { setCurrentProposal(p); setView('preview'); }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-zinc-900 text-yellow-400 px-3 py-1 rounded-full italic">{p.number}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{p.date}</span>
                    </div>
                    <h3 className="font-black text-xl text-zinc-800 uppercase truncate leading-tight mb-1 group-hover:text-yellow-600 transition-colors">{p.client}</h3>
                    <p className="text-lg font-black text-zinc-900 italic">{formatCurrency(p.items.reduce((a, b) => a + b.total, 0))}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { setCurrentProposal(p); setView('form'); }} className="p-4 bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 rounded-2xl transition-colors"><Edit size={22} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-4 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl transition-colors"><Trash2 size={22} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'form' && currentProposal && (
        <div className="max-w-2xl mx-auto bg-slate-50 min-h-screen pb-48 animate-in slide-in-from-right duration-500">
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-6 border-b z-50 flex items-center justify-between shadow-sm">
            <button onClick={() => setView('dashboard')} className="p-3 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 rounded-2xl transition-colors"><ArrowLeft size={20} /></button>
            <div className="text-center">
              <h2 className="font-black italic text-zinc-800 text-lg uppercase tracking-tight">Editar Orçamento</h2>
              <p className="text-[10px] font-bold text-yellow-500">{currentProposal.number}</p>
            </div>
            <button onClick={handleSave} className="bg-zinc-900 text-white hover:bg-zinc-800 px-8 py-3 rounded-2xl font-black text-xs shadow-lg transition-all active:scale-95">SALVAR</button>
          </div>
          
          <div className="p-6 sm:p-10 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center text-zinc-900 font-black">1</div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Identificação</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <StableInput label="Cliente / Empresa" value={currentProposal.client} onChange={v => setCurrentProposal({...currentProposal, client: v})} placeholder="Nome completo" />
                </div>
                <StableInput label="Responsável" value={currentProposal.contact} onChange={v => setCurrentProposal({...currentProposal, contact: v})} placeholder="Nome do contato" />
                <StableInput label="WhatsApp" value={currentProposal.phone} onChange={v => setCurrentProposal({...currentProposal, phone: v})} placeholder="(00) 00000-0000" />
                <div className="md:col-span-2">
                  <StableTextArea label="Endereço" value={currentProposal.address} onChange={v => setCurrentProposal({...currentProposal, address: v})} placeholder="Endereço completo" />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center text-zinc-900 font-black">2</div>
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Serviços</h3>
                </div>
                <button 
                  onClick={() => setCurrentProposal({
                    ...currentProposal, 
                    items: [...currentProposal.items, { id: Math.random().toString(), desc: '', qty: 1, unit: 0, total: 0 }]
                  })} 
                  className="bg-zinc-900 text-yellow-400 px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-2"
                >
                  <Plus size={14} strokeWidth={4} /> NOVO ITEM
                </button>
              </div>

              <div className="space-y-6">
                {currentProposal.items.map((item, idx) => (
                  <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 relative shadow-sm hover:border-yellow-200 transition-all">
                    {currentProposal.items.length > 1 && (
                      <button 
                        onClick={() => setCurrentProposal({
                          ...currentProposal, 
                          items: currentProposal.items.filter(i => i.id !== item.id)
                        })} 
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full shadow-xl hover:bg-red-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                    
                    <div className="relative">
                      <StableTextArea 
                        label={`Descrição Item ${idx+1}`} 
                        value={item.desc} 
                        onChange={v => {
                          const n = currentProposal.items.map(i => i.id === item.id ? {...i, desc: v} : i);
                          setCurrentProposal({...currentProposal, items: n});
                        }} 
                        placeholder="Descreva o serviço..."
                        rows={4}
                      />
                      {item.desc.length > 5 && (
                        <button 
                          disabled={optimizingId === item.id}
                          onClick={() => optimizeItemDescription(item.id)}
                          className="absolute bottom-2 right-2 bg-zinc-900 text-yellow-400 p-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase hover:bg-zinc-800 disabled:opacity-50 transition-all"
                        >
                          {optimizingId === item.id ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                          IA
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <StableInput label="Quantidade" type="number" value={item.qty} onChange={v => {
                        const q = parseFloat(v) || 0;
                        const n = currentProposal.items.map(i => i.id === item.id ? {...i, qty: q, total: q * i.unit} : i);
                        setCurrentProposal({...currentProposal, items: n});
                      }} />
                      <StableInput label="Preço Unit. (R$)" type="number" value={item.unit} onChange={v => {
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
                <div className="w-8 h-8 bg-yellow-400 rounded-xl flex items-center justify-center text-zinc-900 font-black">3</div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Condições</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StableInput label="Prazo Entrega" value={currentProposal.delivery} onChange={v => setCurrentProposal({...currentProposal, delivery: v})} />
                <StableInput label="Pagamento" value={currentProposal.payment} onChange={v => setCurrentProposal({...currentProposal, payment: v})} />
              </div>
            </section>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-8 bg-zinc-900 text-white flex items-center justify-between max-w-2xl mx-auto rounded-t-[3rem] shadow-2xl z-40 border-t-8 border-yellow-400">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-yellow-400 uppercase opacity-60">Total</span>
              <span className="text-3xl font-black italic leading-none">{formatCurrency(currentProposal.items.reduce((a,b)=>a+b.total,0))}</span>
            </div>
            <button onClick={handleSave} className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 px-12 py-5 rounded-[1.5rem] font-black shadow-xl transition-all uppercase">GUARDAR</button>
          </div>
        </div>
      )}

      {view === 'preview' && currentProposal && (
        <div className="min-h-screen bg-zinc-900 flex flex-col items-center pb-20 duration-500 animate-in fade-in">
          <div className="w-full bg-black/80 backdrop-blur-md p-6 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 shadow-2xl">
            <button onClick={() => setView('dashboard')} className="text-white font-black flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} /> <span className="hidden sm:inline">VOLTAR</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => shareViaWhatsApp(currentProposal)} 
                className="bg-green-600 text-white px-4 sm:px-6 py-4 rounded-2xl font-black shadow-xl hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageCircle size={20} /> <span className="hidden sm:inline">WHATSAPP</span>
              </button>
              <button 
                onClick={() => printProposal(currentProposal)} 
                className="bg-yellow-400 text-zinc-900 px-4 sm:px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-yellow-500 active:scale-95 transition-all flex items-center gap-2"
              >
                <Printer size={20} /> <span className="hidden sm:inline">IMPRIMIR PDF</span>
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-12 w-full max-w-3xl">
            <div className="bg-white rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-16 shadow-2xl flex flex-col items-center border-t-[12px] border-yellow-400 relative overflow-hidden">
               <div className="mb-8 flex flex-col items-center">
                 <div className="mb-4 bg-zinc-900 p-4 rounded-[2rem] shadow-xl">
                   <RaimundixLogo size={100} />
                 </div>
                 <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-1 leading-none text-zinc-900 text-center">RAIMUNDIX</h2>
                 <p className="text-[11px] font-black uppercase opacity-40 tracking-[0.5em] text-zinc-900 text-center">Soluções em Elétrica</p>
               </div>

               <div className="w-full space-y-8 border-t-2 border-zinc-100 pt-12">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div>
                     <p className="text-[10px] font-black text-zinc-300 uppercase mb-1">Cliente</p>
                     <p className="text-2xl font-black italic text-zinc-900 uppercase leading-tight">{currentProposal.client}</p>
                   </div>
                   <div className="sm:text-right">
                     <p className="text-[10px] font-black text-zinc-300 uppercase mb-1">Nº Orçamento</p>
                     <p className="text-2xl font-black italic text-yellow-600">{currentProposal.number}</p>
                   </div>
                 </div>

                 <div className="bg-zinc-900 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-center shadow-2xl">
                    <p className="text-4xl sm:text-5xl font-black italic text-yellow-400 mb-2">{formatCurrency(currentProposal.items.reduce((a,b)=>a+b.total,0))}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor Total do Projeto</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-zinc-100">
                     <p className="text-[10px] font-black text-zinc-300 uppercase mb-2">Prazos</p>
                     <p className="text-sm font-bold text-zinc-700">{currentProposal.delivery}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-zinc-100">
                     <p className="text-[10px] font-black text-zinc-300 uppercase mb-2">Pagamento</p>
                     <p className="text-sm font-bold text-zinc-700">{currentProposal.payment}</p>
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
