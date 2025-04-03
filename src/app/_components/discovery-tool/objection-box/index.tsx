import classNames from 'classnames';
import React from 'react';

interface IObjectionBox {
  title: string;
  content: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const ObjectionBox = ({ title, content, isSelected = false, onClick }: IObjectionBox) => {
  return (
    <div
      className={classNames(
        'flex cursor-pointer flex-col gap-[0.625rem] rounded-[1rem] p-[1.5rem_2rem] pr-[3rem]',
        {
          'bg-surface-background-selected': isSelected,
          'bg-bg-disable': !isSelected,
        },
      )}
      onClick={onClick}
    >
      <h2 className='text-[0.875rem] font-[600] leading-[1.25rem] text-color-text-default'>
        {title}
      </h2>
      <p className='ledding-[1.25rem] text-[0.875rem] font-[400]'>{content}</p>
    </div>
  );
};

export default ObjectionBox;
