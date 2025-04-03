import classNames from 'classnames';
import React from 'react';

type Props = {
  className?: string;
};

const ArrowDown = ({ className }: Props) => {
  return (
    <svg
      className={classNames(className)}
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
    >
      <g id='vuesax/outline/arrow-down'>
        <g id='arrow-down'>
          <path
            id='Vector'
            d='M9.99929 13.9995C9.41595 13.9995 8.83262 13.7745 8.39095 13.3329L2.95762 7.89954C2.71595 7.65788 2.71595 7.25788 2.95762 7.01621C3.19928 6.77454 3.59928 6.77454 3.84095 7.01621L9.27428 12.4495C9.67428 12.8495 10.3243 12.8495 10.7243 12.4495L16.1576 7.01621C16.3993 6.77454 16.7993 6.77454 17.041 7.01621C17.2826 7.25788 17.2826 7.65788 17.041 7.89954L11.6076 13.3329C11.166 13.7745 10.5826 13.9995 9.99929 13.9995Z'
            fill='var(--color-text-default)'
          />
        </g>
      </g>
    </svg>
  );
};

export default ArrowDown;

ArrowDown.displayName = 'ArrowDown';
