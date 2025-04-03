import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Spinner,
} from '@fluentui/react-components';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { emailRegExp } from '@/app/settings/billing-subscription/components/FormPopup';
import React, { useCallback, useState } from 'react';
import useToastComponent from '@/app/hooks/Toast';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '../profile/profile-store';

interface TProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  hasInviteMember: boolean;
  onInviteMember: (invite: boolean) => void;
}

type FormValues = {
  email: string;
};

const schema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('The Email Address is required.')
    .matches(emailRegExp, 'Invalid email format. Please enter a valid email address.')
    .email('Invalid email format. Please enter a valid email address.'),
});

export default function InviteMemberDialog({
  open,
  setOpen,
  onInviteMember,
  hasInviteMember,
}: TProps) {
  const { profileInfo } = useProfileStore();
  const maximum_member = profileInfo?.current_subscription?.subscription_plan?.maximum_member;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(schema),
  });
  const { data: session } = useSession();
  const [loadingInvite, setLoadingInvite] = useState<boolean>(false);
  const [msg, setMsg] = useState<JSX.Element | string>('');
  const { toasterComponent, showToast, setIntent } = useToastComponent({
    content: msg,
  });

  const onSubmit = useCallback(
    async (data: FormValues) => {
      const payload = {
        email: data.email,
        base_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/invite-member`,
      };
      setLoadingInvite(true);
      try {
        let params = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
          body: JSON.stringify(payload),
        };
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/accounts/send-invitation`,
          params,
        );
        const rs = await response.json();
        if (response.ok) {
          setOpen(false);
          onInviteMember(!hasInviteMember);
          reset();
          setMsg('Invite member successfully.');
          setIntent('success');
          showToast();
        } else {
          let msg = '';
          Object.keys(rs).forEach((key) => {
            if (typeof rs[key] === 'string') {
              msg = rs[key];
            } else if (Array.isArray(rs[key])) {
              rs[key].forEach((error: string) => {
                msg = error;
              });
            }
            setMsg(msg);
            setIntent('error');
            showToast();
          });
        }
      } catch (error) {
      } finally {
        setLoadingInvite(false);
      }
    },
    [session, onInviteMember, hasInviteMember, reset, setOpen, setMsg, setIntent, showToast],
  );

  return (
    <React.Fragment>
      <Dialog modalType='alert' open={open}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Invite member</DialogTitle>
            <DialogContent>
              <div>{`Invite up to ${maximum_member} people to your team`}</div>
              <form className='mt-6'>
                <Field className='w-[95%]' validationMessage={errors?.email?.message || ''}>
                  <Input
                    placeholder='Enter email address'
                    {...register('email', { required: true })}
                  />
                </Field>
                {/* {fields?.length < 5 && (
                    <Button
                      className='!hover:bg-transparent !border-none !bg-transparent !p-0'
                      onClick={() =>
                        append({
                          email: '',
                        })
                      }
                    >
                      <span className='flex items-center'>
                        <CustomIcon name='add-more' className='-mt-1 mr-2' />
                        Add another member
                      </span>
                    </Button>
                  )} */}
              </form>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                  size='large'
                  appearance='secondary'
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                type='submit'
                size='large'
                appearance='primary'
                onClick={handleSubmit(onSubmit)}
                className='flex gap-2'
              >
                {loadingInvite && <Spinner size='tiny' />}
                Confirm
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {toasterComponent}
    </React.Fragment>
  );
}
