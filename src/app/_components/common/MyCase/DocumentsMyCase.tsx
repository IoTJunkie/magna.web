import { useMyCaseContext } from '@/contexts/MyCaseContext';
import { Spinner } from '@fluentui/react-components';
import axios from 'axios';
import { useEffect, useState } from 'react';
import SelectDocumentsMyCase from './SelectDocumentsMyCase';

interface Props {
  caseId: number | null;
  search: string;
}

export const DocumentsMyCase = ({ caseId, search }: Props) => {
  const { myCaseAccessToken } = useMyCaseContext();

  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);

  const getDocs = async (caseId: number) => {
    try {
      setLoading(true);
      const url = '/api/mycase/documents';
      const rs = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${myCaseAccessToken}`,
          param: caseId,
        },
      });
      if (rs) {
        setDocs(rs.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId && myCaseAccessToken) {
      getDocs(caseId);
    }
  }, [caseId, myCaseAccessToken]);

  return (
    <div>
      {loading ? (
        <div className='flex h-full grow items-center justify-center'>
          <Spinner size='small' />
        </div>
      ) : (
        <div>
          <SelectDocumentsMyCase docs={docs} search={search} />
        </div>
      )}
    </div>
  );
};
