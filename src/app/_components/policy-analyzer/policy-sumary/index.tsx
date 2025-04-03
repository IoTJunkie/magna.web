'use client';
import PolicySummaryIcon from '@/app/_components/icons/policy-summary-icon';
import { Policy } from '@/app/api/__generated__/api';
import useToastComponent from '@/app/hooks/Toast';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionToggleEventHandler,
  Button,
  Checkbox,
  CheckboxOnChangeData,
  Spinner,
} from '@fluentui/react-components';
import axios from 'axios';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import CustomIcon from '../../common/CustomIcon';

type Props = {
  policySummary: any;
  policy: Policy;
  openPdfPreview?: () => void;
  isMobile?: boolean;
  isLoading?: boolean;
  setPolicySummary: (val: any) => void;
};

interface Item {
  code: string;
  type: 'report' | 'summary';
  label: string;
  content: string | string[];
  checked: boolean;
}

interface Filter {
  report: string[];
  summary: string[];
}

const PolicySummary = (props: Props) => {
  const { policySummary, policy, isMobile, setPolicySummary } = props;
  const [items, setItems] = useState<Item[]>([]);
  const [policySummaryManual, setPolicySummaryManual] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filter, setFilter] = useState<Filter | null>(null);
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const [expandAll, setExpandAll] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [defaultExpand, setDefaultExpand] = useState(true);

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });
  // const isNonEmptyArray = (value: any) => Array.isArray(value) && value.length > 0;
  useEffect(() => {
    setFilter(policy?.filter);
  }, [policy?.filter]);

  const handleExpandAll = () => {
    if (expandAll) {
      setOpenItems([]);
    } else {
      const listCodeItem = items.map((item) => {
        return item.code;
      });
      setOpenItems(listCodeItem);
    }
    setExpandAll(!expandAll);
  };

  useEffect(() => {
    if (items.length && defaultExpand) {
      handleExpandAll();
      setDefaultExpand(false);
    }
  }, [items]);

  const onSetPolicyReport = useCallback(
    (policySummary: any) => {
      if (policySummary?.summary) {
        setPolicySummaryManual(policySummary);
        const reports = policySummary.summary.policy_report_card;
        const summary = policySummary.summary.policy_summary;

        const tmp: Item[] = [];

        if (reports) {
          if (reports?.policy_period?.start_date) {
            tmp.push({
              code: 'policy_period',
              type: 'report',
              label: 'Policy Period',
              content: `${reports.policy_period.start_date}${reports.policy_period.end_date ? '-' : ''}${reports.policy_period.end_date}`,
              checked: filter ? filter.report?.includes('policy_period') : true,
            });
          }
          // name_of_insured
          if (reports?.name_of_insured?.length) {
            tmp.push({
              code: 'name_of_insured',
              type: 'report',
              label: 'Named Insured(s)',
              content: reports.name_of_insured,
              checked: filter ? filter.report?.includes('name_of_insured') : true,
            });
          }
          // property_address
          if (reports?.property_address) {
            tmp.push({
              code: 'property_address',
              type: 'report',
              label: 'Property Address',
              content: `${reports.property_address}`,
              checked: filter ? filter.report?.includes('property_address') : true,
            });
          }
        }

        if (summary && Array.isArray(summary)) {
          summary.map((item: any) => {
            tmp.push({
              code: item.code,
              type: 'summary',
              label: item.headline,
              content: item.content,
              checked: filter ? filter.summary?.includes(item.code) : true,
            });
          });
        }
        const isSelectAll = !tmp.find((item) => item.checked === false);
        setSelectedAll(isSelectAll);
        setItems(tmp);
      }
    },
    [filter],
  );

  useEffect(() => {
    onSetPolicyReport(policySummary);
  }, [filter?.report, filter?.summary, onSetPolicyReport, policySummary]);

  const onSaveSelectReport = async (filter: Filter) => {
    await fetch(`/api/plg/policies/${policy?.id}/update/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filter }),
    });
  };

  const onSelectReport = (
    e: ChangeEvent<HTMLInputElement>,
    data: CheckboxOnChangeData,
    item: Item,
  ) => {
    try {
      const tmp: Filter = filter
        ? { ...filter }
        : {
            report: items.filter((item) => item.type === 'report').map((item) => item.code),
            summary: items.filter((item) => item.type === 'summary').map((item) => item.code),
          };
      if (data.checked) {
        if (tmp[item.type]?.length) {
          tmp[item.type] = [...tmp[item.type], item.code];
        } else tmp[item.type] = [item.code];
      } else tmp[item.type] = tmp[item.type].filter((code) => code !== item.code);
      setFilter(tmp);
      onSaveSelectReport(tmp);
    } catch (error) {}
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
    try {
      setSelectedAll(!!data.checked);
      let tmp: Filter = {
        report: [],
        summary: [],
      };
      if (data.checked) {
        tmp = {
          report: items.filter((item) => item.type === 'report').map((item) => item.code),
          summary: items.filter((item) => item.type === 'summary').map((item) => item.code),
        };
      }
      setFilter(tmp);
      onSaveSelectReport(tmp);
    } catch (error) {}
  };

  const onDownloadPolicyReport = async () => {
    try {
      const session = await getSession();
      let params: any = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/policies/${policy.id}/summary/download/`,
        params,
      );
      if (response.ok) {
        const blob = await response.blob();
        const newBlob = new Blob([blob]);
        const blobUrl = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `${policy.name}_report.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
      } else {
        const res = await response.json();
        setIntent('error');
        setMsg(`${res.error}`);
        showToast();
      }
    } catch (error) {}
  };

  const onGetPolicySummary = async () => {
    try {
      setLoadingSummary(true);
      const url = `/api/plg/policies/${policy.id}/summary/`;
      const response = await axios.get(url);

      if (response.data) {
        setPolicySummaryManual(response.data);
        setPolicySummary(response.data);
        onSetPolicyReport(response.data);
      } else {
        setIntent('error');
        setMsg('Something went wrong. Please try again later.');
        showToast();
      }
    } catch (error) {
      setIntent('error');
      setMsg('Something went wrong. Please try again later.');
      showToast();
      console.log('error :>> ', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleToggle: AccordionToggleEventHandler<string> = (event, data) => {
    const itemExisted = openItems.find((item) => item === data.value);
    let newArr = [];
    if (itemExisted) {
      newArr = openItems.filter((item) => item !== data.value);
    } else {
      newArr = [...openItems, data.value];
    }
    setExpandAll(newArr.length === items.length);
    setOpenItems(newArr);
  };

  return (
    <div
      className={classNames('flex h-full flex-1 flex-col px-6 py-5', {
        '!p-4': isMobile,
      })}
    >
      <div
        className={classNames('mt-[1.25rem] rounded-2xl bg-[#F5F5F5] pb-5', {
          hidden: isMobile,
        })}
      >
        <div className={classNames('flex flex-col justify-end text-sm')}>
          <div className='flex w-full flex-wrap items-center justify-between gap-3 rounded-xl p-5 text-2xl font-medium capitalize leading-8 text-neutrual-800 max-md:max-w-full max-md:flex-wrap'>
            <div className='flex items-center justify-between gap-3'>
              {/* {policySummaryManual?.summary?.policy_type.residential && <PolicySummaryIcon />}
              {policySummaryManual?.summary?.policy_type.commercial && (
                <CustomIcon name='commercial-icon' />
              )}
              {!policySummaryManual?.summary?.policy_type.residential &&
                !policySummaryManual?.summary?.policy_type.commercial && <></>} */}
              <PolicySummaryIcon />
              <div className='flex-auto whitespace-nowrap font-heading'>Policy report card</div>
            </div>
            {policySummaryManual && (
              <div
                onClick={onDownloadPolicyReport}
                hidden={
                  !items.length ||
                  (filter !== null && !filter?.report?.length && !filter?.summary?.length)
                }
                className='flex cursor-pointer items-center gap-2 whitespace-nowrap text-base font-semibold text-aero-7'
              >
                <CustomIcon width={20} height={20} name='download-policy' />
                Download report
              </div>
            )}
          </div>
        </div>
        <div className='pl-5'>
          {!policySummaryManual && (
            <Button
              appearance='primary'
              size='large'
              onClick={onGetPolicySummary}
              disabled={loadingSummary}
            >
              {loadingSummary ? (
                <Spinner size='tiny' className='mr-2' />
              ) : (
                <Image src='/svg/magic-stick.svg' alt='' width={22} height={22} className='mr-2' />
              )}
              {loadingSummary ? 'Generating' : 'Generate'}
            </Button>
          )}
        </div>
        {items.length > 0 && (
          <div className='w-full'>
            <div
              className='m-auto flex h-14 w-[calc(100%-2rem)] cursor-pointer items-center justify-between border-b'
              onClick={handleExpandAll}
            >
              <div className='flex items-center gap-4'>
                <Checkbox
                  onChange={handleSelectAll}
                  onClick={(e) => e.stopPropagation()}
                  checked={selectedAll}
                  className='mx-[-0.11rem]'
                />
                <div className='text-sm font-semibold'>Select All</div>
              </div>
              <div className='mr-[0.4rem]'>
                <CustomIcon
                  width={24}
                  height={24}
                  name={`${expandAll ? 'expand-all' : 'collapse-all'}`}
                />
              </div>
            </div>
          </div>
        )}

        <div
          className='max-h-[calc(100vh-25rem)] overflow-hidden pl-5 pr-[0.375rem] hover:overflow-auto'
          style={{ scrollbarGutter: 'stable' }}
        >
          {!loadingSummary &&
            items &&
            items.map((item) => (
              <div
                className='border-b-border-solid border-b py-4'
                key={`${item.type}-${item.code}`}
              >
                <Accordion collapsible={true} openItems={openItems} onToggle={handleToggle}>
                  <AccordionItem value={item.code}>
                    <AccordionHeader
                      icon={
                        <Checkbox
                          onChange={(e, data) => onSelectReport(e, data, item)}
                          onClick={(e) => e.stopPropagation()}
                          checked={item.checked}
                        />
                      }
                      expandIconPosition='end'
                      className={classNames(
                        '!ml-[-1rem] text-sm [&_button]:!gap-[0.375rem] [&_button]:!font-semibold',
                        {
                          hidden: isMobile,
                        },
                      )}
                    >
                      {item.label}
                    </AccordionHeader>
                    <AccordionPanel className='!ml-1 text-sm !text-color-msg-user-text'>
                      {Array.isArray(item.content)
                        ? item.content.map((content, index) => (
                            <div key={`content-${index}`}>{content}</div>
                          ))
                        : item.content}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
        </div>
      </div>
      {toasterComponent}
    </div>
  );
};

export default PolicySummary;

PolicySummary.displayName = 'PolicySummary';
