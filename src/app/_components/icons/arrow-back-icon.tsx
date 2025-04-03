import classNames from 'classnames';
import React from 'react';

type Props = {
  className?: string;
};

const ArrowBack = ({ className }: Props) => {
  return (
    <svg
      className={classNames(className)}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
    >
      <g id='Regular icon large'>
        <path
          id='Shape'
          d='M14.3536 7.14645C14.5488 7.34171 14.5488 7.65829 14.3536 7.85355L10.2071 12L14.3536 16.1464C14.5488 16.3417 14.5488 16.6583 14.3536 16.8536C14.1583 17.0488 13.8417 17.0488 13.6464 16.8536L9.14645 12.3536C8.95118 12.1583 8.95118 11.8417 9.14645 11.6464L13.6464 7.14645C13.8417 6.95118 14.1583 6.95118 14.3536 7.14645Z'
          fill='var(--color-text-default)'
        />
      </g>
    </svg>
  );
};

export default ArrowBack;

ArrowBack.displayName = 'ArrowBack';
