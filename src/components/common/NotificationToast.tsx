import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-neutral-900 text-white border-neutral-800',
    info: 'bg-neutral-800 text-white border-neutral-700',
    warning: 'bg-amber-900 text-amber-50 border-amber-800',
    error: 'bg-rose-900 text-rose-50 border-rose-800',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  };

  return (
    <div
      id="notification-toast-container"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        id="notification-toast"
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium ${bgColors[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="flex-1">{toast.message}</span>
      </div>
    </div>
  );
};
