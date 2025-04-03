import { IMycaseTreeItem } from '@/config';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

export interface ITokenInfo {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token: string;
  expires_in: string;
  firm_uuid: string;
}

interface MyCaseContextType {
  myCaseAccessToken: string | null;
  onSetMyCaseAccessToken: (token: ITokenInfo | null) => void;
  docsSelected: IMycaseTreeItem[] | [];
  handleSetDocsSelected: (docs: IMycaseTreeItem[] | []) => void;
}

const MyCaseContext = createContext<MyCaseContextType | undefined>(undefined);

export const useMyCaseContext = () => {
  const context = useContext(MyCaseContext);
  if (!context) {
    throw new Error('useMyCaseContext must be used within a MyCaseProvider');
  }
  return context;
};

export const MyCaseProvider = ({ children }: PropsWithChildren) => {
  const [myCaseAccessToken, setMyCaseAccessToken] = useState<string | null>(null);
  const [docsSelected, setDocsSelected] = useState<IMycaseTreeItem[]>([]);

  const onSetMyCaseAccessToken = (token: ITokenInfo | null) => {
    // handle token expired
    if (token) {
      const accessToken = token.access_token;
      setMyCaseAccessToken(accessToken);
    } else {
      setMyCaseAccessToken(null);
    }
  };

  const handleSetDocsSelected = (docs: IMycaseTreeItem[]) => {
    setDocsSelected(docs);
  };

  return (
    <MyCaseContext.Provider
      value={{
        myCaseAccessToken: myCaseAccessToken,
        onSetMyCaseAccessToken: onSetMyCaseAccessToken,
        docsSelected: docsSelected,
        handleSetDocsSelected: handleSetDocsSelected,
      }}
    >
      {children}
    </MyCaseContext.Provider>
  );
};

MyCaseContext.displayName = 'MyCaseContext';
