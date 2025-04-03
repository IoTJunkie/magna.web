import React from 'react';
import CustomIcon from '../common/CustomIcon';

type Props = {
  className?: string;
};

const PdfFileIcon = ({ className }: Props) => {
  return <CustomIcon name='file-icon' className={className} />;
};

export default PdfFileIcon;

PdfFileIcon.displayName = 'PdfFileIcon';
