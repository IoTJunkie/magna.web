'use client';
import { STORAGE_ITEM_NAME } from '@/config';
// TourContext.tsx
import { createContext, PropsWithChildren, useContext, useState } from 'react';

interface TourContextType {
  runTour: boolean;
  shouldStartTour: boolean;
  tourStarted: boolean;
  startTour: (stt?: boolean) => void;
  stopTour: () => void;
  setShouldStartTour: (value: boolean) => void;
  setTourStarted: (value: boolean) => void;
  restartState: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
};

export const TourProvider = ({ children }: PropsWithChildren) => {
  const [runTour, setRunTour] = useState<boolean>(false);
  const [shouldStartTour, setShouldStartTour] = useState<boolean>(false);
  const [tourStarted, setTourStarted] = useState<boolean>(false);

  const startTour = (isFirstLogin?: boolean) => {
    const tourGuideFinished = localStorage.getItem(STORAGE_ITEM_NAME.tour_guide_finished);
    if (!tourGuideFinished || isFirstLogin) {
      setRunTour(true);
    }
  };

  const stopTour = () => {
    localStorage.setItem(STORAGE_ITEM_NAME.tour_guide_finished, 'true');
    setRunTour(false);
  };

  const restartState = () => {
    setRunTour(false);
    setShouldStartTour(false);
    setTourStarted(false);
  };

  return (
    <TourContext.Provider
      value={{
        runTour,
        shouldStartTour,
        tourStarted,
        startTour,
        stopTour,
        setShouldStartTour,
        setTourStarted,
        restartState,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

TourContext.displayName = 'TourContext';
