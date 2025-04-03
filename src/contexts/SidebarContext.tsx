'use client';
import useToastComponent from '@/app/hooks/Toast';
import { ToastIntent } from '@fluentui/react-components';
import React, { useState } from 'react';

type SidebarContextProps = React.PropsWithChildren<{
  isOpenSidebar: boolean;
  toggleSidebar: (status?: boolean) => void;
  isCollapsed: boolean;
  setMsg: (msg: string) => void;
  showToast: () => void;
  setIntent: (intent: ToastIntent | 'none') => void;
  toggleCollapse: (status?: boolean) => void;
  isRefreshPolicyHistory: boolean;
  resetRefreshPolicyHistory: (status: boolean) => void;
  isRefreshCaseHistory: boolean;
  resetRefreshCaseHistory: (status: boolean) => void;
}>;

const SidebarContext = React.createContext<SidebarContextProps>({
  isOpenSidebar: false,
  toggleSidebar: () => {},
  setMsg: () => {},
  showToast: () => {},
  setIntent: () => {},
  isCollapsed: false,
  toggleCollapse: () => {},
  isRefreshPolicyHistory: false,
  resetRefreshPolicyHistory: () => {},
  isRefreshCaseHistory: false,
  resetRefreshCaseHistory: () => {},
});

export const useSidebar = () => React.useContext(SidebarContext);

export const SidebarProvider = ({ children }: React.PropsWithChildren) => {
  const [isOpenSidebar, setIsOpenSidebar] = React.useState<boolean>(true);
  const [msg, setMsg] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });
  const [isRefreshPolicyHistory, setIsRefreshPolicyHistory] = React.useState<boolean>(false);

  const [isRefreshCaseHistory, setIsRefreshCaseHistory] = React.useState<boolean>(false);

  const toggleSidebar = React.useCallback((status?: boolean) => {
    if (status !== undefined) {
      setIsOpenSidebar(status);
      return;
    }
    setIsOpenSidebar((prev) => !prev);
  }, []);

  const toggleCollapse = React.useCallback((status?: boolean) => {
    if (status !== undefined) {
      setIsCollapsed(status);
      return;
    }
    setIsCollapsed((prev) => !prev);
  }, []);

  const resetRefreshPolicyHistory = React.useCallback((status: boolean) => {
    setIsRefreshPolicyHistory(status);
  }, []);

  const resetRefreshCaseHistory = React.useCallback((status: boolean) => {
    setIsRefreshCaseHistory(status);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        setMsg,
        showToast,
        setIntent,
        isOpenSidebar,
        toggleSidebar,
        isCollapsed,
        toggleCollapse,
        isRefreshPolicyHistory,
        resetRefreshPolicyHistory,
        isRefreshCaseHistory,
        resetRefreshCaseHistory,
      }}
    >
      {children}
      {toasterComponent}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;

SidebarContext.displayName = 'SidebarContext';
