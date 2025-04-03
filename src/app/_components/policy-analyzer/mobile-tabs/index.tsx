'use client';
import Chat from '@/app/_components/conversation/chat';
import PolicyReportCard from '@/app/_components/policy-analyzer/policy-report-card';
import PolicySummary from '@/app/_components/policy-analyzer/policy-sumary';
import { Policy } from '@/app/api/__generated__/api';
import { SelectTabData, SelectTabEvent, Tab, TabList, TabValue } from '@fluentui/react-components';
import { useState } from 'react';
import PreviewFile from '../../common/PreviewFile';
import { FileDoc } from '@/app/types/fileDoc';

type Props = {
  policySummary: unknown;
  policy: Policy;
  setPolicySummary: (val: any) => void;
};

export const PolicyMobileTabs = (props: Props) => {
  const [selectedValue, setSelectedValue] = useState<TabValue>('tab1');

  const { policySummary, policy, setPolicySummary } = props;

  const onTabSelect = (event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  const firstDocument = policy?.documents && policy.documents[0];

  return (
    <div className='flex h-full flex-col md:hidden'>
      <TabList
        defaultSelectedValue='tab1'
        selectedValue={selectedValue}
        onTabSelect={onTabSelect}
        className='flex max-w-full shrink overflow-x-auto px-4 py-5'
      >
        <Tab value='tab1'>Policy report card</Tab>
        <Tab value='tab2'>AI Chat</Tab>
        <Tab value='tab3'>Policy</Tab>
      </TabList>

      <div className='flex size-full flex-1 flex-col md:hidden'>
        {selectedValue === 'tab1' && (
          <div className='p-4'>
            <PolicyReportCard {...{ policySummary, policy, isMobile: true }} />
          </div>
        )}
        {selectedValue === 'tab2' && <Chat />}
        {selectedValue === 'tab3' && firstDocument?.url && (
          <div className='mt-4 flex-1 p-4'>
            <PreviewFile
              linkDocs={policy?.documents as FileDoc[]}
              expandDocs={false}
              onSetExpandDocs={() => {}}
              isMobile
            />
          </div>
        )}
        {selectedValue === 'tab4' && (
          <PolicySummary
            {...{
              policySummary,
              policy,
              isMobile: true,
              setPolicySummary: setPolicySummary,
            }}
          />
        )}
      </div>
    </div>
  );
};
