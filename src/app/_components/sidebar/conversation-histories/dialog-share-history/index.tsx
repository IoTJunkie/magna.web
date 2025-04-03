import * as React from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from '@fluentui/react-components';
import { IMember } from '@/app/settings/team-management/types';
import { useState } from 'react';

type Props = {
  onConfirm: (selectedMembers: string[], memberName: string) => void;
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  memberList: IMember[];
};

export const DialogShareHistory = (props: Props) => {
  const { onConfirm, open, onClose, isLoading, memberList } = props;
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleCheckboxChange = (memberId: string) => {
    setSelectedMembers((prevSelectedMembers) => {
      if (prevSelectedMembers.includes(memberId)) {
        return prevSelectedMembers.filter((id) => id !== memberId);
      } else {
        return [...prevSelectedMembers, memberId];
      }
    });
  };
  const resetSelectedMembers = () => {
    setSelectedMembers([]);
  };
  React.useEffect(() => {
    if (open) {
      resetSelectedMembers();
    }
  }, [open]);
  const handleConfirm = () => {
    const selectedMemberNames = memberList
      .filter((member) => selectedMembers.includes(member.app_user))
      .map((member) => member.name)
      .join(', ');
    onConfirm(selectedMembers, selectedMemberNames);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Share chat to team member</DialogTitle>
          <DialogContent className='flex flex-col gap-2'>
            <div className='py-1.5'>Share this chat to people on your team</div>
            {memberList.length === 0 ? (
              <div className='pb-10 pt-5'>
                <div className='rounded-lg border py-3 text-center'>
                  <h2 className='text-2xl font-semibold leading-9'>No team member yet</h2>
                  <p className='text-base text-support'>
                    Go to Settings/Team Management to add members
                  </p>
                </div>
              </div>
            ) : (
              memberList.map((member, index) => (
                <div className='flex items-center gap-1' key={index}>
                  <Checkbox
                    checked={selectedMembers.includes(member.app_user)}
                    onChange={() => handleCheckboxChange(member.app_user)}
                  />
                  <div
                    className='border-neutral-50 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-1'
                    onClick={() => handleCheckboxChange(member.app_user)}
                  >
                    {/* {member.avatar_url ? (
                      <Avatar
                        image={{ src: member.avatar_url }}
                        className='h-8 w-8 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex size-7 cursor-pointer items-center justify-center rounded-[50%] bg-aero-12 text-xs text-neutral'>
                        {member.email.slice(0, 2).toUpperCase()}
                      </div>
                    )} */}
                    <span className='min-h-5'>
                      {member.email}{' '}
                      {member.name && member.name.trim() !== '' && <span>({member.name})</span>}
                    </span>
                  </div>
                </div>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance='outline' onClick={onClose}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              onClick={handleConfirm}
              className='primary'
              size='large'
              appearance='primary'
              disabled={memberList.length === 0 || selectedMembers.length === 0}
            >
              {isLoading && <Spinner size='small' className='mr-4 size-4' />} Share
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
