'use client';
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components';
import useTable from './hooks/useTable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DialogComponent from '@/app/_components/common/Dialog';
import InviteMemberDialog from '@/app/_components/team-management/invite-member-dialog';
import classNames from 'classnames';
import { IMember, MemberShipStatus } from './types';
import { getSession, useSession } from 'next-auth/react';
import useToastComponent from '@/app/hooks/Toast';
import { useProfileStore } from '@/app/_components/profile/profile-store';
import { redirect } from 'next/navigation';
import { PlansName } from '@/config';
import _ from 'lodash';
import axios from 'axios';
import { UserProfile } from '@/app/types/userProfile';

const Page = () => {
  const [openInvitePopup, setOpenInvitePopup] = useState<boolean>(false);
  const [openDeleteMemberPopup, setOpenDeleteMemberPopup] = useState<boolean>(false);
  const [hasInviteMember, setHasInviteMember] = useState<boolean>(false);
  const [hasDeleteMember, setHasDeleteMember] = useState<boolean>(false);
  const [memberList, setMemberList] = useState<IMember[]>([]);
  const [loadingGetMemberList, setLoadingGetMemberList] = useState<boolean>(true);
  const [loadingDeleteMember, setLoadingDeleteMember] = useState<boolean>(false);
  const memberPicked = useRef<IMember>();
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const { profileInfo, setProfileInfo, setTeamsMember } = useProfileStore();
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

  const { data: session } = useSession();
  const maximum_member = profileInfo?.current_subscription?.subscription_plan?.maximum_member ?? 0;
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

  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });

  const resendEmail = useCallback(async () => {
    const payload = {
      email: memberPicked?.current?.email,
      base_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/invite-member`,
    };
    try {
      let params = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(payload),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/send-invitation`,
        params,
      );
      if (response.ok) {
        setMsg('Resend email successfully');
        setIntent('success');
        showToast();
      } else {
        setMsg('Something went wrong. Please try again later.');
        setIntent('error');
        showToast();
      }
    } catch (error) {}
  }, [session?.user?.access_token, setIntent, showToast]);

  const onOpenDeleteMemberPopup = () => {
    setOpenDeleteMemberPopup(true);
  };

  const { tableRef, columnSizing_unstable, columns, rows } = useTable({
    data: memberList,
    onOpenDeleteMemberPopup,
    resendEmail,
    ref: memberPicked,
  });

  const hasAllowedMember =
    profileInfo?.current_subscription?.subscription_plan?.invite_team &&
    maximum_member <= rows.length;

  const onInviteMember = () => {
    setOpenInvitePopup(true);
  };

  const onDeleteMember = useCallback(async () => {
    try {
      setLoadingDeleteMember(true);
      const session = await getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/remove-member/${memberPicked?.current?.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      if (response.ok) {
        setHasDeleteMember(!hasDeleteMember);
        setOpenDeleteMemberPopup(false);
        setMsg('Delete member successfully');
        setIntent('success');
        showToast();
      } else {
        setMsg('Something went wrong. Please try again later.');
        setIntent('error');
        showToast();
        setOpenDeleteMemberPopup(false);
      }
    } catch (error) {
    } finally {
      setLoadingDeleteMember(false);
    }
  }, [hasDeleteMember, setIntent, showToast]);

  const NoTeamMember = () => {
    return (
      <div className='mt-[3.9375rem] text-center'>
        <div className='text-3xl font-bold'>No team member yet</div>
        <span className='text-base'>{`Invite up to ${maximum_member} people to join your team now`}</span>
      </div>
    );
  };
  const ContentTable = () => {
    if (loadingGetMemberList) {
      return (
        <div className='flex h-[20rem] items-center justify-center'>
          <Spinner size='large' />
        </div>
      );
    } else {
      return (
        <>
          {rows.length > 0 ? (
            rows.map(({ item }, index: number) => (
              <TableRow key={item.id}>
                <TableCell {...columnSizing_unstable.getTableCellProps('no')}>
                  <TableCellLayout truncate>{index + 1}</TableCellLayout>
                </TableCell>
                <TableCell {...columnSizing_unstable.getTableCellProps('name')}>
                  <TableCellLayout truncate>{item.name}</TableCellLayout>
                </TableCell>
                <TableCell {...columnSizing_unstable.getTableCellProps('email')}>
                  <TableCellLayout truncate>{item.email}</TableCellLayout>
                </TableCell>
                <TableCell {...columnSizing_unstable.getTableCellProps('status')}>
                  <TableCellLayout
                    truncate
                    className={classNames(
                      'w-fit !grow-0 !basis-auto rounded px-2 py-[0.375rem] text-xs font-bold',
                      {
                        'bg-aero-18 !text-aero-15': item.status === MemberShipStatus.ACTIVE,
                        'bg-aero-16 !text-aero-17': item.status === MemberShipStatus.PENDING,
                        'bg-[#FEE4E2] !text-[#F04438]': item.status === MemberShipStatus.REJECTED,
                      },
                    )}
                  >
                    {item.status === MemberShipStatus.REJECTED
                      ? 'Rejected'
                      : _.startCase(item.status)}
                  </TableCellLayout>
                </TableCell>
                <TableCell {...columnSizing_unstable.getTableCellProps('action')}>
                  <TableCellLayout truncate>{item.action}</TableCellLayout>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <NoTeamMember />
          )}
        </>
      );
    }
  };

  useEffect(() => {
    const fetchMemberList = async (teamId: string) => {
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
        setLoadingGetMemberList(false);
        setMemberList(rs);
        setTeamsMember(rs);
      }
    };
    const getMemberList = async () => {
      try {
        setLoadingGetMemberList(true);
        let profileRs;
        if (profileInfo && !profileInfo?.team?.team_id) {
          profileRs = await getAccountsProfile();
        }
        if (profileRs && profileRs?.team?.team_id) {
          setProfileInfo(profileRs);
          await fetchMemberList(profileRs.team.team_id);
        } else if (profileInfo?.team?.team_id) {
          await fetchMemberList(profileInfo?.team?.team_id);
        }
        return;
      } catch (error) {
        setLoadingGetMemberList(false);
      } finally {
        setLoadingGetMemberList(false);
      }
    };
    getMemberList();
  }, [hasInviteMember, hasDeleteMember, profileInfo, session?.user?.access_token, setProfileInfo]);

  useEffect(() => {
    if (profileInfo && !isShowManageTeam) {
      redirect('/settings/profile');
    }
  }, [isShowManageTeam, profileInfo]);

  return (
    <>
      <div className='w-full p-12'>
        <div className='flex items-center justify-between'>
          <span className='text-2xl font-semibold md:text-[2rem]/[2.5rem]'>Team Management</span>
          <div className='hidden md:block'>
            <Button
              disabled={hasAllowedMember}
              size='large'
              appearance='primary'
              onClick={onInviteMember}
            >
              Invite member(s)
            </Button>
          </div>
        </div>
        <div className='mt-8 overflow-x-auto overflow-y-hidden'>
          <Table
            noNativeElements
            sortable
            aria-label='Table team management'
            ref={tableRef}
            {...columnSizing_unstable.getTableProps()}
          >
            <TableHeader className='bg-aero-14 text-sm text-neutrual-900 [&_*]:!font-bold [&_th]:p-3'>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell
                    key={column.columnId}
                    {...columnSizing_unstable.getTableHeaderCellProps(column.columnId)}
                  >
                    {column.renderHeaderCell()}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className='overflow-auto'>
              <ContentTable />
            </TableBody>
          </Table>
        </div>
      </div>
      <div className='flex justify-center md:hidden'>
        <Button size='large' appearance='primary' onClick={onInviteMember}>
          Invite member(s)
        </Button>
      </div>
      {openDeleteMemberPopup && (
        <DialogComponent
          open={openDeleteMemberPopup}
          title='Delete Team Member'
          content='You are about to remove a team member from your team account. Are you sure you want to delete this member?'
          textCancel='Cancel'
          textConfirm='Remove member'
          onConfirm={onDeleteMember}
          loading={loadingDeleteMember}
          onCancel={() => setOpenDeleteMemberPopup((prev) => !prev)}
        />
      )}
      <InviteMemberDialog
        open={openInvitePopup}
        setOpen={setOpenInvitePopup}
        hasInviteMember={hasInviteMember}
        onInviteMember={setHasInviteMember}
      />
      {toasterComponent}
    </>
  );
};

export default Page;
Page.displayName = 'TeamManagement';
