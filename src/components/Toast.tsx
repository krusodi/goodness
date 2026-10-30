import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 no-print">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-medium ${
          toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-800'
            : toast.type === 'info'
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-emerald-900 text-white border-emerald-800'
        }`}
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
        ) : toast.type === 'info' ? (
          <Info className="w-4 h-4 text-blue-300 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
