'use client';
import React from 'react';

type SupscriptionPlanContextProps = React.PropsWithChildren<{
  isUpgradeLoading: boolean;
  setUpgradeLoading: (status?: boolean) => void;
}>;

const SupscriptionPlanContext = React.createContext<SupscriptionPlanContextProps>({
  isUpgradeLoading: false,
  setUpgradeLoading: () => {},
});

export const useSupscriptionPlan = () => React.useContext(SupscriptionPlanContext);

export const SupscriptionPlanProvider = ({ children }: React.PropsWithChildren) => {
  const [isUpgradeLoading, setIsUpgradeLoading] = React.useState<boolean>(false);

  const setUpgradeLoading = React.useCallback((status?: boolean) => {
    if (status !== undefined) {
      setIsUpgradeLoading(status);
      return;
    }
    setIsUpgradeLoading((prev) => !prev);
  }, []);

  return (
    <SupscriptionPlanContext.Provider
      value={{
        isUpgradeLoading,
        setUpgradeLoading,
      }}
    >
      {children}
    </SupscriptionPlanContext.Provider>
  );
};

export default SupscriptionPlanContext;

SupscriptionPlanContext.displayName = 'SupscriptionPlanContext';
