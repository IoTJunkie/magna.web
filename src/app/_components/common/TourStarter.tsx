// components/TourStarter.tsx
import { useEffect, useState } from 'react';
import { useTourContext } from '@/contexts/TourContext';
import { useWindowSize } from 'usehooks-ts';

const TourStarter = () => {
  const { shouldStartTour, setShouldStartTour, startTour } = useTourContext();
  const [targetsReady, setTargetsReady] = useState(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  // List of target selectors from your tour steps
  const targetSelectors = [
    'body',
    '.legal-menu',
    '.policy-menu',
    '.discovery-menu',
    '.chat-history',
    '.guide-rename',
    '.guide-download-history',
    '.guide-share-history',
    '.guide-delete',
    ...(!isMobile ? ['.collapse-btn', '.plan-upgrade'] : []),
    '.chat-input',
    '.upload-file',
  ];

  useEffect(() => {
    if (shouldStartTour) {
      // Check if all target elements are present
      const intervalId = setInterval(() => {
        const allTargetsExist = targetSelectors.every((selector) =>
          document.querySelector(selector),
        );
        if (allTargetsExist) {
          clearInterval(intervalId);
          setTargetsReady(true);
        }
      }, 100);

      // Timeout in case targets don't appear
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setTargetsReady(true); // Proceed even if not all targets are found
      }, 300); // adjust timeout as needed

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [shouldStartTour, targetSelectors]);

  useEffect(() => {
    if (shouldStartTour && targetsReady) {
      startTour();
      setShouldStartTour(false); // Reset the flag after starting the tour
    }
  }, [shouldStartTour, targetsReady, startTour, setShouldStartTour]);

  return null;
};

export default TourStarter;
