import { useToastContext, ToastType } from '@/contexts/ToastContext';

export function useToast() {
  const { showToast } = useToastContext();

  return {
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    show: showToast,
  };
}
