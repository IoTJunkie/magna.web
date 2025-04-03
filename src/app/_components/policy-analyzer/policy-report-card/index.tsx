'use client';
import FileIcon from '@/app/_components/icons/file-icon';
import { Policy } from '@/app/api/__generated__/api';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  CheckboxOnChangeData,
  Spinner,
} from '@fluentui/react-components';
import classNames from 'classnames';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import CustomIcon from '../../common/CustomIcon';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import axios from 'axios';
import PolicySummaryIcon from '../../icons/policy-summary-icon';

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

const PolicyReportCard = ({
  policySummary,
  policy,
  isMobile,
  isLoading,
}: {
  policySummary: any;
  policy: Policy;
  isMobile?: boolean;
  isLoading?: boolean;
}) => {
  const [cardData, setCardData] = useState<
    { key: string; value: string | undefined; label: string }[]
  >([]);

  const [filter, setFilter] = useState<Filter | null>(null);
  const [selectedAll, setSelectedAll] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [expandAll, setExpandAll] = useState(false);
  const [defaultExpand, setDefaultExpand] = useState(true);
  const [policySummaryManual, setPolicySummaryManual] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

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

  useEffect(() => {
    const reportCard = policySummary?.summary?.policy_report_card;
    const data: { key: string; value: string | undefined; label: string }[] = [
      {
        key: 'name_of_insured',
        label: 'Named Insured(s)',
        value: reportCard?.name_of_insured && reportCard?.name_of_insured.join(', '),
      },
      {
        key: 'policy_period',
        label: 'Policy Period',
        value: reportCard?.policy_period?.start_date + '-' + reportCard?.policy_period?.end_date,
      },
      {
        key: 'property_address',
        label: 'Property Address',
        value: reportCard?.property_address,
      },
    ];
    setCardData(data);
  }, [policySummary]);

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

  console.log('policySummary', policySummary);

  const onSaveSelectReport = async (filter: Filter) => {
    await fetch(`/api/plg/policies/${policy.id}/update/`, {
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
      }
    } catch (error) {}
  };

  const onGetPolicySummary = async () => {
    try {
      setLoadingSummary(true);
      const url = `/api/plg/policies/${policy.id}/summary/`;
      const response = await axios.get(url);

      setPolicySummaryManual(response.data);
      onSetPolicyReport(response.data);
    } catch (error) {
      console.log('error :>> ', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleToggle = (
    event: React.SyntheticEvent<HTMLDivElement>,
    data: { openItems: string[] },
  ) => {
    setExpandAll(data.openItems.length === items.length);
    setOpenItems(data.openItems);
  };

  return (
    <div className='mb-4 w-full'>
      <div className='max-w-chat-layout mx-auto mt-5'>
        <Accordion
          defaultOpenItems={'1'}
          collapsible
          className={classNames('rounded-2xl bg-aero-5 p-3', {
            '!bg-residential': policySummary?.summary?.policy_type.residential,
          })}
        >
          <AccordionItem value='1'>
            <AccordionHeader
              icon={<FileIcon />}
              expandIconPosition='end'
              className={classNames({ hidden: isMobile })}
            >
              <h4 className='font-heading text-xl font-medium'>Policy report card</h4>
            </AccordionHeader>
            <AccordionPanel>
              <div className='mt-6'>
                {isLoading ? (
                  <div className='lex items-center justify-center'>
                    <Spinner size='small' />
                  </div>
                ) : (
                  <>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center justify-between gap-3'>
                          {/* {policySummaryManual?.summary?.policy_type.residential && (
                            <PolicySummaryIcon />
                          )}
                          {policySummaryManual?.summary?.policy_type.commercial && (
                            <CustomIcon name='commercial-icon' />
                          )}
                          {!policySummaryManual?.summary?.policy_type.residential &&
                            !policySummaryManual?.summary?.policy_type.commercial && <></>} */}
                          <PolicySummaryIcon />
                          <div className='text-2xl font-medium'>Policy report card</div>
                        </div>
                      </div>
                      <div
                        onClick={onDownloadPolicyReport}
                        hidden={
                          !items.length ||
                          (filter !== null && !filter?.report?.length && !filter?.summary?.length)
                        }
                      >
                        <CustomIcon
                          name='download_report'
                          width={20}
                          height={20}
                          className='hover:cursor-pointer'
                        />
                      </div>
                    </div>
                    <div className='pt-4'>
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
                            <Image
                              src='/svg/magic-stick.svg'
                              alt=''
                              width={22}
                              height={22}
                              className='mr-2'
                            />
                          )}
                          {loadingSummary ? 'Generating' : 'Generate'}
                        </Button>
                      )}
                    </div>
                    {items.length > 0 && (
                      <div
                        className='m-auto flex h-14 cursor-pointer items-center justify-between border-y'
                        onClick={handleExpandAll}
                      >
                        <div className='flex items-center'>
                          <Checkbox
                            onChange={handleSelectAll}
                            onClick={(e) => e.stopPropagation()}
                            checked={selectedAll}
                            className='mx-[-0.3rem]'
                          />
                          <div className='pl-5 text-sm font-semibold'>Select All</div>
                        </div>
                        <div className='mr-[0.55rem]'>
                          <CustomIcon
                            width={24}
                            height={24}
                            name={`${expandAll ? 'expand-all' : 'collapse-all'}`}
                          />
                        </div>
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item.code} className='border-b border-b-neutrual-50'>
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
                              )}
                            >
                              {item.label}
                            </AccordionHeader>
                            <AccordionPanel className='!ml-1 pb-4 text-sm !text-color-msg-user-text'>
                              {Array.isArray(item.content)
                                ? item.content.map((content, index) => (
                                    <div key={`content-mobile-${index}`}>{content}</div>
                                  ))
                                : item.content}
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default PolicyReportCard;

PolicyReportCard.displayName = 'PolicyReportCard';
