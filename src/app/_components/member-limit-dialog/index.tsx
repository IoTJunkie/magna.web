import { IMember } from '@/app/settings/team-management/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from '@fluentui/react-components';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import CustomIcon from '../common/CustomIcon';
import { useProfileStore } from '../profile/profile-store';

interface IProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MemberLitmitDialog = ({ open, setOpen }: IProps) => {
  const { teamsMember, profileInfo, setTeamsMember } = useProfileStore();
  const maximumMember = profileInfo?.current_subscription?.subscription_plan?.maximum_member;

  const [memberToDelete, setMemberToDelete] = useState<IMember | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [totalValidMembers, setTotalValidMembers] = useState(false);

  useEffect(() => {
    if (teamsMember && maximumMember) {
      setTotalValidMembers(teamsMember.length <= maximumMember);
    }
  }, [teamsMember, maximumMember, setOpen]);

  const handleConfirmClick = () => {
    setOpen(false);
  };

  const cancelDelete = () => {
    setConfirmDialogOpen(false);
  };

  const handleDeleteMember = async () => {
    try {
      setIsLoadingDelete(true);
      const session = await getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/remove-member/${memberToDelete?.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      if (response.ok && teamsMember && memberToDelete) {
        const newArr = teamsMember.filter((member) => member.id !== memberToDelete.id) || [];
        setTeamsMember(newArr);
        setMemberToDelete(null);
      } else {
        console.log('error', response.json());
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoadingDelete(false);
      setConfirmDialogOpen(false);
    }
  };

  const onDeleteMember = (member: IMember) => {
    setMemberToDelete(member);
    setConfirmDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              <div className='flex items-center gap-2'>
                <CustomIcon name='warning-yl' width={24} height={24} />{' '}
                <span className='text-lg'>Member Limit Exceeded</span>
              </div>
            </DialogTitle>
            <DialogContent>
              <div className='flex flex-col gap-4'>
                <span>
                  The number of members has exceeded the limit. Please remove some members{' '}
                  <b>now</b> to proceed.
                </span>
                <div className='flex flex-col gap-1'>
                  <span
                    className={classNames('mb-2 font-semibold', {
                      'text-aero-7': totalValidMembers,
                      'text-color-critical': !totalValidMembers,
                    })}
                  >
                    {teamsMember?.length || 0}/{maximumMember} members allowed
                  </span>
                  {teamsMember ? (
                    teamsMember.map((member) => (
                      <div className='flex items-center gap-1' key={member.id}>
                        <div className='border-neutral-50 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-1'>
                          <span className='min-h-5'>
                            {member.email}
                            {member.name && member.name.trim() !== '' && (
                              <span>({member.name})</span>
                            )}
                          </span>
                        </div>
                        <div className='cursor-pointer' onClick={() => onDeleteMember(member)}>
                          <CustomIcon name='delete' width={20} height={20} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance='primary'
                  size='large'
                  onClick={handleConfirmClick}
                  disabled={!totalValidMembers}
                  className='!mt-3'
                >
                  Confirm
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={confirmDialogOpen}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              You are about to remove a team member from your team account. Are you sure you want to
              delete this member?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button onClick={cancelDelete} appearance='secondary'>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button onClick={handleDeleteMember} appearance='primary' className='flex gap-2'>
                {isLoadingDelete && <Spinner size='tiny' />}
                Remove member
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default MemberLitmitDialog;
