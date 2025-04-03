'use client';
import useToastComponent from '@/app/hooks/Toast';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useProfileStore } from '../profile/profile-store';
import { useQueryClient } from 'react-query';
import { USER_PROFILE } from '@/config';

enum Action {
  REJECT = 'reject',
  ACTIVE = 'active',
}

const InviteMemberDialog = () => {
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const { data: session } = useSession();
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });
  const { profileInfo } = useProfileStore();
  const team = profileInfo?.team || null;
  const queryClient = useQueryClient();
  const { update } = useSession();

  useEffect(() => {
    const token = localStorage.getItem('inviteMemberToken');
    if (token) {
      setToken(token);
      const checkInviteStatus = async () => {
        try {
          const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/invitation-link-status?token=${token}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const res = await response.json();
            if (res.message !== 'Invalid or expired') {
              setOpen(true);
            } else localStorage.removeItem('inviteMemberToken');
          } else {
            localStorage.removeItem('inviteMemberToken');
          }
        } catch (error) {}
      };
      checkInviteStatus();
    }
  }, [profileInfo, team]);

  const handleActionAccount = async (action: Action) => {
    const payload = {
      status: action,
      token,
    };
    try {
      let params = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(payload),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/update-member`,
        params,
      );
      const rs = await response.json();
      if (response.ok) {
        setMsg('Updated member successfully');
        setIntent('success');
        showToast();
        localStorage.removeItem('inviteMemberToken');
        setOpen(false);
        queryClient.invalidateQueries(USER_PROFILE);
        update({ triggerRefreshToken: true });
      } else {
        Object.keys(rs).forEach((key) => {
          setMsg(rs[key]);
          setIntent('error');
          showToast();
        });
        setOpen(false);
        localStorage.removeItem('inviteMemberToken');
      }
    } catch (error) {
      localStorage.removeItem('inviteMemberToken');
      setOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Team Invitation</DialogTitle>
            <DialogContent>
              You&apos;ve been invited to join a team. Would you like to accept the invitation?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance='secondary' onClick={() => handleActionAccount(Action.REJECT)}>
                  Reject
                </Button>
              </DialogTrigger>
              <Button appearance='primary' onClick={() => handleActionAccount(Action.ACTIVE)}>
                Accept
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {toasterComponent}
    </>
  );
};

export default InviteMemberDialog;
