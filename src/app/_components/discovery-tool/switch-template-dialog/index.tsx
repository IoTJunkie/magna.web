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
import { useState } from 'react';

interface ISwitchTemplateDialog {
  open?: boolean;
  title?: string;
  content?: JSX.Element | string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const SwitchTemplateDialog = ({
  title,
  content,
  onCancel,
  onConfirm,
  open: isOpen,
}: ISwitchTemplateDialog) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)} modalType='non-modal'>
      <DialogSurface className='w-[80%] md:w-[22%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='!text-support'>{content}</DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!border-aero-10 !text-base !font-semibold'
                size='large'
                onClick={onCancel}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!bg-danger !text-base !font-semibold !text-confirm'
                size='large'
                onClick={onConfirm}
              >
                Proceed
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default SwitchTemplateDialog;

SwitchTemplateDialog.displayName = 'SwitchTemplateDialog';
