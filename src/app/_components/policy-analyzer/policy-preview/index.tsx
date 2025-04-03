'use client';
import PdfFileIcon from '@/app/_components/icons/pdf-file-icon';
import { Policy } from '@/app/api/__generated__/api';
import { imageFileType, pdfFileType, urlPreviewDocsFile } from '@/app/constant';
import { Button } from '@fluentui/react-components';
import { useRef, useState } from 'react';

type Props = {
  policy: Policy;
  closePdfPreview?: () => void;
};

const PolicyPreview = (props: Props) => {
  const { policy, closePdfPreview } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState<number>(1);

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
    event.preventDefault();
  };

  const firstDocument = policy?.documents && policy?.documents[0];
  const getFileTypeFromLinkUpload = (val: string) => {
    const splitStr = val.split('.');
    return splitStr[splitStr.length - 1];
  };
  const showFile = (link: string | undefined): any => {
    if (!link) {
      return <></>;
    }
    const fileType = getFileTypeFromLinkUpload(link);
    if (imageFileType.includes(`.${fileType}`)) {
      return (
        <div style={{ overflow: 'auto', width: '100%', height: '100%' }} onWheel={handleWheel}>
          <img src={link} alt='' style={{ transform: `scale(${scale})` }} ref={imageRef} />
        </div>
      );
    }
    if (pdfFileType.includes(`.${fileType}`)) {
      return <iframe src={link} style={{ width: '100%', height: '100%' }}></iframe>;
    }
    return (
      <iframe
        src={`${urlPreviewDocsFile}${encodeURIComponent(`${link}`)}&embedded=true`}
        style={{ width: '100%', height: '100%' }}
      ></iframe>
    );
  };
  return (
    <div className='flex h-full flex-1 flex-col p-5 px-6'>
      <div
        className='flex cursor-pointer justify-end text-base font-bold text-[#64646C]'
        onClick={closePdfPreview}
      >
        Close
      </div>
      <div className='mt-6 flex-1 bg-slate-400'>{showFile(firstDocument?.url)}</div>
    </div>
  );
};

export default PolicyPreview;

PolicyPreview.displayName = 'PolicyPreview';
