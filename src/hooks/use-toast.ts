import { useState, useCallback } from "react";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
}

interface Toast extends ToastOptions {
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, duration = 3000, variant = "default" }: ToastOptions) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, description, duration, variant }]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return { toast, toasts };
} 