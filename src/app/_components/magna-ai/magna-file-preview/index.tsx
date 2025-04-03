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
import PreviewFile from '../../common/PreviewFile';
import DocumentPdfIcon from '../../icons/document-pdf-icon';

interface IMagnaFilePreview {
  open?: boolean;
  linkDoc: string;
  onClose?: () => void;
}

const MagnaFilePreview = ({ open, linkDoc, onClose }: IMagnaFilePreview) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogSurface className='w-[90%] !bg-[#FFFDE7] !p-[1rem]'>
        <DialogBody className='!gap-[1rem] '>
          <DialogTitle className='flex items-center'>
            <DocumentPdfIcon className='mr-4' />{' '}
            <p className='text-[1.5rem] font-semibold leading-[2rem] !text-black'>Preview</p>
          </DialogTitle>
          <DialogContent className='!h-[32.5rem]'>
            <PreviewFile
              linkDocs={[
                {
                  upload: linkDoc,
                  url: linkDoc,
                  name: '',
                  size: 0,
                  type: '',
                },
              ]}
              expandDocs={false}
              onSetExpandDocs={() => {}}
              isMobile
            />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!border-aero-10 !bg-[#FFFDE7] !px-[1rem] !py-[0.5rem] !text-base !font-semibold !text-black'
                size='large'
                onClick={onClose}
              >
                Cancel
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default MagnaFilePreview;
