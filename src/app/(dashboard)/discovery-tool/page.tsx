'use client';

import useAbortableFetch from '@/app/hooks/useAbortableFetch';
import fetchData from '@/app/utils/fetchData';
import urlEncode from '@/app/utils/urlEncode';
import { Paginated, TimeFormat } from '@/config';
import {
  Button,
  createTableColumn,
  Field,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  Tooltip,
  useTableColumnSizing_unstable,
  useTableFeatures,
  useTableSelection,
} from '@fluentui/react-components';
import classNames from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import ReactPaginate from 'react-paginate';
import useToastComponent from '@/app/hooks/Toast';
import DialogComponent from '@/app/_components/common/Dialog';
import EditIcon from '@/app/_components/icons/edit-icon';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash.debounce';
import { useOutsideClick } from '@/app/utils/useOutsideClick';
import CustomIcon from '@/app/_components/common/CustomIcon';
import { useSidebar } from '@/contexts/SidebarContext';
import { DiscoveryItem, ExtractionStatus } from '@/app/types/discovery';
import dayjs from 'dayjs';
import CaseCard from './components/CaseCard';

type Item = {
  id: string;
  caseName: string;
  deadline: string;
  createdDate: string;
  status: boolean;
};

interface Data extends Paginated<DiscoveryItem[]> {
  total_pages: number;
}

const columnsDef: TableColumnDefinition<Item>[] = [
  createTableColumn<Item>({
    columnId: 'no',
    renderHeaderCell: () => <>No</>,
  }),
  createTableColumn<Item>({
    columnId: 'caseName',
    renderHeaderCell: () => <>Case name</>,
  }),
  createTableColumn<Item>({
    columnId: 'deadline',
    renderHeaderCell: () => <>Deadline</>,
  }),
  createTableColumn<Item>({
    columnId: 'createdDate',
    renderHeaderCell: () => <>Created date</>,
  }),
  createTableColumn<Item>({
    columnId: 'status',
    renderHeaderCell: () => <>Status</>,
  }),
  createTableColumn<Item>({
    columnId: 'ask',
    renderHeaderCell: () => <></>,
  }),
  createTableColumn<Item>({
    columnId: 'action',
    renderHeaderCell: () => <></>,
  }),
];

