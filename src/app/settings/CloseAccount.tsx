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
import { getSession } from 'next-auth/react';
import { useSidebar } from '@/contexts/SidebarContext';

interface Props {
  open: boolean;
  close: (status: boolean) => void;
}

const CloseAccount = ({ open, close }: Props) => {
  const { showToast, setIntent, setMsg } = useSidebar();
  const onCloseAccount = async () => {
    const session = await getSession();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/remove-account`,
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          // body: JSON.stringify({base_url: `${process.env.NEXT_PUBLIC_ENDPOINT_URL?.split('/api').at(0)}`})
          body: JSON.stringify({ base_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}` }),
        },
      );

      if (response.ok) {
        const rs = await response.json();
        setMsg(rs.detail);
        setIntent('success');
        showToast();
      }
    } catch (error) {
    } finally {
      close(!open);
    }
  };

  return (
    <Dialog open={open}>
      <DialogSurface className='w-4/5 md:w-full'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>Confirm Account Closure</DialogTitle>
          <DialogContent className='text-sm text-color-text-support'>
            An email will be sent to you to confirm the account closure. Once confirmed, your
            account will be permanently deleted. Are you sure you want to close your account?
          </DialogContent>
          <DialogActions>
            <Button
              className='!border-aero-10 !text-base !font-semibold'
              size='large'
              onClick={() => close(!open)}
            >
              Cancel
            </Button>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!bg-danger !text-base !font-semibold !text-confirm'
                size='large'
                onClick={onCloseAccount}
              >
                Close Account
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
export default CloseAccount;
