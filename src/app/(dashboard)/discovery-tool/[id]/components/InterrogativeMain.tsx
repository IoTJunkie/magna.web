import CustomIcon from '@/app/_components/common/CustomIcon';
import InterrogativeBox from '@/app/_components/discovery-tool/interrogative-box';
import DialogInterrogativeSetting from '@/app/_components/discovery-tool/interrogative-box/components/DialogInterrogativeSetting';
import InterrogativeEmailDialog from '@/app/_components/discovery-tool/interrogative-email-dialog';
import useToastComponent from '@/app/hooks/Toast';
import { ICaseDetail, ICaseInfo } from '@/app/types/discovery';
import { IQuestionInterrogative } from '@/app/types/interrogative';
import fetchData from '@/app/utils/fetchData';
import { INTERROGATIVE_LIST_QUESTION_KEY } from '@/config';
import { Button, Spinner } from '@fluentui/react-components';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import _ from 'lodash';

interface IProps {
  caseInfo: ICaseInfo;
  setDocsSelectedByQuestion: (v: string[]) => void;
  caseDetail: ICaseDetail | null;
  getCaseDetail: () => void;
}

const InterrogativeMain = ({
  caseInfo,
  setDocsSelectedByQuestion,
  caseDetail,
  getCaseDetail,
}: IProps) => {
  const params = useParams();
  const caseId = params.id as string;
  const [questions, setQuestions] = useState<IQuestionInterrogative[]>([]);
  const [questionActive, setQuestionActive] = useState('');
  const [isOpenSetting, setIsOpenSetting] = useState(false);
  const [isSettingChanged, setIsSettingChanged] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isOpenInterrogativeEmail, setIsOpenInterrogativeEmail] = useState(false);
  const { showToast, toasterComponent, setIntent } = useToastComponent({
    content: msg || '',
  });

  const getQuestions = async () => {
    try {
      const session = await getSession();
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}/questions`;
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
      if (!questionActive) {
        setQuestionActive(data[0]?.id);
      }
    }
  }, [data]);

  useEffect(() => {
    if (questionActive && questions) {
      const qst = questions.find((q) => q.id === questionActive);
      if (qst) {
        setDocsSelectedByQuestion(qst.answer_document_ids);
      }
    }
  }, [questionActive]);

  useEffect(() => {
    const isAllPropertiesEmpty = _.every(
      _.values(caseInfo),
      (value) => value === null || value === undefined || value === '',
    );

    if (!isAllPropertiesEmpty) {
      if (!caseInfo.is_federal && !caseInfo.state) {
        setIsOpenSetting(true);
      } else {
        setIsSettingChanged(true);
      }
    }
  }, [caseInfo]);

  const handleDownloadAnswer = async () => {
    try {
      setDownloading(true);
      const session = await getSession();
      const questionIds = questions.map((item) => item.id);
      const params = { question_ids: questionIds };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify(params),
        },
      );
      setDownloading(false);
      if (response.ok) {
        const blob = await response.blob();
        const newBlob = new Blob([blob]);
        const blobUrl = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', 'interrogaties.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
      } else {
        const res = await response.json();
        if (res?.document_ids && res?.document_ids.length > 0) {
          setIntent('error');
          setMsg(res?.document_ids[0]);
          showToast();
        }
        console.log('error', res);
      }
    } catch (error) {}
  };

  const sendEmailSuccess = () => {
    setIsOpenInterrogativeEmail(false);
    setIntent('success');
    setMsg('Email sent to client.');
    showToast();
  };

  return (
    <div className='flex size-full flex-1 flex-col overflow-y-auto px-[3rem] pb-[2.25rem]'>
      <div className='flex min-h-24 flex-wrap items-center justify-between border-b '>
        <h3 className='font-work-sans flex items-center text-[1.5rem] font-medium leading-[2rem] text-drover-9'>
          Interrogatories
          <div onClick={() => setIsOpenSetting(true)} className='cursor-pointer'>
            <CustomIcon name='setting-icon' className='ml-2' />
          </div>
        </h3>
        <div className='flex gap-2.5'>
          <Button
            size='medium'
            onClick={() => {
              setIsOpenInterrogativeEmail(true);
            }}
          >
            Email Interrogatories
          </Button>
          <Button
            size='medium'
            appearance='primary'
            onClick={handleDownloadAnswer}
            className='flex items-center gap-1'
          >
            {downloading ? (
              <Spinner size='tiny' />
            ) : (
              <Image src='/svg/download-interrogative.svg' alt='' width={20} height={20} />
            )}
            Download Interrogatories
          </Button>
        </div>
      </div>
      {questions.length ? (
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
        <></>
      )}
      {isOpenSetting && (
        <DialogInterrogativeSetting
          settingChanged={isSettingChanged}
          open={isOpenSetting}
          caseId={caseId}
          onCancel={() => {
            setIsOpenSetting(false);
          }}
          caseDetail={caseDetail}
          getCaseDetail={getCaseDetail}
        />
      )}
      {isOpenInterrogativeEmail && (
        <InterrogativeEmailDialog
          open={isOpenInterrogativeEmail}
          loading={false}
          onCancel={() => {
            setIsOpenInterrogativeEmail(false);
          }}
          questionActive={questionActive}
          sendEmailSuccess={sendEmailSuccess}
          isAskClient={false}
        />
      )}
      {toasterComponent}
    </div>
  );
};

export default InterrogativeMain;
