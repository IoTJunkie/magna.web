'use client';
import DashboardHeader from '@/app/_components/header';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useMemo, useState } from 'react';
import { Button, MenuItem, MenuList, Select } from '@fluentui/react-components';
import Image from 'next/image';
import classNames from 'classnames';
import CloseAccount from './CloseAccount';
import CustomIcon from '../_components/common/CustomIcon';
import { useWindowSize } from 'usehooks-ts';
import { SupscriptionPlanProvider } from '@/contexts/SubscriptionPlanContext';
import { useProfileStore } from '../_components/profile/profile-store';
import { PlansName, STORAGE_ITEM_NAME } from '@/config';
import SubcriptionNotification from '../_components/common/SubcriptionNotification';

const SettingLayout = (props: PropsWithChildren) => {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const highlightPlan = searchParams.get('highlight') || null;
  const router = useRouter();
  const pathname = usePathname();
  const { profileInfo } = useProfileStore();
  const currentPlan = profileInfo?.current_subscription?.subscription_plan?.name;
  const isShowManageTeam = useMemo(() => {
    switch (true) {
      case !profileInfo?.current_subscription:
        return false;
      case profileInfo?.current_subscription?.trial_period_end &&
        new Date(profileInfo?.current_subscription?.trial_period_end) < new Date():
        return false;
      case profileInfo?.team?.is_owner:
        return true;
      case !profileInfo?.team &&
        currentPlan &&
        [PlansName.Esquire, PlansName.Policy_Pro, PlansName.Premium].includes(currentPlan):
        return true;
      default:
        return false;
    }
  }, [currentPlan, profileInfo?.current_subscription, profileInfo?.team]);

  const isActive = (url: string) => {
    return pathname.includes(url);
  };
  const [showCloseAcc, setShowCloseAcc] = useState(false);
  const windowSize = useWindowSize();
  // const isMobile = window
  //   ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Touch|Tablet/i.test(
  //       window?.navigator?.userAgent,
  //     )
  //   : true;
  const isMobile = windowSize.width < 640;
  const layoutSpecial =
    pathname === '/settings/billing-subscription' ||
    pathname === '/settings/credit-insight' ||
    pathname === '/settings/team-management';

  const smallLayout = pathname === '/settings/change-pwd' || pathname === '/settings/profile';

  const isBillingSubscriptionPage = pathname === '/settings/billing-subscription';

  if (status === 'unauthenticated') {
    if (highlightPlan) {
      localStorage.setItem(STORAGE_ITEM_NAME.subs_redirect, highlightPlan);
    }
    return router.push('/signin');
  }

  return (
    <SidebarProvider>
      <SupscriptionPlanProvider>
        <div className='relative z-0 flex h-screen w-full flex-col overflow-hidden'>
          <div className='shrink'>
            <DashboardHeader />
          </div>

          <div className='relative z-0 flex size-full overflow-hidden'>
            <div className='shrink-0'>
              {isMobile ? (
                <></>
              ) : (
                // <Sidebar />
                <div className='h-full w-fit border-r border-solid border-color-msg-user-stroke bg-color-screen-bg px-3 md:!w-60'>
                  <div className='flex grow flex-col pb-4 pt-3'>
                    <h4 className='text-[0.625rem] font-semibold uppercase text-color-note'>
                      Settings
                    </h4>
                  </div>
                  <MenuList className='text-text-support'>
                    <MenuItem
                      className={classNames('font-medium transition-colors hover:!bg-aero-2', {
                        '!bg-aero-2 font-semibold !text-aero-8': isActive('settings/profile'),
                        '!bg-color-screen-bg': !isActive('settings/profile'),
                      })}
                      onClick={() => router.push('/settings/profile')}
                    >
                      <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                        {isActive('settings/profile') ? (
                          <CustomIcon name='profile-active' width={20} height={20} />
                        ) : (
                          <CustomIcon name='profile' width={20} height={20} />
                        )}
                        Profile Management
                      </div>
                    </MenuItem>
                    <MenuItem
                      className={classNames('font-medium transition-colors hover:!bg-aero-2', {
                        '!bg-aero-2 font-semibold !text-aero-8': isActive('settings/change-pwd'),
                        '!bg-color-screen-bg': !isActive('settings/change-pwd'),
                      })}
                      onClick={() => router.push('/settings/change-pwd')}
                    >
                      <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                        {isActive('settings/change-pwd') ? (
                          <CustomIcon name='key-active' width={20} height={20} />
                        ) : (
                          <CustomIcon name='key' width={20} height={20} />
                        )}
                        Change Password
                      </div>
                    </MenuItem>
                    {isShowManageTeam && (
                      <MenuItem
                        className={classNames('font-medium transition-colors hover:!bg-aero-2', {
                          '!bg-aero-2 font-semibold !text-aero-8': isActive(
                            'settings/team-management',
                          ),
                          '!bg-color-screen-bg': !isActive('settings/team-management'),
                        })}
                        onClick={() => router.push('/settings/team-management')}
                      >
                        <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                          {isActive('settings/team-management') ? (
                            <CustomIcon name='group-member-active' width={20} height={20} />
                          ) : (
                            <CustomIcon name='group-member' width={20} height={20} />
                          )}
                          Team Management
                        </div>
                      </MenuItem>
                    )}
                    <MenuItem
                      className={classNames('font-medium transition-colors hover:!bg-aero-2', {
                        '!bg-aero-2 font-semibold !text-aero-8':
                          isActive('settings/credit-insight'),
                        '!bg-color-screen-bg': !isActive('settings/credit-insight'),
                      })}
                      onClick={() => router.push('/settings/credit-insight')}
                    >
                      <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                        {isActive('settings/credit-insight') ? (
                          <CustomIcon name='card-pos-active' width={20} height={20} />
                        ) : (
                          <CustomIcon name='card-pos' width={20} height={20} />
                        )}
                        Storage
                      </div>
                    </MenuItem>
                    <MenuItem
                      className={classNames('font-medium transition-colors hover:!bg-aero-2', {
                        '!bg-aero-2 font-semibold !text-aero-8': isActive(
                          'settings/billing-subscription',
                        ),
                        '!bg-color-screen-bg': !isActive('settings/billing-subscription'),
                      })}
                      onClick={() => router.push('/settings/billing-subscription')}
                    >
                      <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                        {isActive('settings/billing-subscription') ? (
                          <CustomIcon name='bill-active' width={20} height={20} />
                        ) : (
                          <CustomIcon name='bill' width={20} height={20} />
                        )}
                        Billing & Subscription
                      </div>
                    </MenuItem>

                    {/* <MenuItem
                      className={
                        '!bg-color-screen-bg font-medium !text-color-critical transition-colors hover:!bg-aero-2'
                      }
                      onClick={() => setShowCloseAcc(true)}
                    >
                      <div className='flex items-center gap-3 rounded-lg px-2 py-3'>
                        <Image src='/svg/lock.svg' width={20} height={20} alt='' />
                        Close account
                      </div>
                    </MenuItem> */}
                  </MenuList>
                </div>
              )}
            </div>

            <div className='relative flex h-full max-w-full flex-1 flex-col overflow-hidden bg-color-screen-bg'>
              {!isBillingSubscriptionPage && <SubcriptionNotification />}

              <main className='relative size-full flex-1 overflow-auto px-2 py-[1.5rem] md:px-0 lg:py-[3.25rem]'>
                <div
                  className={classNames(
                    'flex w-full grid-cols-12 flex-col gap-2 md:grid-rows-none',
                    {
                      // grid: !layoutSpecial,
                      // 'flex flex-col': layoutSpecial,
                    },
                  )}
                >
                  {/* {!isMobile && !isBillingSubscriptionPage && (
                    <div className='hidden md:ml-[3.25rem] lg:col-span-1 lg:block'>
                      <Button
                        type='submit'
                        className='w-24'
                        appearance='outline'
                        size='large'
                        onClick={() => router.push('/')}
                      >
                        <CustomIcon
                          name='next-icon'
                          width={20}
                          height={20}
                          className='rotate-180'
                        />
                        Back
                      </Button>
                    </div>
                  )} */}
                  {/* <div className='col-span-12 md:col-span-6 md:col-start-4'> */}
                  <div
                    className={classNames('', {
                      'm-auto w-full max-w-[50rem] p-5': smallLayout,
                    })}
                  >
                    {isMobile && (
                      <div className='col-span-12 pb-8'>
                        <div className='my-[0.125rem] pb-1 text-sm  font-semibold text-neutrual-900'>
                          Settings
                        </div>
                        <Select
                          size='large'
                          onChange={(_event, data) => {
                            if (data.value) router.push(`${data.value}`);
                            else setShowCloseAcc(true);
                          }}
                          defaultValue={pathname.split('/').splice(-1)}
                        >
                          <option value='profile'>Profile management</option>
                          <option value='change-pwd'>Change password</option>
                          {isShowManageTeam && (
                            <option value='team-management'>Team Management</option>
                          )}
                          <option value='billing-subscription'>Billing & subscription</option>
                          <option value='credit-insight'>Storage</option>
                          {/* <option value=''>Close account</option> */}
                        </Select>
                      </div>
                    )}

                    {props.children}
                  </div>
                </div>
              </main>
            </div>
          </div>
          {showCloseAcc && <CloseAccount open={showCloseAcc} close={setShowCloseAcc} />}
        </div>
      </SupscriptionPlanProvider>
    </SidebarProvider>
  );
};

SettingLayout.displayName = 'SettingLayout';

export default SettingLayout;
