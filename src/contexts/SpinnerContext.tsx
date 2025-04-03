'use client';

import { Spinner } from '@fluentui/react-components';
import { createContext, ReactNode, useContext, useState } from 'react';

type SpinnerContextProps = {
  loading: boolean;
  showSpinner: () => void;
  hideSpinner: () => void;
};

const SpinnerContext = createContext<SpinnerContextProps>({
  loading: false,
  showSpinner: () => {},
  hideSpinner: () => {},
});

const SpinnerProvider = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const [loading, setLoading] = useState(false);

  return (
    <SpinnerContext.Provider
      value={{
        loading: loading,
        showSpinner: () => setLoading(true),
        hideSpinner: () => setLoading(false),
      }}
    >
      {loading && (
        <Spinner className='absolute z-10 size-full' style={{ background: '#ffffff4D' }} />
      )}
      {children}
    </SpinnerContext.Provider>
  );
};

export default SpinnerProvider;

export const useSpinner = () => useContext(SpinnerContext);

SpinnerContext.displayName = 'SpinnerContext';
