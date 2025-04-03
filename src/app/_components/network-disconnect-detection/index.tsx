import React, { ComponentType, PropsWithChildren, useEffect, useState } from 'react';

const withNetworkDisconnectDetector = <P extends object>(Component: ComponentType<P>) => {
  // eslint-disable-next-line react/display-name
  return (props: PropsWithChildren<P>) => {
    const [isOnline, setIsOnline] = useState(
      typeof window !== 'undefined' ? navigator.onLine : true,
    );

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const updateOnlineStatus = () => setIsOnline(navigator.onLine);

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
          window.removeEventListener('online', updateOnlineStatus);
          window.removeEventListener('offline', updateOnlineStatus);
        };
      }
    }, []);

    if (!isOnline) {
      return (
        <div className='flex h-full flex-1 items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-gray-700'>You are offline</h1>
            <p className='text-gray-500'>Please check your internet connection and try again.</p>
          </div>
        </div>
      );
    }

    return <Component {...(props as P)} />;
  };
};

withNetworkDisconnectDetector.displayName = 'withNetworkDisconnectDetector';
export default withNetworkDisconnectDetector;
