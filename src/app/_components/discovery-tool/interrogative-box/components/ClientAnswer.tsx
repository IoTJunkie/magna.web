import CustomIcon from '@/app/_components/common/CustomIcon';
import { IMagnaAnswer } from '@/app/types/interrogative';
import { TimeFormat } from '@/config';
import { Button } from '@fluentui/react-components';
import { ChevronLeft24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import dayjs from 'dayjs';
import React, { useState } from 'react';

type Props = {
  answers: IMagnaAnswer[];
};

const ClientAnswer = ({ answers }: Props) => {
  const length = answers.length;
  const [answerTh, setAnswerTh] = useState(0);
  const onPrevAnswer = () => {
    setAnswerTh(answerTh - 1);
  };
  const onNextAnswer = () => {
    setAnswerTh(answerTh + 1);
  };

  return (
    <div className='mt-[1.5rem] flex-1 flex-col md:mt-0'>
      <div className='mb-[0.5rem] flex items-center gap-2'>
        <div className='flex items-center justify-center'>
          <CustomIcon name='client-answer' width={28} height={28} />
        </div>
        <h4 className='font-inter text-base font-semibold leading-[1.25rem] text-color-text-default'>
          Client Answer
        </h4>
        <div className='text-xs text-aero-13'>
          {`(${dayjs(answers[answerTh].created).format(TimeFormat.full)})`}
        </div>
      </div>
      <div className='min-h-[4.125rem] rounded-[0.25rem] border border-[#A7ACD3] p-2'>
        {answers[answerTh].answer || ''}
      </div>
      <div className='mt-2 flex items-center gap-2'>
        <Button
          onClick={onPrevAnswer}
          appearance='transparent'
          disabled={answerTh === 0}
          icon={<ChevronLeft24Regular />}
          className='!h-5 !min-h-5 !w-5 !min-w-5 !p-0'
        />
        <div className='text-sm'> {`${answerTh + 1}/${length}`} </div>
        <Button
          onClick={onNextAnswer}
          appearance='transparent'
          disabled={answerTh === length - 1}
          icon={<ChevronRight24Regular />}
          className='!h-5 !min-h-5 !w-5 !min-w-5 !p-0'
        />
      </div>
    </div>
  );
};

export default ClientAnswer;
