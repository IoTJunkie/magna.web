'use client';
import {
  Input,
  SelectTabData,
  SelectTabEvent,
  Tab,
  TabList,
  TabValue,
} from '@fluentui/react-components';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DiscoveryToolRightPanel from '../discovery-tool-right-panel';
import classNames from 'classnames';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import InterrogativeBox from '../interrogative-box';
import ArrowBack from '../../icons/arrow-back-icon';
import { IQuestionInterrogative } from '@/app/types/interrogative';
import { getSession } from 'next-auth/react';
import fetchData from '@/app/utils/fetchData';
import { useQuery } from 'react-query';
import { INTERROGATIVE_LIST_QUESTION_KEY } from '@/config';
import { ICaseDocumentUpload, ICaseInfo } from '@/app/types/discovery';
import Chat from '../../conversation/chat';
import CustomIcon from '../../common/CustomIcon';

interface DiscoveryMobileTabs {
  setOpenItems: Dispatch<SetStateAction<string[] | null>>;
  openItems: any[];
  tree: any[];
  interrogativeFileId: string | null;
  sessionChat?: string;
  setDocuments: (docs: ICaseDocumentUpload[]) => void;
  handleSearchDocsName: (fileName: string) => void;
  docsSelectedByQuestion: string[];
  setDocsSelectedByQuestion: (v: string[]) => void;
  caseInfo: ICaseInfo;
}

export const DiscoveryMobileTabs = ({
  setOpenItems,
  openItems,
  tree,
  sessionChat,
  interrogativeFileId,
  setDocuments,
  handleSearchDocsName,
  docsSelectedByQuestion,
  setDocsSelectedByQuestion,
  caseInfo,
}: DiscoveryMobileTabs) => {
  const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');
  const [questions, setQuestions] = useState<IQuestionInterrogative[]>([]);
  const [questionActive, setQuestionActive] = useState('');
  const params = useParams();
  const caseId = params.id as string;

  useEffect(() => {
    if (questionActive && questions) {
      const qst = questions.find((q) => q.id === questionActive);
      if (qst) {
        setDocsSelectedByQuestion(qst.answer_document_ids);
      }
    }
  }, [questionActive]);

  const getQuestions = async () => {
    try {
      const session = await getSession();
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${params.id}/questions`;
      const response = await fetchData<any>(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const { data } = useQuery([INTERROGATIVE_LIST_QUESTION_KEY], getQuestions, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setQuestions(data);
      setQuestionActive(data[0]?.id);
    }
  }, [data]);

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  const router = useRouter();

  const searchParams = useSearchParams();

  const isInterrogative = Boolean(searchParams.get('interrogative')) || false;

  return (
    <div className='flex h-full flex-col md:hidden'>
      <TabList
        defaultSelectedValue='tab1'
        selectedValue={selectedValue}
        onTabSelect={onTabSelect}
        className='flex max-w-full shrink !items-center justify-start overflow-x-auto px-4 pb-5'
      >
        {isInterrogative && (
          <div
            onClick={() => {
              router.push(`/discovery-tool/${sessionChat}`);
            }}
          >
            <ArrowBack className='cursor-pointer' />
          </div>
        )}
        <Tab value='tab1'>{isInterrogative ? 'Interrogative' : 'AI Chat'}</Tab>
        <Tab value='tab2'>{isInterrogative ? 'Interrogative Document' : 'Documents'}</Tab>
      </TabList>
      <div className='flex size-full flex-1 flex-col'>
        <div
          className={classNames('flex size-full flex-1 flex-col', {
            hidden: selectedValue !== 'tab1',
          })}
        >
          {isInterrogative && questions.length ? (
            questions.map((item, idx) => {
              return (
                <div key={item.id}>
                  <InterrogativeBox
                    idx={idx}
                    questionInfo={item}
                    questionActive={questionActive}
                    setQuestionActive={setQuestionActive}
                    caseId={caseId}
                  />
                </div>
              );
            })
          ) : (
            <Chat />
          )}
        </div>
        <div
          className={classNames('p-4', {
            hidden: selectedValue !== 'tab2',
          })}
        >
          <Input
            placeholder='Search'
            size='large'
            className='mt-6 w-full !p-1 text-base [&_input]:p-0'
            maxLength={254}
            onChange={(e) => handleSearchDocsName(e.target.value)}
            contentBefore={<CustomIcon name='search-icon' />}
          />
          <DiscoveryToolRightPanel
            tree={tree}
            openItems={openItems}
            setOpenItems={setOpenItems}
            isMobile
            interrogativeFileId={interrogativeFileId}
            setDocuments={setDocuments}
            handleSearchDocsName={handleSearchDocsName}
            docsSelectedByQuestion={docsSelectedByQuestion}
            caseInfo={caseInfo}
          />
        </div>
      </div>
    </div>
  );
};
