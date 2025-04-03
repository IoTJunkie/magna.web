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

interface IPopupCitationProps {
  open?: boolean;
  content?: JSX.Element | string;
  onClose?: () => void;
}

const PopupCitation = ({ open, content, onClose }: IPopupCitationProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogSurface className='w-[41rem] !p-[0.75rem_1.5rem_2rem_1.5rem] max-[640px]:w-[90%]'>
        <DialogBody className='!gap-[1rem]'>
          <DialogTitle className='!text-lg !font-semibold'>Answer Citation</DialogTitle>
          <DialogContent className='!max-h-[200px] !overflow-y-auto !whitespace-pre-wrap !text-support'>
            {content}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!border-aero-10 !text-base !font-semibold'
                size='large'
                onClick={onClose}
              >
                Close
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default PopupCitation;
