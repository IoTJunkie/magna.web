'use client';

import Chat from '@/app/_components/conversation/chat';
import DiscoveryToolRightPanel from '@/app/_components/discovery-tool/discovery-tool-right-panel';
import { DiscoveryMobileTabs } from '@/app/_components/discovery-tool/mobile-tabs';
import { ICaseDetail, ICaseDocumentUpload, ICaseInfo, IItemTree } from '@/app/types/discovery';
import { Spinner } from '@fluentui/react-components';
import axios from 'axios';
import dayjs from 'dayjs';
import _ from 'lodash';
import debounce from 'lodash.debounce';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderDiscoveryTool from './components/HeaderDiscoveryTool';
import InterrogativeMain from './components/InterrogativeMain';

type Props = {
  params: { id: string };
};

interface ResultItem {
  value: string;
  parentValue?: string;
  content: string;
  id: string;
  isFile: boolean;
  url: string;
}

export interface Deadline {
  name: string;
  backgroudColor: string;
}

const DiscoveryToolDetails = (props: Props) => {
  const { params } = props;
  const router = useRouter();
  const [deadline, setDealine] = useState<Deadline | null>(null);
  const [caseInfo, setCaseInfo] = useState<ICaseInfo>({
    caseName: '',
    caseNumber: '',
    plaintiffName: '',
    defendantName: '',
    is_federal: null,
    state: null,
  });

  const [documents, setDocuments] = useState<ICaseDocumentUpload[]>([]);
  const [caseDetail, setCaseDetail] = useState<ICaseDetail | null>(null);
  const [openItems, setOpenItems] = useState<string[] | null>(null);
  const [interrogativeFileId, setInterrogativeFileId] = useState<string | null>('');
  const [tree, setTree] = useState<IItemTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [docsSelectedByQuestion, setDocsSelectedByQuestion] = useState<string[]>([]);

  const isInterrogative = Boolean(searchParams.get('interrogative')) || false;

  const sessionChat = params.id;

  const getCaseDetail = async () => {
    try {
      setLoading(true);
      const session = await getSession();
      let config: any = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      const rs = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${sessionChat}`,
        config,
      );
      if (rs.ok) {
        const data = await rs.json();
        setCaseInfo({
          caseName: data?.title,
          caseNumber: data?.case_number,
          defendantName: data?.defendant_name,
          plaintiffName: data?.plaintiff_name,
          is_federal: data?.is_federal,
          state: data?.state,
        });
        setCaseDetail(data);
        setDocuments(data.documents);
      }
    } catch (error) {
      console.log('error :>> ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCaseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionChat]);

  const calculateDaysDifference = (dateInput: string) => {
    const inputDate = dayjs(dateInput);
    const today = dayjs();
    const daysDiff = inputDate.diff(today, 'day');
    return daysDiff;
  };

  const getCase = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${params.id}`;
      const session = await getSession();
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });

      setInterrogativeFileId(response.data.interrogative_document_id);
      if (response.data.deadline) {
        const dayDiff = calculateDaysDifference(response.data.deadline);
        if (dayDiff > 21) {
          setDealine({
            name: response.data.deadline,
            backgroudColor: 'bg-[#13A10E]',
          });
        } else if (dayDiff <= 21 && dayDiff > 3) {
          setDealine({
            name: response.data.deadline,
            backgroudColor: 'bg-[#F79009]',
          });
        } else {
          setDealine({
            name: response.data.deadline,
            backgroudColor: 'bg-[#F04438]',
          });
        }
      }
    } catch (error) {
      if ((error as any)?.code === 'ERR_BAD_RESPONSE') router.push('/discovery-tool');
      console.log('error :>> ', error);
    }
  };

  // const { data: policy, isLoading: policyLoading } = useQuery(['policies', params.id], getPolicy);

  useEffect(() => {
    getCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isInterrogative]);

  const generateResult = (data: any): ResultItem[] => {
    const result: ResultItem[] = [];

    const processPath = (path: string, id: string, url: string, parentValue?: string) => {
      const pathParts = path.split('/');
      let value = '';

      for (let i = 0; i < pathParts.length; i++) {
        const content = pathParts[i];
        value = parentValue ? `${parentValue}-${content}` : content;
        result.push({
          value,
          parentValue,
          content,
          id,
          isFile: pathParts.length - 1 === i,
          url: url,
        });

        parentValue = value;
      }
    };
    for (const item of data) {
      processPath(item?.path || '', item.id, item.url, item.parentValue);
    }

    return result;
  };

  const handleGetTree = (docs: ICaseDocumentUpload[]) => {
    const folderTree: any = _.uniqBy(generateResult(docs), 'value') || [];
    const values = folderTree.map((item: any) => item.value) || [];
    setOpenItems(values);
    setTree(folderTree);
  };

  useEffect(() => {
    handleGetTree(documents);
  }, [documents]);

  // useEffect(() => {
  //   const getPolicySummary = async () => {
  //     try {
  //       const url = `/api/plg/policies/${params.id}/summary/`;
  //       const response = await axios.get(url, { cancelToken: cancelToken });

  //       setPolicySummary(response.data);
  //     } catch (error) {
  //       console.log('error :>> ', error);
  //     }
  //   };

  //   if (policy?.summary) {
  //     getPolicySummary();
  //   }
  // }, [cancelToken, params.id, policy]);

  const handleSearchDocsName = debounce((fileName: string) => {
    setSearch(fileName);
    const newDocs = documents.filter((item: any) => {
      return item.path.toLowerCase().includes(fileName.toLowerCase());
    });
    handleGetTree(newDocs);
  }, 500);

  if (loading) {
    return (
      <div className='flex h-full grow items-center justify-center'>
        <Spinner size='small' />
      </div>
    );
  }

  return (
    <>
      <div className='hidden h-full overflow-y-hidden md:flex'>
        <div className='flex size-full flex-1 flex-col md:w-3/5'>
          <HeaderDiscoveryTool deadline={deadline} caseInfo={caseInfo} setCaseInfo={setCaseInfo} />
          {!isInterrogative && <Chat />}
          {isInterrogative && (
            <InterrogativeMain
              setDocsSelectedByQuestion={setDocsSelectedByQuestion}
              caseInfo={caseInfo}
              caseDetail={caseDetail}
              getCaseDetail={getCaseDetail}
            />
          )}
        </div>

        <div className='overflow-y-auto border-l lg:w-2/5'>
          {(openItems?.length && !search) || (openItems !== null && search) ? (
            <DiscoveryToolRightPanel
              tree={tree}
              interrogativeFileId={interrogativeFileId}
              openItems={openItems}
              setOpenItems={setOpenItems}
              setDocuments={setDocuments}
              handleSearchDocsName={handleSearchDocsName}
              docsSelectedByQuestion={docsSelectedByQuestion}
              caseInfo={caseInfo}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      {
        <>
          <HeaderDiscoveryTool deadline={deadline} caseInfo={caseInfo} setCaseInfo={setCaseInfo} />
          <DiscoveryMobileTabs
            setOpenItems={setOpenItems}
            openItems={openItems as any[]}
            tree={tree}
            interrogativeFileId={interrogativeFileId}
            sessionChat={sessionChat}
            setDocuments={setDocuments}
            handleSearchDocsName={handleSearchDocsName}
            docsSelectedByQuestion={docsSelectedByQuestion}
            setDocsSelectedByQuestion={setDocsSelectedByQuestion}
            caseInfo={caseInfo}
          />
        </>
      }
    </>
  );
};

export default DiscoveryToolDetails;

DiscoveryToolDetails.displayName = 'DiscoveryToolDetails';
