import * as React from 'react';
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

type Props = {
  onConfirm: () => void;
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
};

export const ConfirmDeleteHistory = (props: Props) => {
  const { onConfirm, open, onClose, isLoading } = props;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Delete confirmation</DialogTitle>
          <DialogContent>This chat session will be deleted.</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance='outline' onClick={onClose}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button onClick={onConfirm} className='!bg-danger' size='large' appearance='primary'>
              {isLoading && <Spinner size='small' className='mr-4 size-4' />} Delete
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
