import { useState, useCallback } from 'react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState extends ToastProps {
  id: number;
  visible: boolean;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = toastId++;
    
    setToasts(prev => [...prev, {
      id,
      title,
      description,
      variant,
      visible: true
    }]);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.map(t => 
        t.id === id ? { ...t, visible: false } : t
      ));

      // Remove from state after animation
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, 5000);
  }, []);

  return { toast, toasts };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts } = useToast();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              transform transition-all duration-300 ease-in-out
              ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
              ${toast.variant === 'destructive' ? 'bg-red-500' : 'bg-gray-800'}
              text-white rounded-lg shadow-lg p-4 min-w-[300px]
            `}
          >
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
} 