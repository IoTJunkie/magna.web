import classNames from 'classnames';
import React from 'react';

type Props = {
  className?: string;
};

const EditIcon = ({ className }: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='16'
      height='16'
      className={classNames(className, 'stroke-current')}
      viewBox='0 0 16 16'
      fill='none'
    >
      <path
        d='M6.35533 7.43354C6.12782 7.66139 6.00002 7.97021 6 8.2922V10.0002H7.71867C8.04067 10.0002 8.35 9.8722 8.578 9.6442L13.6447 4.57487C13.7575 4.46207 13.847 4.32816 13.908 4.18077C13.9691 4.03338 14.0005 3.87541 14.0005 3.71587C14.0005 3.55633 13.9691 3.39836 13.908 3.25097C13.847 3.10358 13.7575 2.96966 13.6447 2.85687L13.144 2.3562C13.0312 2.24328 12.8972 2.1537 12.7498 2.09258C12.6023 2.03146 12.4443 2 12.2847 2C12.1251 2 11.967 2.03146 11.8195 2.09258C11.6721 2.1537 11.5381 2.24328 11.4253 2.3562L6.35533 7.43354Z'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14 8.00049C14 10.8292 14 12.2432 13.1213 13.1218C12.2427 14.0005 10.828 14.0005 8 14.0005C5.17133 14.0005 3.75733 14.0005 2.87867 13.1218C2 12.2432 2 10.8285 2 8.00049C2 5.17182 2 3.75782 2.87867 2.87915C3.75733 2.00049 5.172 2.00049 8 2.00049'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};

export default EditIcon;

EditIcon.displayName = 'EditIcon';
