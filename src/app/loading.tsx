'use client';

import { Spinner } from '@fluentui/react-components';

const Loading = () => {
  return (
    <div className='flex h-screen w-screen items-center justify-center'>
      <Spinner label='Loading...' />
    </div>
  );
};

export default Loading;

Loading.displayName = 'Loading';
