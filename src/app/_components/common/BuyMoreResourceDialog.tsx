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

const BuyMoreResourceDialog = ({
  type = 'confirm',
  title,
  content,
  onCancel,
  onConfirm,
  textCancel = 'Close',
  textConfirm = 'Buy More',
  open,
  loading = false,
}: DialogComponentProps) => {
  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='w-[40rem] sm:w-[50%] md:min-w-[26.25rem]'>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <DialogContent className='!text-support'>{content}</DialogContent>
          <DialogActions>
            {type === 'confirm' ? (
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
                      className='!bg-aero-7 !text-base !font-semibold !text-confirm'
                      size='large'
                      onClick={onConfirm}
                    >
                      {loading && <Spinner size='tiny' className='mr-1' />}
                      {textConfirm}
                    </Button>
                  </DialogTrigger>
                )}
              </>
            ) : (
              <DialogTrigger disableButtonEnhancement>
                <Button
                  className='!bg-aero-7 !text-base !font-semibold !text-confirm'
                  size='large'
                  onClick={onCancel}
                >
                  OK
                </Button>
              </DialogTrigger>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default BuyMoreResourceDialog;

BuyMoreResourceDialog.displayName = 'DialogComponent';
