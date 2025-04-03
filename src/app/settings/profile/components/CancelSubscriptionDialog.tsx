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

interface DialogComponentProps {
  open?: boolean;
  type?: 'confirm' | 'notice';
  title?: string;
  content?: JSX.Element | string;
  onCancel?: () => void;
  onConfirm?: () => void;
  textCancel?: string;
  textConfirm?: string;
  plan?: string | undefined;
  expriedDate?: string | undefined;
}

const CancelSubscriptionDialog = ({
  type = 'confirm',
  title,
  content,
  onCancel,
  onConfirm,
  expriedDate,
  plan,
  textCancel = 'Cancel',
  textConfirm = 'Confirm Cancellation',
  open: isOpen,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)} modalType='alert'>
      <DialogSurface className='w-[80%] md:w-[50%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='!text-support'>
            {content} <span className='text-sm font-[500] text-text-support'>{plan} Plan </span>{' '}
            {''}
            {expriedDate && <span>until</span>} {''}
            <span className='text-sm font-[500] text-text-support'>{expriedDate}</span>
          </DialogContent>
          <DialogActions className='!col-span-2'>
            {type === 'confirm' && (
              <>
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!border-aero-10 !text-base !font-semibold'
                    size='large'
                    onClick={onCancel}
                  >
                    {textCancel}
                  </Button>
                </DialogTrigger>
                {onConfirm !== undefined && (
                  <DialogTrigger disableButtonEnhancement>
                    <Button
                      className='w-auto !bg-danger !text-base !font-semibold !text-confirm'
                      onClick={onConfirm}
                    >
                      {textConfirm}
                    </Button>
                  </DialogTrigger>
                )}
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CancelSubscriptionDialog;

CancelSubscriptionDialog.displayName = 'DialogComponent';
