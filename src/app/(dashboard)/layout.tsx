'use client';
import DashboardHeader from '@/app/_components/header';
import Sidebar from '@/app/_components/sidebar';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

import { MyCaseProvider } from '@/contexts/MyCaseContext';
import { UploadDocsMagnaProvider } from '@/contexts/UploadDocsMagnaContext';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { Step } from 'react-joyride';
import TourStarter from '../_components/common/TourStarter';
import InviteMemberDialog from '../_components/invite-member-dialog/InviteMemberDialog';
import SubcriptionNotification from '../_components/common/SubcriptionNotification';
import { statusTrial } from '../utils/checkTrialEnded';
import { useProfileStore } from '../_components/profile/profile-store';
import { StatustrialPeriodEnd } from '@/config';

// Dynamically import Joyride to prevent hydration errors
const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

const tourSteps: Step[] = [
  {
    content: <h2>Welcome to Magna AI! Let’s start your journey.</h2>,
    placement: 'center',
    target: 'body',
    locale: { next: 'Start Tour' },
  },
  {
    target: '.legal-menu',
    content:
      'Leverage Magna AI to supercharge your productivity by connecting your folders to Magna AI.',
  },
  {
    target: '.policy-menu',
    content:
      'Our powerful platform provides insights into your insurance policies, helping you optimize client outcomes with ease and efficiency.',
  },
  {
    target: '.discovery-menu',
    content:
      'Leverage the full potential of AI to enhance your law practice. Review cases, draft discovery responses, and conduct legal research, all in one place.',
  },
  {
    target: '.chat-history',
    content: 'Access previous conversations at any time by viewing your chat history here.',
  },
  {
    target: '.collapse-btn',
    content: 'If you prefer a cleaner view, you can hide the sidebar by clicking here.',
  },
  {
    target: '.plan-upgrade',
    content:
      'Enhance your experience by unlocking advanced features and tools when you upgrade to a higher plan, tailored to meet your growing needs.',
  },
  {
    target: '.chat-input',
    content:
      'Seamlessly interact with our AI by asking legal questions and receive instant, accurate assistance to support your cases.',
  },
  {
    target: '.upload-file',
    content:
      'Effortlessly upload documents to receive AI-driven insights and precise answers, tailored to the specifics of your files.',
  },
  {
    content: (
      <h2>
        That’s the end of the tour! Thank you for exploring Magna AI – we’re here to support your
        legal needs every step of the way.
      </h2>
    ),
    placement: 'center',
    target: 'body',
    locale: { last: 'Get Started' },
  },
];

const DashboardLayout = (props: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const { profileInfo } = useProfileStore();
  const sttTrial =
    profileInfo && statusTrial(profileInfo?.current_subscription?.trial_period_end || null);

  useEffect(() => {
    if (sttTrial) {
      const stt =
        sttTrial === StatustrialPeriodEnd.ENDED ||
        sttTrial === StatustrialPeriodEnd.DURING_TRIAL_LESS_24;
      const mainContent = document.getElementById('main-content');
      if (mainContent && stt) {
        mainContent.classList.add('!h-[calc(100vh-8.127rem)]');
      }
    }
  }, [sttTrial]);

  // React Joyride States
  // const [stepIndex, setStepIndex] = useState(0);

  // const handleJoyrideCallback = (data: CallBackProps) => {
  //   const { index, type } = data;
  //   if (type === 'step:before') {
  //     setStepIndex(index);
  //   }
  //   if (type === 'tour:end') {
  //     setStepIndex(0);
  //   }
  // };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const isWelcomePage = pathname.startsWith('/old-welcome');
  const isInterrogativePage = searchParams.get('interrogative');
  const isDiscoveryToolDetailPage = Object.keys(params).includes('id');
  // const totalSteps = tourSteps.length;

  // const getNextButtonLabel = () => {
  //   return `Next (${stepIndex}/${totalSteps - 1})`; // Custom "Next (currentStep/totalSteps)"
  // };

  return (
    <>
      {/* Joyride Component for Guided Tour */}
      {/* {hasMounted && (
        <Joyride
          steps={tourSteps}
          locale={{
            next: getNextButtonLabel(), // Dynamically set the "Next" button label
          }}
          run={runTour}
          continuous
          scrollToFirstStep
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              arrowColor: '#e3ffeb',
              backgroundColor: '#e3ffeb',
              textColor: '#004a14',
              primaryColor: '#004a14',
            },
            ...(theme === ThemeTypes.DARK
              ? {
                  spotlight: {
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  },
                }
              : {}),
          }}
        />
      )} */}
      {/* Wrapper Component */}
      <SidebarProvider>
        <UploadDocsMagnaProvider>
          <MyCaseProvider>
            <BookmarkProvider>
              <TourStarter />

              <div className='relative z-0 flex h-screen w-full flex-col overflow-hidden'>
                <div className='shrink'>
                  <DashboardHeader />
                </div>
                <div className='relative z-0 flex size-full overflow-hidden'>
                  {!isWelcomePage && (
                    <div className='shrink-0 overflow-x-hidden'>
                      <Sidebar />
                    </div>
                  )}
                  <div className='relative flex h-full max-w-full flex-1 flex-col overflow-hidden bg-color-screen-bg'>
                    <main
                      className={classNames('relative size-full flex-1 overflow-auto', {
                        'overflow-auto md:!overflow-hidden':
                          isInterrogativePage || isDiscoveryToolDetailPage,
                      })}
                    >
                      <SubcriptionNotification />
                      <div className='h-full' id='main-content'>
                        {props.children}
                      </div>
                    </main>
                  </div>
                </div>
              </div>
            </BookmarkProvider>
          </MyCaseProvider>
        </UploadDocsMagnaProvider>
      </SidebarProvider>
      <InviteMemberDialog />
    </>
  );
};

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
