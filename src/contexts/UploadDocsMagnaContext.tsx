import { useProfileStore } from '@/app/_components/profile/profile-store';
import { PlansName } from '@/config';
import { createContext, PropsWithChildren, useContext, useRef, useState } from 'react';

interface UploadDocsMagnaContextType {
  msg: string;
  refFolAlreadyExists: boolean;
  isPlusPlan: boolean;
  isPreviewScreen: boolean;
  onSetMsg: (v: string) => void;
  setRefFolAlreadyExists: (v: boolean) => void;
  onSetIsPreviewScreen: (v: boolean) => void;
}

const UploadDocsMagnaContext = createContext<UploadDocsMagnaContextType | undefined>(undefined);

export const useUploadDocsMagnaContext = () => {
  const context = useContext(UploadDocsMagnaContext);
  if (!context) {
    throw new Error('useUploadDocsMagnaContext must be used within a UploadProvider');
  }
  return context;
};

export const UploadDocsMagnaProvider = ({ children }: PropsWithChildren) => {
  const { profileInfo } = useProfileStore();
  const planName = profileInfo?.current_subscription?.subscription_plan?.name;
  const isPlusPlan = planName === PlansName.Plus;

  const refFolAlreadyExists = useRef<boolean>(false);

  const [msg, setMsg] = useState<string>('');
  const [isPreviewScreen, setIsPreviewScreen] = useState(false); // show preview screen

  const onSetMsg = (value: string) => {
    setMsg(value);
  };
  const setRefFolAlreadyExists = (stt: boolean) => {
    refFolAlreadyExists.current = stt;
  };

  const onSetIsPreviewScreen = (value: boolean) => {
    setIsPreviewScreen(value);
  };

  return (
    <UploadDocsMagnaContext.Provider
      value={{
        isPreviewScreen,
        msg,
        refFolAlreadyExists: refFolAlreadyExists.current,
        isPlusPlan,
        onSetMsg,
        setRefFolAlreadyExists,
        onSetIsPreviewScreen,
      }}
    >
      {children}
    </UploadDocsMagnaContext.Provider>
  );
};

UploadDocsMagnaContext.displayName = 'UploadDocsMagnaContext';
