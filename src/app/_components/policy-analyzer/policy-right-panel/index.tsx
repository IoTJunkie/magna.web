'use client';
import PolicyPreview from '@/app/_components/policy-analyzer/policy-preview';
import PolicySummary from '@/app/_components/policy-analyzer/policy-sumary';
import { Policy } from '@/app/api/__generated__/api';
import classNames from 'classnames';
import React, { useCallback } from 'react';

type Props = {
  policySummary: unknown;
  policy: Policy;
  isLoading?: boolean;
  isActiveViewFile: boolean;
  setIsActiveViewFile: (val: boolean) => void;
  setPolicySummary: (val: any) => void;
};

const PolicyRightPanel = (props: Props) => {
  const {
    policySummary,
    policy,
    isLoading,
    isActiveViewFile,
    setIsActiveViewFile,
    setPolicySummary,
  } = props;

  const openPdfPreview = useCallback(() => {
    setIsActiveViewFile(true);
  }, []);

  const closePdfPreview = useCallback(() => {
    setIsActiveViewFile(false);
  }, []);

  return (
    <div className='flex h-full flex-1 flex-col border-l border-neutrual-50'>
      {isActiveViewFile && <PolicyPreview {...{ policy, closePdfPreview }} />}
      <div
        className={classNames({
          hidden: isActiveViewFile,
        })}
      >
        <PolicySummary
          {...{
            policySummary,
            policy,
            openPdfPreview,
            isLoading,
            setPolicySummary,
          }}
        />
      </div>
    </div>
  );
};

export default PolicyRightPanel;

PolicyRightPanel.displayName = 'PolicyRightPanel';
