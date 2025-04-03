import classNames from 'classnames';
import React from 'react';

type Props = {
  className?: string;
};

const ArrowUp = ({ className }: Props) => {
  return (
    <svg
      className={classNames(className)}
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
    >
      <g id='vuesax/outline/arrow-up'>
        <g id='arrow-up'>
          <path
            id='Vector'
            d='M16.6 13.1664C16.4417 13.1664 16.2833 13.1081 16.1583 12.9831L10.725 7.54974C10.325 7.14974 9.67502 7.14974 9.27502 7.54974L3.84168 12.9831C3.60002 13.2247 3.20002 13.2247 2.95835 12.9831C2.71668 12.7414 2.71668 12.3414 2.95835 12.0997L8.39168 6.66641C9.27502 5.78307 10.7167 5.78307 11.6084 6.66641L17.0417 12.0997C17.2834 12.3414 17.2834 12.7414 17.0417 12.9831C16.9167 13.0997 16.7584 13.1664 16.6 13.1664Z'
            fill='var(--color-text-default)'
          />
        </g>
      </g>
    </svg>
  );
};

export default ArrowUp;

ArrowUp.displayName = 'ArrowUp';
