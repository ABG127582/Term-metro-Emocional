import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastState } from '../types';

interface ToastProps extends ToastState {
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgGradient = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-600',
    error: 'bg-gradient-to-r from-red-500 to-rose-600',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  }[type];

  const IconComp = { success: CheckCircle, error: AlertCircle, info: Info }[type];

  return (
    <div className={`fixed bottom-4 right-4 ${bgGradient} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 backdrop-blur-sm border border-white/20 animate-fade-in-up`} role="alert" aria-live="polite">
      <IconComp className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/50 rounded" aria-label="Fechar notificação">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;