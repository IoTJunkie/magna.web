import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  Spinner,
} from '@fluentui/react-components';
import classNames from 'classnames';
import { useState } from 'react';

interface DialogComponentProps {
  open?: boolean;
  type?: 'confirm' | 'notice';
  title?: string;
  content?: JSX.Element | string;
  onCancel?: () => void;
  onConfirm?: (v: number) => void;
  textCancel?: string;
  textConfirm?: string;
  buyCreditLoading: boolean;
}

const BuyCreditsDialog = ({
  type = 'confirm',
  title,
  content,
  onCancel,
  onConfirm,
  textCancel = 'Cancel',
  textConfirm = 'Buy More',
  open,
  buyCreditLoading,
}: DialogComponentProps) => {
  const [value, setValue] = useState<any>(0);
  const isDisabled = !value || value <= 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (!isNaN(Number(inputValue))) {
      setValue(Number(e.target.value));
      if (inputValue.startsWith('0') && inputValue !== '0') {
        e.target.value = inputValue.slice(1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData?.getData('text');
    const filterPaste = paste?.replace(/[^0-9]/g, '');
    setValue((prevValue: number) => prevValue + Number(filterPaste));
  };

  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='z-10 min-w-96'>
        <DialogBody className='gap-y-2'>
          <DialogTitle className='!text-lg !font-semibold'>{title}</DialogTitle>
          <Input
            className='col-span-2 h-10 rounded-[0.25rem] border-[0.0625rem] bg-color-text-support px-4 py-2 focus:outline-none'
            value={value}
            min={0}
            onChange={(e) => {
              handleInputChange(e);
            }}
            onPaste={(e) => {
              handlePaste(e);
            }}
          />
          <DialogActions>
            {type === 'confirm' && (
              <>
                <DialogTrigger disableButtonEnhancement>
                  <Button
                    className='!border-aero-10 !text-base !font-semibold'
                    size='large'
                    onClick={onCancel}
                  >
                    {textCancel}
                  </Button>
                </DialogTrigger>
                {onConfirm !== undefined && (
                  <DialogTrigger disableButtonEnhancement>
                    <Button
                      className={classNames(' !font-semibold ', {
                        '!bg-aero-7 !text-confirm': !isDisabled,
                        'bg-bg-btn-disable text-text-btn-disable': isDisabled,
                      })}
                      size='large'
                      onClick={() => {
                        value && onConfirm(value);
                      }}
                      disabled={isDisabled}
                    >
                      {buyCreditLoading && <Spinner size='tiny' className='mr-1' />}
                      {textConfirm}
                    </Button>
                  </DialogTrigger>
                )}
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default BuyCreditsDialog;

BuyCreditsDialog.displayName = 'DialogComponent';
