import { Policy } from '@/app/api/__generated__/api';
import { Paginated } from '@/config';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components';
import Link from 'next/link';

type Props = {
  policies: Paginated<Policy[]>;
};

const PolicyList = (props: Props) => {
  const { policies } = props;

  const column = [
    {
      key: 'id',
      name: 'No',
    },
    {
      key: 'name',
      name: 'Name',
    },
    {
      key: 'documents',
      name: 'Documents',
    },
    {
      key: 'created_by',
      name: 'Created by',
    },
  ];

  return (
    <Table aria-label='Policies table'>
      <TableHeader>
        <TableRow>
          {column.map((item) => (
            <TableHeaderCell key={item.key}>{item.name}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {policies.results.map((item, index) => (
          <TableRow key={item.id} className='cursor-pointer'>
            <Link key={item.id} href={`/policy-analyzer/${item.id}`} className='w-full'>
              <TableHeaderCell>{++index}</TableHeaderCell>
              <TableHeaderCell>{item.name}</TableHeaderCell>
              <TableHeaderCell>
                {item.documents && item.documents?.length > 0 && <>{item.documents[0].name}</>}
              </TableHeaderCell>
              <TableHeaderCell>{item.created}</TableHeaderCell>
            </Link>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PolicyList;

PolicyList.displayName = 'PolicyList';
