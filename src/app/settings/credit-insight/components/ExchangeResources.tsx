import { IExchangeResources, IResource } from '@/app/types/creditInsight';
import { useEffect } from 'react';
import { displayStorage } from '../displayStorage';
import styles from '../index.module.scss';
import UsageGraph from './UsageGraph';

interface IProps {
  resource: IResource | undefined;
  exchangeResource: IExchangeResources;
  isFetched: boolean;
  theme: string;
  blockSpinner: () => void;
}

const ExchangeResources = (props: IProps) => {
  const { exchangeResource } = props;

  useEffect(() => {
    const preventTypeDot = (e: KeyboardEvent) => {
      if (e.key === '.') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventTypeDot);

    return () => {
      document.removeEventListener('keydown', preventTypeDot);
    };
  }, []);

  return (
    <div
      key={exchangeResource.id}
      className={`flex w-auto flex-col items-center justify-center gap-10 rounded-xl border-[1px] border-solid border-color-msg-user-stroke p-10 text-center md:flex-row md:justify-between md:text-start lg:col-start-1 ${styles.flex}`}
    >
      <div
        className={`flex w-full flex-col items-center justify-between gap-2 md:w-[calc(100%-236px)] ${styles.maxWidth}`}
      >
        <p className='text-2xl font-[600] text-color-menu-active lg:text-3xl'>
          {exchangeResource.name}
        </p>
        <div className='mb-6 mt-4'>
          <i>
            Total Left:{' '}
            {exchangeResource.resource_limit > exchangeResource.resource_spent
              ? displayStorage(exchangeResource.resource_limit - exchangeResource.resource_spent)
              : '0 MB'}
          </i>
          <p>
            Total {exchangeResource.resource_type}
            {exchangeResource.resource_type === 'storage' ? '' : 's'}:{' '}
            {exchangeResource.is_unlimited_resource
              ? 'Unlimited'
              : `${displayStorage(exchangeResource.resource_limit)}`}
          </p>
        </div>
      </div>
      <UsageGraph percentage={exchangeResource.percentage} />
    </div>
  );
};

export default ExchangeResources;
