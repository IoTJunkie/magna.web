import { imageFileType, pdfFileType, urlPreviewDocsFile } from '@/app/constant';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTrigger,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useRef, useState } from 'react';

interface Props {
  open?: boolean;
  onCancel?: () => void;
  linkDoc: string;
}
const DialogPreviewFile = ({ open: isOpen, onCancel, linkDoc }: Props) => {
  const [open, setOpen] = useState(isOpen);
  const [scale, setScale] = useState<number>(1);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = event.deltaY;
    const zoomStep = 0.1;
    if (delta > 0) {
      // Zoom out
      setScale((prevScale) => Math.max(prevScale - zoomStep, 0.1));
    } else {
      // Zoom in
      setScale((prevScale) => Math.min(prevScale + zoomStep, 3));
    }
    // event.preventDefault();
  };

  const showIframe = (url: string) => {
    const getFIleTypeFromLinkUpload = (val: string) => {
      const splitStr = val.split('.');
      return splitStr[splitStr.length - 1];
    };
    const fileType = getFIleTypeFromLinkUpload(url).toLowerCase();
    console.log(url);
    if (imageFileType.includes(`.${fileType}`)) {
      return (
        <div
          style={{ overflow: 'hidden', width: '100%', maxHeight: 'calc(100vh - 11rem)' }}
          onWheel={handleWheel}
        >
          <img src={linkDoc} alt='' style={{ transform: `scale(${scale})` }} ref={imageRef} />
        </div>
      );
    }
    if (pdfFileType.includes(`.${fileType}`)) {
      return (
        <iframe src={linkDoc} style={{ width: '100%', height: '100%' }}>
          Your browser does not support iframes.
        </iframe>
      );
    }

    return (
      <iframe
        src={`${urlPreviewDocsFile}${encodeURIComponent(`${linkDoc}`)}&embedded=true`}
        style={{ width: '100%', height: '100%' }}
      >
        Your browser does not support iframes.
      </iframe>
    );
  };
  return (
    <Dialog open={open}>
      <DialogSurface className='w-[85%] border-0 p-0 md:w-full'>
        <DialogBody style={{ gap: '0', minHeight: '90vh' }}>
          <DialogContent>{showIframe(linkDoc)}</DialogContent>
          <DialogTrigger disableButtonEnhancement>
            <DismissRegular
              className='absolute -right-8 cursor-pointer text-white'
              fontSize={30}
              onClick={onCancel}
            />
          </DialogTrigger>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogPreviewFile;

DialogPreviewFile.displayName = 'DialogPreviewFile';
