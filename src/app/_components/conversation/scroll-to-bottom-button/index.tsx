import { ArrowSortDown24Regular } from '@fluentui/react-icons';
import classNames from 'classnames';
import { type FC, useCallback, useEffect } from 'react';
import { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';

interface ScrollToBottomButtonProps {
  className?: string;
  title?: string;
  trigger?: boolean;
}

const ScrollToBottomButton: FC<ScrollToBottomButtonProps> = (props) => {
  const { className, title, trigger } = props;
  const scrollToBottom = useScrollToBottom();

  const [sticky] = useSticky();

  useEffect(() => {
    scrollToBottom({ behavior: 'smooth' });
  }, [trigger, scrollToBottom]);

  const onClick = useCallback(() => {
    scrollToBottom({ behavior: 'smooth' });
  }, [scrollToBottom]);

  return (
    <button
      {...{
        className: classNames(
          'absolute h-9 w-9 right-10 bottom-[1.25rem] z-10 rounded-full border border-gray-300 bg-gray-50 text-gray-600 dark:border-color-screen-bg/10 dark:bg-color-screen-bg/10 dark:text-gray-600 dark:hover:bg-aero-8  hover:bg-aero-8 hover:text-color-screen-bg transition-all duration-200 ease-in-out',
          'flex items-center justify-center',
          {
            'opacity-0 hover:opacity-0': sticky,
            'cursor-pointer': !sticky,
          },
          className,
        ),
        onClick,
        title: (!sticky && title) || undefined,
      }}
    >
      <ArrowSortDown24Regular className='mx-auto size-5' />
    </button>
  );
};

ScrollToBottomButton.displayName = 'ScrollToBottomButton';

export default ScrollToBottomButton;
