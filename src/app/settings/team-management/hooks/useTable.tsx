'use client';
import {
  createTableColumn,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  TableColumnDefinition,
  TableColumnSizingOptions,
  useTableColumnSizing_unstable,
  useTableFeatures,
} from '@fluentui/react-components';
import { IMember, Item, MemberShipStatus } from '../types';
import { useMemo, useState } from 'react';

import CustomIcon from '@/app/_components/common/CustomIcon';
import classNames from 'classnames';

const columnsDef: TableColumnDefinition<Item>[] = [
  createTableColumn<Item>({
    columnId: 'no',
    renderHeaderCell: () => <>No</>,
  }),
  createTableColumn<Item>({
    columnId: 'name',
    renderHeaderCell: () => <>Name</>,
  }),
  createTableColumn<Item>({
    columnId: 'email',
    renderHeaderCell: () => <>Email</>,
  }),
  createTableColumn<Item>({
    columnId: 'status',
    renderHeaderCell: () => <>Status</>,
  }),
  createTableColumn<Item>({
    columnId: 'action',
    renderHeaderCell: () => <>Action</>,
  }),
];

interface TProps {
  data: IMember[];
  onOpenDeleteMemberPopup: () => void;
  resendEmail: () => void;
  ref: any;
}

export default function useTable({ data, onOpenDeleteMemberPopup, resendEmail, ref }: TProps) {
  const [columns] = useState<TableColumnDefinition<Item>[]>(columnsDef);
  const options = useMemo(
    () => [
      {
        id: 'resend',
        label: 'Resend',
        icon: 'resend',
        action: () => {
          resendEmail();
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'delete',
        action: () => {
          onOpenDeleteMemberPopup();
        },
      },
    ],
    [onOpenDeleteMemberPopup, resendEmail],
  );

  const columnSizingOptions = useMemo<TableColumnSizingOptions>(() => {
    return {
      no: {
        idealWidth: 80,
        minWidth: 80,
      },
      name: {
        minWidth: 250,
        idealWidth: 500,
      },
      email: {
        minWidth: 200,
        idealWidth: 300,
      },
      status: {
        minWidth: 100,
        idealWidth: 300,
      },
      action: {
        minWidth: 100,
        idealWidth: 100,
      },
    };
  }, []);

  const items: Item[] = useMemo<Item[]>(
    () =>
      data?.map((item) => {
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          status: item.status,
          action: (
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <div
                  onClick={() => {
                    ref.current = item;
                  }}
                >
                  <CustomIcon name='options' className='hover:cursor-pointer' />
                </div>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {options.map((option) => {
                    return (
                      <MenuItem
                        key={option.id}
                        disabled={option.id === 'resend' && item.status === MemberShipStatus.ACTIVE}
                        icon={<CustomIcon name={option.icon} />}
                        onClick={() => option.action()}
                        className={classNames('!flex !items-center text-[#4B4B4E]', {
                          '!text-[#F04438]': option.id === 'delete',
                        })}
                      >
                        {option.label}
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </MenuPopover>
            </Menu>
          ),
        };
      }),
    [data, options, ref],
  );

  const { getRows, columnSizing_unstable, tableRef } = useTableFeatures(
    {
      columns,
      items,
    },
    [useTableColumnSizing_unstable({ columnSizingOptions })],
  );
  const rows = getRows();

  return {
    columnSizing_unstable,
    tableRef,
    columns,
    rows,
    items,
  };
}
