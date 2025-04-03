import CustomIcon from '@/app/_components/common/CustomIcon';
import {
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
} from '@fluentui/react-components';
import { useOutsideClick } from '@/app/utils/useOutsideClick';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { ExtractionStatus } from '@/app/types/discovery';
import DialogComponent from '@/app/_components/common/Dialog';
import { TimeFormat } from '@/config';

type Item = {
  id: string;
  caseName: string;
  deadline: string;
  createdDate: string;
  status: boolean;
};

type ICaseCardProps = {
  num: number;
  item: Item;
  onDeleteCase: Function;
  onRenameCase: Function;
  setInputValue: Function;
};

const CaseCard = (props: ICaseCardProps) => {
  const { id, caseName, deadline, createdDate, status } = props.item;
  const { num, onDeleteCase, onRenameCase, setInputValue } = props;
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isRename, setIsRename] = useState(false);
  const [show, setShow] = useState(false);
  const [isGeneratingPR, setIsGeneratingPR] = useState<boolean>(false);

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const menuPopupContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useOutsideClick(menuPopupContainerRef, () => {
    setSelectedRowId(null);
  });

  useOutsideClick(inputContainerRef, () => {
    if (isRename) {
      onRenameCase(selectedCaseId); // call onSubmit when clicked outside
    }
  });

  const onChangeCaseName = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setInputValue(event.target.value);
  };

  const onKeyDownCaseName = (e: React.KeyboardEvent<HTMLInputElement>, caseId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsRename(false);
      onRenameCase(caseId);
    }

    if (e.key === 'Escape') {
      setIsRename(false);
    }
  };

  const options = useMemo(() => {
    return [
      {
        id: 'ED',
        icon: 'rename',
        label: 'Edit',
        onClick: (item: Item) => {
          setIsRename(true);
          setSelectedCaseId(item.id);
        },
        className: '',
      },
      {
        id: 'DP',
        icon: 'delete',
        label: 'Delete',
        onClick: (item: Item) => {
          setShow(true);
          setSelectedCaseId(item.id);
        },
        className: '!text-color-critical',
      },
    ];
  }, [isGeneratingPR]);

  useEffect(() => {
    if (isRename) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isRename]);

  return (
    <>
      <div className='flex justify-between border-b-[0.046875rem] border-[#DBDBDE] p-[0.5rem_0.25rem_0.75rem_0.25rem] md:hidden'>
        <div className='flex gap-2'>
          <h5 className='font-inter text-xs font-normal leading-4 text-color-text-default'>
            {num}.
          </h5>
          <div className='flex flex-col items-start'>
            <h3 className='mb-[0.5rem] text-ellipsis text-sm font-bold leading-5 text-color-text-default'>
              {isRename && id === selectedCaseId ? (
                <div ref={inputContainerRef}>
                  <Input
                    defaultValue={caseName}
                    appearance='outline'
                    id={id}
                    onChange={onChangeCaseName}
                    onKeyDown={(e) => onKeyDownCaseName(e, id)}
                    maxLength={255}
                    ref={inputRef}
                  />
                </div>
              ) : (
                caseName
              )}
            </h3>
            <div className='flex items-center gap-2'>
              <p className='text-ellipsis text-xs font-normal leading-4 text-[#BDBDBD]'>
                Created: {dayjs(createdDate).format(TimeFormat.mdy)}
              </p>
              <span
                className={classNames('w-fit !grow-0 !basis-auto rounded px-2 text-xs font-bold', {
                  'bg-aero-18 !text-aero-15': status === true,
                  'bg-aero-16 !text-aero-17': status === null,
                  'bg-aero-20 !text-aero-19': status === false,
                })}
              >
                {status === true && ExtractionStatus.SUCCESS}
                {status === false && ExtractionStatus.ERROR}
                {status === null && ExtractionStatus.PROCESSING}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className='font-inter mb-[0.3125rem] text-ellipsis text-xs font-normal leading-4 text-color-text-default'>
            Deadline: {deadline ? dayjs(deadline).format(TimeFormat.mdy) : ''}
          </div>
          <div className='flex w-full justify-end gap-2'>
            {status ? (
              <Link href={`/discovery-tool/${id}`}>
                <Tooltip content='Ask' relationship='label'>
                  <CustomIcon name='ask-icon' className='hover:cursor-pointer' />
                </Tooltip>
              </Link>
            ) : (
              <Image src='/svg/ask-icon-disable.svg' alt='' width={24} height={24} />
            )}
            <Menu open={selectedRowId === id}>
              <MenuTrigger disableButtonEnhancement>
                <div onClick={() => setSelectedRowId(id)}>
                  <CustomIcon name='options' className='hover:cursor-pointer' />
                </div>
              </MenuTrigger>

              <MenuPopover
                className='!py-2 text-sm font-normal text-color-text-default'
                ref={menuPopupContainerRef}
              >
                <MenuList>
                  {options.map((option) => (
                    <MenuItem
                      key={option.label}
                      icon={
                        <CustomIcon
                          name={option.icon}
                          className={classNames({
                            'animate-spin': option.id === 'GPR' && isGeneratingPR,
                          })}
                        />
                      }
                      onClick={() => {
                        if (option.id === 'DPR' && !status) return;
                        option.onClick(props.item);
                      }}
                      className={classNames(option.className, {
                        '!cursor-not-allowed opacity-30':
                          (option.id === 'DPR' && !status) ||
                          (option.id === 'GPR' && !status) ||
                          (option.id === 'GPR' && isGeneratingPR),
                      })}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
      {show && (
        <DialogComponent
          open={show}
          title='Delete confirmation'
          content='This Case will be deleted.'
          textCancel='Cancel'
          textConfirm='Delete'
          onConfirm={() => onDeleteCase(selectedCaseId)}
          onCancel={() => setShow(false)}
        />
      )}
    </>
  );
};

export default CaseCard;