const DiscoveryToolPage = () => {
  const router = useRouter();
  const queryParams = useSearchParams();
  const { resetRefreshCaseHistory } = useSidebar();
  const [columns] = useState<TableColumnDefinition<Item>[]>(columnsDef);
  const [search, setSearch] = useState<string>(queryParams.get('search') ?? '');
  const [isGeneratingPR, setIsGeneratingPR] = useState<boolean>(false);

  const [page, setPage] = useState<number>(queryParams.get('page') ? +queryParams.get('page')! : 1);
  const targetRef = useRef<HTMLDivElement>(null);
  const ITEM_PER_PAGE = 10;

  const [msg, setMsg] = useState<JSX.Element | string>('');
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });
  const [show, setShow] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const menuPopupContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(null);
  const [caseSelected, setCaseSelected] = useState<Item[] | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const { abortSignal } = useAbortableFetch();

  const columnSizingOptions = useMemo(() => {
    return {
      no: {
        idealWidth: 80,
        minWidth: 80,
      },
      caseName: {
        minWidth: 250,
        idealWidth: 600,
      },
      deadline: {
        minWidth: 150,
        idealWidth: 300,
      },
      createdDate: {
        minWidth: 150,
        idealWidth: 300,
      },
      status: {
        minWidth: 180,
        idealWidth: 300,
      },
      ask: {
        minWidth: 150,
        idealWidth: 300,
      },
      action: {
        minWidth: 70,
        idealWidth: 300,
      },
    };
  }, []);

  useEffect(() => {
    if (isRename) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isRename]);

  const getCases = useCallback(async () => {
    try {
      const endCodedParams = urlEncode({ page: page, search: search });
      const session = await getSession();

      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases?${endCodedParams}`;
      const response = await fetchData<Data>(url, {
        signal: abortSignal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }, [abortSignal, page, search]);

  const searchParams = { page, search };

  const { data, error, isFetching, isLoading, refetch } = useQuery(
    ['discovery', searchParams],
    getCases,
    {
      keepPreviousData: true,
    },
  );

  const onDeleteCase = async (caseId: string) => {
    console.log('delete case: ', caseId);
    try {
      const session = await getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      console.log('response--->', response);
      if (response.ok) {
        resetRefreshCaseHistory(true);
      }
      const res = await response.json();
      if (res.error) {
        setIntent('error');
        setMsg(res.error);
        showToast();
      }
    } catch (error) {
      console.log('Error--->', error);
    } finally {
      refetch();
      setShow(false);
    }
  };

  const onRenameCase = async (caseId: string) => {
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
        resetRefreshCaseHistory(true);
      }
      refetch();
      setIsRename(false);
    } catch (error) {}
  };

  useOutsideClick(inputContainerRef, () => {
    if (isRename) {
      onRenameCase(selectedCaseId); // call onSubmit when clicked outside
    }
  });

  useOutsideClick(menuPopupContainerRef, () => {
    setSelectedRowId(null);
  });

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

  const items = useMemo(() => {
    if (data?.count) {
      return data.results.map((item) => ({
        id: item.id,
        caseName: item.title,
        deadline: item.deadline ? dayjs(item.deadline).format(TimeFormat.mdy) : '',
        createdDate: dayjs(item.created).format(TimeFormat.mdy),
        status: item.extraction_status,
      }));
    }
    return [];
  }, [data]);

  const {
    getRows,
    columnSizing_unstable,
    tableRef,
    selection: {
      allRowsSelected,
      selectedRows,
      someRowsSelected,
      toggleAllRows,
      toggleRow,
      isRowSelected,
      clearRows,
    },
  } = useTableFeatures(
    {
      columns,
      items,
    },
    [
      useTableColumnSizing_unstable({ columnSizingOptions }),
      useTableSelection({
        selectionMode: 'multiselect',
      }),
    ],
  );

  useEffect(() => {
    if (selectedRows.size > 0) {
      const selectedObjects = Array.from(selectedRows).map((index) => items[index as number]);
      setCaseSelected(selectedObjects);
    } else {
      setCaseSelected(null);
    }
  }, [selectedRows, items]);

  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);
    return {
      ...row,
      onClick: (e: React.MouseEvent) => {
        toggleRow(e, row.rowId);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
          e.preventDefault();
          toggleRow(e, row.rowId);
        }
      },
      selected,
      appearance: selected ? ('brand' as const) : ('none' as const),
    };
  });

  const toggleAllKeydown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ') {
        toggleAllRows(e);
        e.preventDefault();
      }
    },
    [toggleAllRows],
  );

  const clearAllRows = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      clearRows(e);
      e.preventDefault();
    },
    [clearRows],
  );

  const triggerClearAllRows = () => {
    const elm = document.getElementById('clear');
    if (elm) {
      elm.click();
    }
  };

  const isProcessing = useMemo(() => {
    if (rows.length === 0) return false;
    return rows.some((row) => row.item.status === null);
  }, [rows]);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isProcessing, refetch]);

  if (error) {
    return 'An error has occurred: ' + (error as any).message;
  }

  const onScrollTable = () => {
    if (targetRef?.current)
      targetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
  };

  const handlePageClick = ({ selected }: any) => {
    setPage(selected + 1);
    router.push(search ? `?search=${search}&page=${selected + 1}` : `?page=${selected + 1}`);
    onScrollTable();
  };

  const handleSearchCaseName = debounce((caseName: string) => {
    setSearch(caseName);
    setPage(1);
    router.push(`?search=${caseName}`);
    onScrollTable();
  }, 200);

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

  const handleDeleteCases = () => {};

  return (
    <>
      <div className='flex h-full flex-col gap-8 p-5 pt-[3.75rem] md:!p-10'>
        <div className='flex items-center justify-between'>
          <div className='font-heading text-[2rem] font-semibold capitalize leading-10 text-neutrual-900'>
            Case list
          </div>
          <div>
            <Link href='/discovery-tool/new'>
              <Button
                size='large'
                appearance='primary'
                className='flex items-center gap-[0.625rem] !px-[0.9375rem] !py-[0.4375rem]'
              >
                <CustomIcon name='create-new' width={24} height={24} />
                Create new
              </Button>
            </Link>
          </div>
        </div>
        <div>
          <Field
            required
            validationMessageIcon={null}
            className='w-full lg:w-1/3 xl:w-1/4 [&_label]:!font-semibold [&_label]:text-neutrual-900'
          >
            <Input
              placeholder='Search Case name'
              size='large'
              className='mb-0 !text-sm [&_input]:p-0'
              maxLength={254}
              onChange={(e) => handleSearchCaseName(e.target.value)}
              contentBefore={<CustomIcon name='search-icon' />}
              defaultValue={search}
            />
          </Field>
        </div>

        {isFetching && isLoading ? (
          <></>
        ) : !!data?.count ? (
          <>
            <div className='overflow-x-auto overflow-y-hidden rounded-lg !border !border-[#E5E5E5]'>
              <Table
                noNativeElements
                sortable
                aria-label='Table with sort'
                ref={tableRef}
                {...columnSizing_unstable.getTableProps()}
                className='relative'
              >
                <TableHeader className='!bg-bg-table-header text-sm text-neutrual-900 [&_*]:!font-bold [&_th]:p-3'>
                  <TableRow>
                    {/* <TableSelectionCell
                      checked={allRowsSelected ? true : someRowsSelected ? 'mixed' : false}
                      onClick={toggleAllRows}
                      onKeyDown={toggleAllKeydown}
                      checkboxIndicator={{ 'aria-label': 'Select all rows ' }}
                      ref={selectAllRef}
                    /> */}
                    {columns.map((column) => (
                      <Menu openOnContext key={column.columnId}>
                        <MenuTrigger>
                          <TableHeaderCell
                            key={column.columnId}
                            {...columnSizing_unstable.getTableHeaderCellProps(column.columnId)}
                            className={classNames('min-h-14 items-center', {
                              '[&_*]:!justify-center':
                                column.columnId === 'action' || column.columnId === 'no',
                            })}
                          >
                            {column.renderHeaderCell()}
                          </TableHeaderCell>
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem
                              onClick={columnSizing_unstable.enableKeyboardMode(column.columnId)}
                            ></MenuItem>
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    ))}
                  </TableRow>
                </TableHeader>
                {isFetching && (
                  <div className='absolute top-1/2 w-full'>
                    <Spinner size='small' />
                  </div>
                )}
                <TableBody
                  className='h-[50vh] overflow-auto md:h-[calc(100vh-26.25rem)]'
                  ref={targetRef}
                >
                  {rows.map(({ item, selected, onClick, onKeyDown, appearance }, index) => (
                    <TableRow
                      key={item.id}
                      className='min-h-14 !border-b-[0.0625rem] !border-[#e0e0e0] !bg-white text-sm [&_td]:!px-3 [&_td]:text-primary'
                      onClick={onClick}
                      onKeyDown={onKeyDown}
                      aria-selected={selected}
                      appearance={appearance}
                    >
                      {/* <TableSelectionCell
                        checked={selected}
                        checkboxIndicator={{ 'aria-label': 'Select row' }}
                      /> */}
                      <TableCell {...columnSizing_unstable.getTableCellProps('no')}>
                        <TableCellLayout truncate className='flex w-full justify-center'>
                          {(page - 1) * ITEM_PER_PAGE + 1 + index}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell
                        {...columnSizing_unstable.getTableCellProps('caseName')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCellLayout truncate>
                          {isRename && item.id === selectedCaseId ? (
                            <div ref={inputContainerRef}>
                              <Input
                                defaultValue={item.caseName}
                                appearance='outline'
                                id={item.id}
                                onChange={onChangeCaseName}
                                onKeyDown={(e) => onKeyDownCaseName(e, item.id)}
                                maxLength={255}
                                ref={inputRef}
                              />
                            </div>
                          ) : (
                            item.caseName
                          )}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell {...columnSizing_unstable.getTableCellProps('deadline')}>
                        <TableCellLayout truncate>{item.deadline}</TableCellLayout>
                      </TableCell>
                      <TableCell {...columnSizing_unstable.getTableCellProps('createdDate')}>
                        <TableCellLayout truncate>{item.createdDate}</TableCellLayout>
                      </TableCell>
                      <TableCell {...columnSizing_unstable.getTableCellProps('status')}>
                        <TableCellLayout
                          truncate
                          className={classNames(
                            'w-fit !grow-0 !basis-auto rounded px-2 py-[0.375rem] text-xs font-bold',
                            {
                              'bg-aero-18 !text-aero-15': item.status === true,
                              'bg-aero-16 !text-aero-17': item.status === null,
                              'bg-aero-20 !text-aero-19': item.status === false,
                            },
                          )}
                        >
                          {item.status === true && ExtractionStatus.SUCCESS}
                          {item.status === false && ExtractionStatus.ERROR}
                          {item.status === null && ExtractionStatus.PROCESSING}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell
                        {...columnSizing_unstable.getTableCellProps('ask')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCellLayout className='flex w-full justify-center'>
                          {item.status ? (
                            <Link href={`/discovery-tool/${item.id}`}>
                              <Tooltip
                                content='Ask'
                                relationship='inaccessible'
                                withArrow
                                positioning='above-start'
                              >
                                <div>
                                  <CustomIcon name='ask-icon' className='hover:cursor-pointer' />
                                </div>
                              </Tooltip>
                            </Link>
                          ) : (
                            <Tooltip content='Ask' relationship='label'>
                              <div>
                                <Image
                                  src='/svg/ask-icon-disable.svg'
                                  alt=''
                                  width={24}
                                  height={24}
                                />
                              </div>
                            </Tooltip>
                          )}
                        </TableCellLayout>
                      </TableCell>
                      <TableCell
                        {...columnSizing_unstable.getTableCellProps('action')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableCellLayout truncate className='justify-center'>
                          <Menu open={selectedRowId === item.id}>
                            <MenuTrigger disableButtonEnhancement>
                              <div onClick={() => setSelectedRowId(item.id)}>
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
                                      if (option.id === 'DPR' && !item.status) return;
                                      option.onClick(item);
                                    }}
                                    className={classNames(option.className, {
                                      '!cursor-not-allowed opacity-30':
                                        (option.id === 'DPR' && !item.status) ||
                                        (option.id === 'GPR' && !item.status) ||
                                        (option.id === 'GPR' && isGeneratingPR),
                                    })}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </MenuList>
                            </MenuPopover>
                          </Menu>
                        </TableCellLayout>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {isFetching && (
              <div className='absolute top-1/2 w-full md:hidden'>
                <Spinner size='small' />
              </div>
            )}

            {items &&
              items.map((item, i) => (
                <CaseCard
                  item={item}
                  key={i}
                  num={i + 1}
                  onDeleteCase={onDeleteCase}
                  onRenameCase={onRenameCase}
                  setInputValue={setInputValue}
                />
              ))}

            <div className='flex flex-col items-end justify-between gap-4 sm:items-center md:flex-row'>
              <div className='text-sm text-primary'></div>
              <ReactPaginate
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                marginPagesDisplayed={2}
                pageCount={data?.total_pages || 0}
                previousLabel='&#8249;'
                nextLabel='&#8250;'
                containerClassName='pagination text-right font-heading'
                activeClassName='active'
                renderOnZeroPageCount={null}
                previousLinkClassName={'page-number'}
                nextLinkClassName={'page-number'}
                forcePage={page - 1}
              />
            </div>
          </>
        ) : (
          <div className='m-auto flex flex-col gap-6'>
            <Image
              src='svg/policy-analyzer.svg'
              alt='policy-analyzer'
              width={300}
              height={300}
              className='lg:block'
              priority
            />
            <div className='text-center font-heading text-2xl font-medium text-support'>
              Don&#39;t have any case
            </div>
          </div>
        )}
        {/* {caseSelected && (
          <div className='pointer-events-none absolute bottom-6 left-0 h-fit w-full items-center justify-center'>
            <div className='pointer-events-auto m-auto flex h-16 w-[80%] justify-between rounded-2xl border border-[#DBDBDE] bg-white p-4'>
              <div className='flex items-center gap-8'>
                <div className='cursor-pointer' onClick={triggerClearAllRows}>
                  <CustomIcon name='clear-policy-selected' />
                </div>
                <div className='text-sm font-medium text-[#212124]'>
                  {caseSelected.length} items selected
                </div>
              </div>
              <div>
                <Button
                  appearance='outline'
                  className='!border-btn-coral-red !text-btn-coral-red'
                  onClick={handleDeleteCases}
                >
                  <CustomIcon name='delete' className='mr-2' />{' '}
                  <div className='hidden md:block'>Delete selection</div>
                </Button>
              </div>
            </div>
          </div>
        )} */}
      </div>
      <div
        id='clear'
        onClick={(e: any) => {
          clearAllRows(e);
        }}
      ></div>
      {toasterComponent}
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
export default DiscoveryToolPage;

DiscoveryToolPage.displayName = 'DiscoveryToolPage';
