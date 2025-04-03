'use client';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import BuyCreditsDialog from '@/app/_components/header/BuyCreditsDialog';
import Logo from '@/app/_components/logo';
import { UserProfile } from '@/app/types/userProfile';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { RESOURCE_PROFILE, STORAGE_ITEM_NAME, THEME_SETTING, USER_PROFILE } from '@/config';
import { useSidebar } from '@/contexts/SidebarContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { Navigation24Filled } from '@fluentui/react-icons';
import axios from 'axios';
import classNames from 'classnames';
import { getSession, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import CustomIcon from '../common/CustomIcon';
import DialogComponent from '../common/Dialog';
import { useProfileStore } from '../profile/profile-store';
import MemberLimitDialog from '../member-limit-dialog';

import dynamic from 'next/dynamic';
import { useTourContext } from '@/contexts/TourContext';
import { Step } from 'react-joyride'; // Import Joyride and Step type
import { convertDocumentSizeLimit } from '@/app/utils';
import { useWindowSize } from 'usehooks-ts';

// Dynamically import Joyride to prevent hydration errors
const JoyrideComponent = dynamic(() => import('react-joyride'), { ssr: false });

const DashboardHeaderContent = (props: PropsWithChildren) => {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();
  const { updateTheme, theme } = useThemeContext();
  const pathname = usePathname();
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 640;

  const [show, setShow] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [buyCreditLoading, setBuyCreditLoading] = useState(false);
  const [showMemberLimit, setShowMemberLimit] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [firstRender, setFirstRender] = useState(true);

  const router = useRouter();
  const { profileInfo, setProfileInfo, setResourceInfo, setTeamsMember, setDocumentSizeLimit } =
    useProfileStore();

  const isWelcomePage = pathname.startsWith('/old-welcome');
  const isSettingsPage = pathname.includes('settings');

  // Use the TourContext
  const {
    startTour,
    stopTour,
    runTour,
    setShouldStartTour,
    tourStarted,
    setTourStarted,
    restartState,
  } = useTourContext();

  // Define tourSteps with the Step[] type
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
      target: '.guide-rename',
      content: 'Helps you rename the chat session.',
    },
    {
      target: '.guide-download-history',
      content: 'You can download the content of the entire chat session.',
    },
    {
      target: '.guide-share-history',
      content: 'Allows you to share the chat content with others on your team.',
    },
    {
      target: '.guide-delete',
      content: 'Removes the chat session from your history.',
    },
    ...(!isMobile
      ? [
          {
            target: '.collapse-btn',
            content: 'If you prefer a cleaner view, you can hide the sidebar by clicking here.',
          },
          {
            target: '.plan-upgrade',
            content:
              'Enhance your experience by unlocking advanced features and tools when you upgrade to a higher plan, tailored to meet your growing needs.',
          },
        ]
      : []),

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

  const totalSteps = tourSteps.length;

  const handleTourCallback = (data: any) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      stopTour(); // End the tour
    }
    const { index, type, action } = data;
    if (index === 8 && isMobile) {
      toggleSidebar();
      setTimeout(() => {
        setShouldStartTour(true);
      }, 80);
    }
    if (type === 'step:before' && action === 'close') {
      // User clicked the 'x' button to close the tooltip
      stopTour();
    }
    if (type === 'step:before') {
      setStepIndex(index);
    }
    if (type === 'tour:end' || action === 'close') {
      setStepIndex(0);
    }
  };

  const getNextButtonLabel = () => {
    return `Next (${stepIndex}/${totalSteps - 1})`; // Custom "Next (currentStep/totalSteps)"
  };

  // State to check if component has mounted
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isFirstLogin = session?.user?.first_login;

  useEffect(() => {
    if (hasMounted && isFirstLogin && !tourStarted && firstRender) {
      const tourGuideFinished = localStorage.getItem(STORAGE_ITEM_NAME.tour_guide_finished);
      startTour(isFirstLogin && !tourGuideFinished); // Start the tour
      setTourStarted(true); // Ensure the tour starts only once
      setFirstRender(false);
    }
  }, [hasMounted, isFirstLogin, startTour, tourStarted, setTourStarted, firstRender]);

  // Handle Relaunch Guide click
  const handleRelaunchGuide = () => {
    const elm = document.getElementById('menu-item');
    if (!elm) {
      toggleSidebar();
    }
    localStorage.removeItem(STORAGE_ITEM_NAME.tour_guide_finished);
    setShouldStartTour(true); // Ensure the flag is set every time
    if (pathname !== '/legal-chat') {
      router.push('/legal-chat');
    } else {
      // The TourStarter component will handle starting the tour
    }
  };

  const getTeamsMember = async (teamId: string, limit: number) => {
    const session = await getSession();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/team-management/${teamId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      },
    );

    if (response.ok) {
      const rs = await response.json();
      if (rs.length > limit) {
        setShowMemberLimit(true);
      }
      setTeamsMember(rs);
    }
  };

  const getAccountsProfile = async () => {
    try {
      const url = '/api/plg/accounts/profile/';
      const response = await axios.get(url);
      if (response.status === 200) {
        return response.data as UserProfile;
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const getTheme = async () => {
    try {
      const session = await getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/user-theme`, {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const getResourceProfile = async () => {
    try {
      const url = '/api/plg/accounts/resource/';
      const response = await axios.get(url);
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  useQuery([THEME_SETTING], getTheme, {
    refetchOnWindowFocus: false,
    onSuccess(data) {
      if (data) {
        const theme = data?.theme;
        updateTheme(theme);
      }
    },
  });

  useQuery([USER_PROFILE], getAccountsProfile, {
    refetchOnWindowFocus: false,
    onSuccess(data) {
      if (data) {
        setProfileInfo(data);
        const documentSizeLimit =
          data?.current_subscription?.subscription_plan?.document_size_limit;
        if (documentSizeLimit) {
          setDocumentSizeLimit(convertDocumentSizeLimit(documentSizeLimit));
        }
        const limit = data?.current_subscription?.subscription_plan?.maximum_member || 0;
        if (data?.team?.is_owner && data.team?.team_id && limit) {
          getTeamsMember(data?.team.team_id, limit);
        }
      }
    },
  });

  useQuery([RESOURCE_PROFILE], getResourceProfile, {
    refetchOnWindowFocus: false,
    onSuccess(data) {
      if (data) {
        setResourceInfo(data);
      }
    },
  });

  const onSignOut = async () => {
    restartState();
    setTourStarted(false); // Reset tourStarted when signing out
    await signOut({ redirect: false, callbackUrl: '/' });
  };

  const handleConfirm = async (value: number) => {
    try {
      setBuyCreditLoading(true);

      const url = '/api/plg/productization/create-checkout-session/';
      const params = {
        credits_to_purchase: value,
        cancel_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/settings/credit-insight?success=false`,
        success_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/settings/credit-insight?success=true`,
      };
      const res = await axios.post(url, params);
      if (res.status === 200) {
        const redirectUrl = res.data?.url;
        if (redirectUrl) {
          window.open(redirectUrl, '_self');
        }
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setBuyCreditLoading(false);
    }
  };

  return (
    <>
      {/* Joyride Component for Guided Tour */}
      {hasMounted && (
        <JoyrideComponent
          steps={tourSteps}
          locale={{
            next: getNextButtonLabel(), // Dynamically set the "Next" button label
          }}
          run={runTour}
          continuous
          scrollToFirstStep
          showSkipButton
          disableOverlayClose // Prevents closing on outside clicks
          callback={handleTourCallback}
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
      )}
      <div className='sticky top-0 z-50 flex items-center justify-between border-b border-color-msg-user-stroke bg-color-screen-bg px-10 py-3 md:py-3 xl:px-10'>
        <button
          className={classNames('!text-aero-7', {
            hidden: isWelcomePage,
            'flex sm:hidden': isSettingsPage || !isWelcomePage,
          })}
          onClick={() => toggleSidebar()}
          id='sidebar-toggle'
        >
          {!isSettingsPage ? <Navigation24Filled className='!text-inherit' /> : null}
        </button>
        <div
          className={classNames('flex flex-1 justify-center md:justify-normal', {
            'pl-8 md:pl-0': isWelcomePage,
          })}
        >
          <Logo />
        </div>
        <div className='mr-4 hidden gap-4 md:flex'>
          <Link href='/settings/billing-subscription'>
            <Button size='medium' className='plan-upgrade !border-plg !text-plg'>
              Upgrade plan
            </Button>
          </Link>
        </div>

        <Menu>
          <MenuTrigger disableButtonEnhancement>
            {profileInfo?.avatar_url ? (
              <Avatar
                size={32}
                image={{
                  src: profileInfo?.avatar_url,
                }}
                className='hover:cursor-pointer'
              />
            ) : (
              <div className='flex size-7 cursor-pointer items-center justify-center rounded-[50%] bg-aero-12 text-xs text-neutral'>
                {profileInfo?.email.slice(0, 2).toUpperCase()}
              </div>
            )}
          </MenuTrigger>

          <MenuPopover className='!top-2 divide-y divide-solid !bg-bg-menu-popover !px-0'>
            <div className='py-3'>
              <div className='gap-2 px-6 pb-2 text-[1rem] font-semibold'>
                {profileInfo?.first_name} {profileInfo?.last_name}
              </div>
              <div className='px-6 text-color-text-support'>{profileInfo?.email}</div>
            </div>
            {profileInfo?.current_subscription && (
              <div className='!border-color-msg-user-stroke px-6 py-4 md:!px-6'>
                <div className='mb-[0.625rem] md:!mb-0'>
                  {profileInfo.current_subscription.subscription_plan.name}
                </div>
                <div className='flex flex-col items-start gap-[0.5rem] md:hidden'>
                  <Link href='/settings/billing-subscription' className='min-w-[7.75rem]'>
                    <Button size='medium' className='w-full !border-plg !text-plg'>
                      Upgrade plan
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <MenuList className='!border-color-msg-user-stroke'>
              {/* <SwitchThemeButton /> */}
              <MenuItem className='!mb-2 !bg-bg-menu-popover !px-6' onClick={handleRelaunchGuide}>
                <span>Relaunch Guide</span>
              </MenuItem>
              <div className='border-b-[0.0625rem] !border-color-msg-user-stroke'>
                <MenuItem
                  className='!mb-4 !bg-bg-menu-popover !px-6'
                  icon={<CustomIcon name='setting-icon' height={20} width={20} />}
                  onClick={() => router.push('/settings/profile')}
                >
                  <span>Settings</span>
                </MenuItem>
              </div>
              <MenuItem
                className='!bg-bg-menu-popover !px-6 !py-4'
                icon={<Image src='/svg/sign-out.svg' alt='sign-out icon' width={20} height={20} />}
                onClick={() => setShow(true)}
              >
                <span className='text-danger'>Logout</span>
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>

        {show && (
          <DialogComponent
            open={show}
            title='Sign out confirmation'
            content='Do you want to sign out?'
            onConfirm={onSignOut}
            onCancel={() => setShow(false)}
          />
        )}
        {showBuyCredits && (
          <BuyCreditsDialog
            open={showBuyCredits}
            title='Credit Amounts'
            onConfirm={handleConfirm}
            onCancel={() => setShowBuyCredits(false)}
            buyCreditLoading={buyCreditLoading}
          />
        )}
        {showMemberLimit && (
          <MemberLimitDialog open={showMemberLimit} setOpen={setShowMemberLimit} />
        )}
      </div>
    </>
  );
};

const DashboardHeader = (props: PropsWithChildren) => {
  return <DashboardHeaderContent {...props} />;
};

export default DashboardHeader;

DashboardHeader.displayName = 'DashboardHeader';
