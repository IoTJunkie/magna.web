import { ChatSession } from '@/app/api/__generated__/api';
import useToastComponent from '@/app/hooks/Toast';
import { IObjection, IQuestionInterrogative } from '@/app/types/interrogative';
import { INTERROGATIVE_LIST_QUESTION_KEY } from '@/config';
import { Button, Spinner } from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useChatStore } from '../../conversation/chat/chat-store';
import ArrowDown from '../../icons/arrow-down-icon';
import ArrowUp from '../../icons/arrow-up-icon';
import InterrogativeEmailDialog from '../interrogative-email-dialog';
import ObjectionDialog from '../objection-dialog';
import CustomIcon from '../../common/CustomIcon';
import ClientAnswer from './components/ClientAnswer';

interface IInterrogativeProps {
  questionInfo: IQuestionInterrogative;
  idx: number;
  questionActive: string;
  setQuestionActive: (id: string) => void;
  caseId: string;
}

const startStreamRegex = /event: stream-start/;
const endStreamRegex = /event: stream-end/;

const InterrogativeBox = ({
  idx,
  questionInfo,
  questionActive,
  setQuestionActive,
  caseId,
}: IInterrogativeProps) => {
  const [isShortDown, setIsShortDown] = useState<boolean>(false);
  const [isOpenObjectionDialog, setIsOpenObjectionsDialog] = useState<boolean>(false);
  const [isOpenInterrogativeEmail, setIsOpenInterrogativeEmail] = useState<boolean>(false);
  const [objections, setObjections] = useState<IObjection[]>([]);
  const [magnaAnswer, setMagnaAnswer] = useState(questionInfo?.magna_answer || '');
  const [objectionsSelected, setObjectionsSelected] = useState<IObjection[]>(
    questionInfo?.object_list || [],
  );
  const [loadingMagnaAnswer, setLoadingMagnaAnswer] = useState(false);
  const [msg, setMsg] = useState('');
  const [loadingObjection, setLoadingObjection] = useState(false);
  const refMagnaAnswer = useRef<any>(null);
  const isLoadingBtnNumber = useRef(1);

  const { documentIds } = useChatStore();
  const queryClient = useQueryClient();
  const { showToast, toasterComponent, setIntent } = useToastComponent({
    content: msg,
  });

  useEffect(() => {
    setObjectionsSelected(questionInfo.object_list || []);
  }, [questionInfo]);

  const resizeTextarea = () => {
    //resize after generate content
    const textarea = refMagnaAnswer.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight + 8}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, []);

  const handleAnswer = async (isAutoObj: boolean, docIds: string[], questionId: string) => {
    if (!docIds.length) {
      setIntent('error');
      setMsg('Please choose documents for Magna AI to base the answer on.');
      showToast();
      return;
    }
    const createNewConversationUrl = '/api/plg/chats/session/discovery/';
    const body = {
      case: caseId,
      document_ids: docIds,
      is_ai_mode: true,
    };
    setLoadingMagnaAnswer(true);
    const response = await axios.post<ChatSession>(createNewConversationUrl, body);
    const sessionChatId = response?.data?.id;
    if (sessionChatId) {
      const session = await getSession();
      let answer = '';
      const refreshUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/${sessionChatId}/questions/${questionId}/${isAutoObj ? 'auto-objection' : 'suggest-answer'}`;
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      if (!response.ok) {
        setLoadingMagnaAnswer(false);
        throw new Error('Failed to fetch data');
      }

      const reader: any = response?.body?.getReader();
      const decoder = new TextDecoder();
      const read = async () => {
        try {
          const { value } = await reader.read();
          const chunk = decoder.decode(value, { stream: true });
          if (endStreamRegex.test(chunk)) {
            const data = chunk.split('event: stream-end');
            if (data.length && data[1].split('data: ')[1]) {
              const newAnswer = JSON.parse(data[1].split('data: ')[1]);
              setTimeout(() => {
                if (newAnswer.length) {
                  setMagnaAnswer(newAnswer[0]);
                  setTimeout(() => {
                    resizeTextarea();
                    queryClient.invalidateQueries([INTERROGATIVE_LIST_QUESTION_KEY]);
                  }, 200);
                }
              }, 300);
              setLoadingMagnaAnswer(false);
            }
            return;
          } else if (startStreamRegex.test(chunk)) {
          } else {
            const tmp = chunk.trim().replaceAll('data:', '').split('\n\n');
            if (tmp?.length) {
              tmp.forEach((item) => {
                if (item) {
                  const obj = JSON.parse(item);
                  answer += obj.text;
                }
              });
            }
            setMagnaAnswer(answer);
          }
          await read();
        } catch (error) {
        } finally {
          setLoadingMagnaAnswer(false);
        }
      };
      await read();
    }
  };

  const getObjectionsList = async () => {
    try {
      const session = await getSession();
      let config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/interrogative-object/cases/${caseId}`,
        config,
      );
      if (res.ok) {
        const data = await res.json();
        setObjections(data);
        setIsOpenObjectionsDialog(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const uploadSelectedObjects = async (objections: any[]) => {
    try {
      setLoadingObjection(true);
      const selectedObjectionsIds: any[] = [];
      objections.forEach((item) => selectedObjectionsIds.push(item.id));
      const session = await getSession();
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/${questionInfo?.id}`,
        {
          object_list: selectedObjectionsIds,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      if (res.status >= 200 && res.status < 300) {
        await queryClient.invalidateQueries([INTERROGATIVE_LIST_QUESTION_KEY]);
        setIsOpenObjectionsDialog(false);
        setLoadingObjection(false);
        isLoadingBtnNumber.current = 2;
        handleAnswer(false, documentIds, questionActive);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingObjection(false);
    }
  };

  const sendEmailSuccess = () => {
    setIntent('success');
    setMsg('Email sent to client.');
    showToast();
  };

  const handleFocusEvent = async (e: any) => {
    try {
      resizeTextarea();
      const session = await getSession();
      const value = e?.target?.value || '';
      const params = { magna_answer: value };
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/${questionInfo?.id}`;
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleAnsw = async (docIds: string[], questionId: string) => {
    isLoadingBtnNumber.current = 1;
    await handleAnswer(false, docIds, questionId);
  };

  const handleAutoObjection = async (docIds: string[], questionId: string) => {
    isLoadingBtnNumber.current = 3;
    await handleAnswer(true, docIds, questionId);
  };

  const onChangeAnswer = (e: any) => {
    setMagnaAnswer(e?.target?.value);
  };

  return (
    <>
      <div
        className='mx-[0.625rem] mb-[2.5rem] flex cursor-pointer flex-col gap-[1rem] md:mx-0 xl:mx-[1.25rem]'
        onClick={() => {
          setQuestionActive(questionInfo?.id);
        }}
      >
        <div
          className={classNames('flex w-full flex-col rounded-[1rem] bg-[#DADADB33] p-[1.5rem]', {
            '!bg-bg-mint-1': questionActive === questionInfo?.id,
          })}
        >
          <div
            className={classNames('mb-[1.5rem] flex flex-col gap-[0.5rem]', {
              '!mb-0': isShortDown,
            })}
          >
            <div className='flex justify-between'>
              <h3 className='font-inter font-semibold leading-[1.25rem]'>{`${idx + 1}. Question from document`}</h3>
              {isShortDown ? (
                <div
                  onClick={() => {
                    setIsShortDown(!isShortDown);
                  }}
                >
                  <ArrowUp className='cursor-pointer text-color-text-default' />
                </div>
              ) : (
                <div
                  onClick={() => {
                    setIsShortDown(!isShortDown);
                  }}
                >
                  <ArrowDown className='cursor-pointer text-color-text-default' />
                </div>
              )}
            </div>
            <p className='font-inter font-normal leading-[1.25rem]'>
              {questionInfo?.question_detail}
            </p>
          </div>
          {!isShortDown && (
            <div className='flex flex-col items-stretch gap-[1.5rem] md:flex-col '>
              <div className='flex-1 flex-col'>
                <div className='mb-[0.5rem] flex items-center'>
                  <div className='flex items-center justify-center'>
                    <CustomIcon name='legal-bot-avatar' width={28} height={28} />
                  </div>
                  <h4 className='font-inter ml-1 text-base font-semibold leading-[1.25rem] text-color-text-default'>
                    Magna Answer
                  </h4>
                </div>
                <textarea
                  className='h-fit min-h-[4.125rem] w-full resize-none rounded-[0.25rem] border border-[#E0E0E0] border-b-aero-13 bg-neutrual-900-2 px-[0.75rem] pt-[0.5625rem] transition ease-in-out focus-visible:outline-none '
                  placeholder='Enter input here'
                  onBlur={handleFocusEvent}
                  value={magnaAnswer}
                  onChange={onChangeAnswer}
                  ref={refMagnaAnswer}
                />
              </div>
              {questionInfo.client_answers.length > 0 && (
                <ClientAnswer answers={questionInfo.client_answers} />
              )}
            </div>
          )}
          {/* {!isShortDown && objectionsSelected.length > 0 && (
            <div className='flex flex-col'>
              <h2 className='mb-[0.5rem] mt-6 text-[0.875rem] font-semibold leading-[1.25rem]'>
                Objection(s)
              </h2>
              <div className='flex flex-col gap-[1rem] rounded-[0.25rem] border border-input-disable p-[0.5625rem_0.75rem]'>
                {objectionsSelected.map((objection: IObjection) => (
                  <div key={objection.id}>
                    <h3 className='font-bold'>{objection.name}:</h3>
                    <p className=''>{objection.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        <div className='flex w-full justify-between gap-1 sm:flex-wrap sm:!justify-end 2xl:gap-[1.25rem]'>
          <Button
            className='!min-w-fit flex-1 gap-2 md:grow-0'
            onClick={() => {
              const cond = questionActive !== questionInfo.id; // check case click button (answer or auto objection) before active question
              handleAnsw(
                cond ? questionInfo.answer_document_ids : documentIds,
                cond ? questionInfo.id : questionActive,
              );
            }}
            disabled={loadingMagnaAnswer && isLoadingBtnNumber.current === 1}
          >
            {loadingMagnaAnswer && isLoadingBtnNumber.current === 1 && <Spinner size='tiny' />}
            <div className='flex flex-col items-center gap-1'>
              <div className='sm:hidden'>
                <CustomIcon name='star-btn' width={18} height={18} />
              </div>
              <div className='font-normal lg:font-semibold'>Answer</div>
            </div>
          </Button>
          <Button
            onClick={() => {
              setIsOpenInterrogativeEmail(true);
            }}
            className='!min-w-fit  flex-1 md:grow-0'
          >
            <div className='flex flex-col items-center gap-1'>
              <div className='sm:hidden'>
                <CustomIcon name='sms-btn' width={18} height={18} />
              </div>
              <div className='flex font-normal lg:font-semibold'>
                Ask <span className='hidden sm:block'>&nbsp;Client</span>
              </div>
            </div>
          </Button>
          <Button
            className='!min-w-fit  flex-1 gap-2 md:grow-0'
            onClick={() => {
              getObjectionsList();
            }}
            disabled={loadingMagnaAnswer && isLoadingBtnNumber.current === 2}
          >
            {loadingMagnaAnswer && isLoadingBtnNumber.current === 2 && <Spinner size='tiny' />}
            <div className='flex flex-col items-center gap-1'>
              <div className='sm:hidden'>
                <CustomIcon name='hand-btn' width={18} height={18} />
              </div>
              <div className='flex font-normal lg:font-semibold'>
                Object
                <span className='hidden sm:block'>ion(s)</span>
              </div>
            </div>
          </Button>
          <Button
            className='!min-w-fit flex-1  gap-2 text-nowrap md:grow-0'
            disabled={loadingMagnaAnswer && isLoadingBtnNumber.current === 3}
            onClick={() => {
              const cond = questionActive !== questionInfo.id;
              handleAutoObjection(
                cond ? questionInfo.answer_document_ids : documentIds,
                cond ? questionInfo.id : questionActive,
              );
            }}
          >
            {loadingMagnaAnswer && isLoadingBtnNumber.current === 3 && <Spinner size='tiny' />}
            <div className='flex flex-col items-center gap-1'>
              <div className='relative sm:hidden'>
                <CustomIcon name='hand-btn' width={18} height={18} />
                <span className='absolute -right-3 -top-2'>A</span>
              </div>
              <div className='flex font-normal lg:font-semibold'>
                Auto Object
                <span className='hidden sm:block'>ion(s)</span>
              </div>
            </div>
          </Button>
        </div>
      </div>
      {isOpenObjectionDialog && (
        <ObjectionDialog
          open={isOpenObjectionDialog}
          objections={objections}
          onCancel={() => setIsOpenObjectionsDialog(false)}
          setIsOpenObjectionsDialog={setIsOpenObjectionsDialog}
          uploadSelectedObjections={uploadSelectedObjects}
          loadingObjection={loadingObjection}
          caseId={caseId}
          objectionsSelected={objectionsSelected}
          getObjectionsList={getObjectionsList}
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
          isAskClient={true}
        />
      )}

      {toasterComponent}
    </>
  );
};

export default InterrogativeBox;
