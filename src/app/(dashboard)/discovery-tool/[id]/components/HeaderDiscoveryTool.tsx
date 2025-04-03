import CustomIcon from '@/app/_components/common/CustomIcon';
import { ICaseInfo } from '@/app/types/discovery';
import { useOutsideClick } from '@/app/utils/useOutsideClick';
import { Input, Tooltip } from '@fluentui/react-components';
import dayjs from 'dayjs';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Deadline } from '../page';
import { TimeFormat } from '@/config';

interface IHeaderProps {
  deadline: Deadline | null;
  caseInfo: ICaseInfo;
  setCaseInfo: (v: ICaseInfo) => void;
}

const HeaderDiscoveryTool = ({ deadline, caseInfo, setCaseInfo }: IHeaderProps) => {
  const { plaintiffName, defendantName, caseName, caseNumber } = caseInfo;
  const params = useParams();
  const caseId = params.id;
  const [isRename, setIsRename] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const inputCaseNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRename && inputCaseNameRef.current) {
      inputCaseNameRef.current.focus();
    }
  }, [isRename]);

  const onRenameCase = async () => {
    if (!inputValue) {
      setIsRename(false);
      return;
    }
    try {
      const session = await getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify({
            title: inputValue,
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data?.title) {
          setCaseInfo({ ...caseInfo, caseName: data?.title });
        }
      }
    } catch (error) {
    } finally {
      setIsRename(false);
    }
  };

  useOutsideClick(inputCaseNameRef, () => {
    onRenameCase();
  });

  const onKeyDownCaseName = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsRename(false);
      onRenameCase();
    }

    if (e.key === 'Escape') {
      setIsRename(false);
    }
  };

  const onChangeCaseName = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setInputValue(event.target.value);
  };
  return (
    <>
      {caseName && (
        <div className='w-full border-b px-4 py-2 font-semibold text-drover-9 xl:px-12 xl:py-4'>
          <div className='flex w-full flex-wrap items-center justify-between overflow-hidden'>
            <div className='w-[calc(100%-11rem)] lg:w-[calc(100%-14.25rem)]'>
              <div className='flex  gap-2 xl:gap-4'>
                <div className='flex max-w-fit flex-1 flex-col gap-1 truncate'>
                  {plaintiffName && (
                    <Tooltip content={plaintiffName} relationship='label' positioning={'below'}>
                      <h4 className='truncate text-sm leading-5 lg:text-xl'>{plaintiffName}</h4>
                    </Tooltip>
                  )}
                  <span className='text-xs font-normal text-drover-10 lg:text-sm'>
                    Plaintiff(s)
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold lg:text-sm ${!plaintiffName && !defendantName ? 'leading-4' : 'leading-5'}`}
                >
                  vs.
                </span>
                <div className='flex max-w-fit flex-1 flex-col gap-1 truncate'>
                  {defendantName && (
                    <Tooltip content={defendantName} relationship='label' positioning={'below'}>
                      <h4 className='truncate text-sm leading-5 lg:text-xl'>{defendantName}</h4>
                    </Tooltip>
                  )}
                  <span className='text-xs font-normal text-drover-10 lg:text-sm'>
                    Defendant(s)
                  </span>
                </div>
              </div>
            </div>
            <div className='flex max-w-40 flex-col gap-1 lg:max-w-56 lg:gap-2.5'>
              <div className='flex flex-col gap-1 lg:gap-2'>
                <div className='flex items-center gap-1 leading-5'>
                  {isRename ? (
                    <Input
                      defaultValue={caseName}
                      appearance='outline'
                      onChange={onChangeCaseName}
                      onKeyDown={(e) => onKeyDownCaseName(e)}
                      width={190}
                      className='w-[11.875rem]'
                      maxLength={254}
                      ref={inputCaseNameRef}
                    />
                  ) : (
                    <div className='flex h-6 w-full items-center justify-end gap-2'>
                      <div className='max-w-80 truncate text-base lg:text-xl'>{caseName}</div>
                      <div
                        className='flex-none cursor-pointer'
                        onClick={() => {
                          setIsRename(true);
                        }}
                      >
                        <CustomIcon name='edit-case-name' width={16} height={16} />
                      </div>
                    </div>
                  )}
                </div>
                {caseNumber && (
                  <span className='text-right text-xs font-normal leading-5 text-drover-10 lg:text-sm'>
                    Case No: {caseNumber}
                  </span>
                )}
              </div>
              {deadline && (
                <span
                  className={` ${deadline?.backgroudColor}
                   flex items-center text-nowrap rounded-md px-2 py-1 text-xs font-bold !leading-4 text-white lg:text-sm`}
                >
                  Deadline: {dayjs(deadline?.name).format(TimeFormat.mdy)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderDiscoveryTool;
