import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
} from '@fluentui/react-components';
import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DialogErrorPermissionMagna = (props: Props) => {
  const { open, onClose, onConfirm } = props;

  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='w-[80%] md:w-[22%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold' id='dialog-error-permission-magna'>
            Error!
          </DialogTitle>
          <DialogContent className='!text-support'>
            This feature is locked. Upgrade to unlock it and access more powerful tools!
          </DialogContent>
          <DialogActions className='mt-3'>
            <Button appearance='secondary' onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={'gap-2 !bg-aero-7 !text-base !font-semibold !text-confirm'}
              size='large'
              onClick={() => {
                onConfirm();
              }}
            >
              Upgrade
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogErrorPermissionMagna;
