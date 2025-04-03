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
  setOpen: (value: boolean) => void;
  onClose: () => void;
  title: string;
  content: string;
};

const DialogError = (props: Props) => {
  const { open, setOpen, onClose, title, content } = props;
  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)} modalType='alert'>
      <DialogSurface className='w-[80%] md:w-[22%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='!text-support'>{content}</DialogContent>
          <DialogActions>
            <Button
              className='!border-aero-10 !text-base !font-semibold'
              size='large'
              onClick={onClose}
            >
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogError;
