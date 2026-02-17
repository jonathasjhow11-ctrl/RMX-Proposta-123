
import React from 'react';

interface InputProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
}

export const StableInput: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-1 w-full mb-4">
    <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      className="w-full bg-white p-4 rounded-2xl border border-zinc-200 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 font-bold text-zinc-800 shadow-sm transition-all"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const StableTextArea: React.FC<InputProps & { rows?: number }> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="flex flex-col gap-1 w-full mb-4">
    <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">{label}</label>
    <textarea 
      className="w-full bg-white p-4 rounded-2xl border border-zinc-200 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 font-bold text-zinc-800 shadow-sm transition-all resize-none"
      placeholder={placeholder}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const Notification: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 text-white px-8 py-3 rounded-full border border-yellow-400 text-xs font-bold animate-bounce shadow-2xl flex items-center gap-2">
    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
    {message}
  </div>
);
