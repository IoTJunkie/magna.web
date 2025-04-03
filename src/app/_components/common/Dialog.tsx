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
  loading?: boolean;
}

const DialogComponent = ({
  type = 'confirm',
  title,
  content,
  onCancel,
  onConfirm,
  textCancel = 'No',
  textConfirm = 'Yes',
  open: isOpen,
  loading = false,
}: DialogComponentProps) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)} modalType='alert'>
      <DialogSurface className='w-[80%] md:w-[22%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='!text-support'>{content}</DialogContent>
          <DialogActions>
            {type === 'confirm' && (
              <>
                {onConfirm !== undefined && (
                  <DialogTrigger disableButtonEnhancement>
                    <Button
                      className='!text-nowrap !bg-danger !text-base !font-semibold !text-confirm'
                      size='large'
                      onClick={onConfirm}
                    >
                      {loading && <Spinner />}
                      {textConfirm}
                    </Button>
                  </DialogTrigger>
                )}
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!border-aero-10 !text-base !font-semibold'
                    size='large'
                    onClick={onCancel}
                  >
                    {textCancel}
                  </Button>
                </DialogTrigger>
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogComponent;

DialogComponent.displayName = 'DialogComponent';
