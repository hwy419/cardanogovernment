import { useState, useCallback } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
    // For now, just console.log the toast
    // In a real implementation, you'd show a toast notification
    console.log(`Toast: ${title} - ${description}`);
    
    // You could implement actual toast display logic here
    const newToast: ToastProps = { 
      title, 
      variant, 
      duration,
      ...(description && { description })
    };
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t !== newToast));
    }, duration);
  }, []);

  return { toast, toasts };
} 