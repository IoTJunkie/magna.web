import CustomIcon from '@/app/_components/common/CustomIcon';
import useToastComponent from '@/app/hooks/Toast';
import { Button, Spinner } from '@fluentui/react-components';
import classNames from 'classnames';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

interface IInterrogativeQuestionFormProps {
  questionDetail: string;
  isLinkExpired: boolean;
}
const ExpiredLink = () => {
  return (
    <div className='flex flex-col items-center'>
      <CustomIcon name='alert-icon' width={88} height={88} className='hidden sm:block' />
      <CustomIcon name='alert-icon' width={45} height={45} className='hidden max-sm:block' />
      <div className='mt-6 flex flex-col font-[600] text-[#111827]'>
        <span className='text-center'>Link has expired.</span>
        <span>Please contact your lawyer or admin for the updated form.</span>
      </div>
    </div>
  );
};

const InterrogativeQuestionForm = ({
  questionDetail,
  isLinkExpired,
}: IInterrogativeQuestionFormProps) => {
  const [isRecorded, setIsRecorded] = useState<boolean>(false);
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { question_id, otp } = params;
  const handleChangeVlue = (val: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(val.target.value);
  };

  const { showToast, toasterComponent, setIntent } = useToastComponent({
    content: msg,
  });

  const handleSubmit = async () => {
    if (question_id && otp) {
      try {
        setLoading(true);
        const params = { client_answer: value };
        const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/${question_id}/client-answer/${otp}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        if (response.ok) {
          setIsRecorded(true);
        } else {
          const res = await response.json();
          setMsg(res.error);
          setIntent('error');
          showToast();
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const showContent = () => {
    if (isLinkExpired) return <ExpiredLink />;
    return (
      <>
        {!isRecorded ? (
          <div className='flex flex-col'>
            <p className='mb-[0.625rem] text-[0.875rem] font-[600] leading-[1.25rem] text-[#111827]'>
              {questionDetail} <span className='text-color-critical'>*</span>
            </p>
            <textarea
              className='mb-[3rem] max-h-[9.125rem] min-h-[9.125rem] w-full resize-none rounded-[0.25rem] border-[0.0625rem] border-neutrual-50 p-[0.5rem_1rem] text-[#111827]'
              onChange={handleChangeVlue}
              placeholder='Enter answer'
            />
            <div className='flex w-full justify-end'>
              <Button
                className={classNames('!flex !w-[5.25rem] !justify-center gap-2 !p-[0.5rem_1rem]', {
                  '!bg-aero-7 !text-white': value.trim().length,
                })}
                onClick={() => {
                  handleSubmit();
                }}
                disabled={!value.trim().length}
              >
                {loading && <Spinner size='tiny' />}
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className='my- my-[2.5rem] flex flex-col items-center justify-center gap-[1.5rem]'>
            <CustomIcon name='icon-success' width={88} height={88} />
            <p className='text-[1rem] font-[700] leading-[1.375rem] text-[#242424]'>
              Your response has been recorded.
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='flex w-full flex-col justify-center'>
      <h3 className='mb-[0.375rem] text-[2rem] font-[600] leading-[2.5rem] text-[#111827]'>
        Interrogative Answer Form
      </h3>
      <p className='mb-[1.5rem] text-[1rem] font-[400] leading-[1.5rem] text-[#111827]'>
        Case infomation - Lawyer
      </p>
      {showContent()}
      {toasterComponent}
    </div>
  );
};

export default InterrogativeQuestionForm;
