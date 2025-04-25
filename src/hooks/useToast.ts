import {useState, useCallback} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration: number = 2000) => {
      setToast({
        visible: true,
        message,
        type,
      });

      // 자동으로 숨기기
      setTimeout(() => {
        hideToast();
      }, duration);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast(prev => ({...prev, visible: false}));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
};
