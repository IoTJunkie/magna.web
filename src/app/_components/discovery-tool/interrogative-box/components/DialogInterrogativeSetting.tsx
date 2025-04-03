'use client';
import Loading from '@/app/loading';
import { ICaseDetail } from '@/app/types/discovery';
import { IState } from '@/app/types/interrogative';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Option,
  OptionOnSelectData,
  Radio,
  RadioGroup,
  SelectionEvents,
  Spinner,
  useId,
} from '@fluentui/react-components';
import { getSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  open: boolean;
  onCancel: () => void;
  caseId: string;
  caseDetail: ICaseDetail | null;
  getCaseDetail: () => void;
  settingChanged: boolean;
};

const DialogInterrogativeSetting = ({
  open,
  onCancel,
  caseId,
  caseDetail,
  getCaseDetail,
  settingChanged,
}: Props) => {
  const dropdownId = useId('dropdown-default');
  const [value, setValue] = useState('');
  const [usStateList, setUsStateList] = useState<IState[]>([] as IState[]);
  const stateIdRef = useRef<string | number>('');
  const [defaultValue, setDefaultValue] = useState<IState>();
  const [loadingGetStateList, setLoadingGetStateList] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);

  useEffect(() => {
    setValue(caseDetail?.state_id ? '2' : '1');
  }, [caseDetail]);

  useEffect(() => {
    const getListStates = async () => {
      try {
        setLoadingGetStateList(true);
        const session = await getSession();
        const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/utilities/states`;
        const rs = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });
        if (rs.ok) {
          const response = await rs.json();
          if (response.results) {
            setUsStateList(response.results);
            const defaultValue: IState[] = response.results.filter(
              (item: IState) => item.name === 'Florida',
            );
            setDefaultValue(defaultValue[0]);
            stateIdRef.current = defaultValue[0].id;
          }
        }
      } catch (error) {
      } finally {
        setLoadingGetStateList(false);
      }
    };
    getListStates();
  }, []);

  const onConfirm = async () => {
    try {
      setLoadingConfirm(true);
      const session = await getSession();
      const body =
        value === '1'
          ? { is_federal: true, state_id: null }
          : {
              state_id: Number(stateIdRef.current),
              is_federal: null,
            };
      const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/cases/${caseId}`;
      const rs = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          ...body,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      if (rs.ok) {
        getCaseDetail();
        onCancel();
      }
    } catch (error) {
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <Dialog open={open} modalType='alert'>
      <DialogSurface className='h-[90%] w-[38rem] '>
        <DialogBody>
          <DialogTitle className='!text-lg !font-semibold'>Interrogative Setting</DialogTitle>
          <DialogContent className='!text-support'>
            <>
              <div className='mb-3 text-sm text-text-support'>
                Select your interrogative preference. This will apply to all interrogatories and can
                only be set once.
              </div>
              <div>
                <RadioGroup
                  value={value}
                  onChange={(_, data) => {
                    setValue(data.value);
                    if (defaultValue) {
                      stateIdRef.current = defaultValue.id;
                    }
                  }}
                >
                  <Radio value='1' label='Federal jurisdiction' />
                  <Radio value='2' label='State and Territory jurisdiction' />
                </RadioGroup>
              </div>
              {value === '2' && (
                <div
                  onClick={() => {
                    setOpenStateDropdown(!openStateDropdown);
                  }}
                >
                  {loadingGetStateList ? (
                    <div className='h-fit overflow-hidden'>
                      <Spinner size='tiny' />
                    </div>
                  ) : (
                    <Dropdown
                      open={openStateDropdown}
                      placeholder='Select...'
                      className='float-right mt-2 !w-[93%]'
                      aria-labelledby={dropdownId}
                      defaultSelectedOptions={[
                        `${caseDetail?.state_id ? caseDetail?.state_id : defaultValue?.id?.toString()}`,
                      ]}
                      defaultValue={
                        caseDetail?.state ? caseDetail?.state?.name : defaultValue?.name
                      }
                      onOptionSelect={(event: SelectionEvents, data: OptionOnSelectData) => {
                        stateIdRef.current = data.optionValue || '';
                      }}
                    >
                      <div className='max-h-80'>
                        {usStateList?.map((option) => (
                          <Option key={option.id} value={`${option.id}`}>
                            {option.name}
                          </Option>
                        ))}
                      </div>
                    </Dropdown>
                  )}
                </div>
              )}
            </>
          </DialogContent>
          <DialogActions>
            {settingChanged && (
              <DialogTrigger disableButtonEnhancement>
                <Button
                  className={'!text-cancel !mt-3 gap-2 !px-9 !text-base !font-semibold'}
                  size='large'
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </DialogTrigger>
            )}
            <DialogTrigger disableButtonEnhancement>
              <Button
                className={'!mt-3 gap-2 !bg-aero-7 !px-9 !text-base !font-semibold !text-confirm'}
                size='large'
                onClick={onConfirm}
                type='submit'
                disabled={loadingGetStateList}
              >
                {loadingConfirm && <Spinner size='tiny' className='mr-1' />}
                Confirm
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DialogInterrogativeSetting;
