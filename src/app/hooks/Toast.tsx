import {
  Toast,
  Toaster,
  ToasterProps,
  ToastIntent,
  ToastTitle,
  useId,
  useToastController,
} from '@fluentui/react-components';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ToastComponentProps {
  content: JSX.Element | string;
  intent?: ToastIntent | 'none';
  showToast?: boolean;
  toasterProps?: ToasterProps;
  timeoutProps?: number;
}

interface ToastComponentResult {
  toasterComponent: JSX.Element;
  showToast: () => void;
  hideToast: () => void;
  setIntent: (intent: ToastIntent | 'none') => void;
  setTimeoutToast: (time: number) => void;
}

const useToastComponent = ({
  content,
  intent: initialIntent = 'none',
  showToast: initialShowToast = false,
  toasterProps,
  timeoutProps = 3000,
}: ToastComponentProps): ToastComponentResult => {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);
  const [showToast, setShowToast] = useState(initialShowToast);
  const [intent, setIntent] = useState(initialIntent);
  const [timeout, setTimeout] = useState(timeoutProps);

  const notify = () => {
    let cls = '';
    let txt = '';
    switch (intent) {
      case 'success':
        cls = 'flex item-center !border !border-color-success !bg-[#D1FADF] ';
        txt = '!text-color-success';
        break;
      case 'error':
        cls = 'flex item-center !border !border-color-error !bg-[#FEE4E2] ';
        txt = '!text-color-error';
        break;
      case 'warning':
        cls = 'flex item-center !border !border-color-warning !bg-[#FEF0C7] ';
        txt = '!text-color-warning';
        break;
      default:
        cls = 'flex item-center !border !border-color-info !bg-[#D1E9FF] ';
        txt = '!text-color-info';
        break;
    }
    dispatchToast(
      <>
        {typeof content === 'string' ? (
          <Toast className={cls}>
            <ToastTitle
              className={`flex items-center ${txt}`}
              media={
                intent !== 'none' ? (
                  <>
                    <Image src={`/svg/toast-${intent}.svg`} alt='icon' width={24} height={24} />
                  </>
                ) : undefined
              }
            >
              {content}
            </ToastTitle>
          </Toast>
        ) : (
          content
        )}
      </>,
      { timeout: timeout, intent: intent as ToastIntent },
    );
    // }
  };

  useEffect(() => {
    if (showToast) {
      notify();
      setShowToast(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  const toasterComponent = (
    <Toaster toasterId={toasterId} position='top-end' timeout={timeout} {...toasterProps} />
  );

  return {
    toasterComponent,
    showToast: () => setShowToast(true),
    hideToast: () => setShowToast(false),
    setIntent: (intent: ToastIntent | 'none') => setIntent(intent),
    setTimeoutToast: (time: number) => {
      setTimeout(time);
    },
  };
};

export default useToastComponent;

useToastComponent.displayName = 'useToastComponent';
