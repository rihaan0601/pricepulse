'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type, duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }].slice(-4), // Max 4 toasts
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast);
  return {
    toast: {
      success: (msg: string, duration?: number) => addToast(msg, 'success', duration),
      error: (msg: string, duration?: number) => addToast(msg, 'error', duration),
      info: (msg: string, duration?: number) => addToast(msg, 'info', duration),
      warning: (msg: string, duration?: number) => addToast(msg, 'warning', duration),
    },
  };
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = 
          toast.type === 'success' ? CheckCircle2 :
          toast.type === 'error' ? XCircle :
          toast.type === 'warning' ? AlertTriangle : Info;

        const colors = 
          toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
          toast.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
          toast.type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          'bg-blue-500/10 text-blue-500 border-blue-500/20';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl border backdrop-blur-xl bg-card/80 shadow-lg animate-in slide-in-from-right-4 duration-300 relative overflow-hidden group min-w-[300px] max-w-md ${colors}`}
          >
            <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-foreground">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div 
              className={`absolute bottom-0 left-0 h-1 bg-current opacity-20`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`,
                width: '100%',
              }}
            />
            <style jsx>{`
              @keyframes shrink {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </div>
        );
      })}
    </div>,
    document.body
  );
};
