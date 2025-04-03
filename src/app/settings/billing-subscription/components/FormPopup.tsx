import { ContactUsForm } from '@/app/types/auth';
import { countries } from '@/app/utils';
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
  Select,
  Spinner,
  Textarea,
  ToastIntent,
} from '@fluentui/react-components';
import * as yup from 'yup';
import classNames from 'classnames';
import { ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';

interface ContactUsFormProps {
  open?: boolean;
  onCancel?: () => void;
  handleToastMessage: (intent: ToastIntent, msg: string) => void;
}

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const emailRegExp =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const ContactUsFormPopUp = ({ open: isOpen, onCancel, handleToastMessage }: ContactUsFormProps) => {
  const [open, setOpen] = useState(isOpen);
  const [loading, setLoading] = useState(false);
  const schema = yup
    .object({
      company_name: yup.string().trim().required('The Company Name is required.'),
      contact_person: yup.string().trim().required('The Contact Person is required.'),
      email: yup
        .string()
        .trim()
        .required('The Email Address is required.')
        .matches(emailRegExp, 'Invalid email format. Please enter a valid email address.')
        .email('Invalid email format. Please enter a valid email address.'),
      phone_number: yup
        .string()
        .trim()
        .required('The Phone Number is required.')
        .matches(phoneRegExp, 'Phone number is not valid.')
        .min(8, 'Phone number must be at least 8 characters.'),
      dial_code: yup.string().trim(),
      company_address: yup.string().trim().required('The Company Address is required.'),
      feedback_message: yup.string().trim().required('Oops! Looks like you missed something here.'),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactUsForm>({
    defaultValues: {
      company_name: '',
      contact_person: '',
      email: '',
      phone_number: '',
      dial_code: '',
      company_address: '',
      feedback_message: '',
    },
    resolver: yupResolver<ContactUsForm>(schema),
    shouldUnregister: false,
  });

  const onSubmit = async (data: ContactUsForm) => {
    try {
      setLoading(true);
      const params = { ...data };
      //params.phone_number = `${data.phone_number}`;
      const session = await getSession();
      const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/contacts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
        body: JSON.stringify(params),
      });
      setLoading(false);
      if (response.ok) {
        handleToastMessage('success', 'Your contact information has been sent!');
      }
    } catch (error) {
    } finally {
    }
  };

  const isoToEmoji = (code: string) => {
    return code
      .toLowerCase()
      .split('')
      .map((letter) => (letter.charCodeAt(0) % 32) + 0x1f1e5)
      .map((n) => String.fromCodePoint(n))
      .join('');
  };

  const validateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    e.target.value = input.replace(/[^0-9]/g, '');
  };

  return (
    <Dialog open={open}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle className='!text-3xl !font-semibold'>Contact us</DialogTitle>
          <DialogContent className='!text-support'>
            <p className='text-[1rem] font-[400] leading-6'>
              So our team can reach out to you on time
            </p>
            <form
              onSubmit={handleSubmit(onSubmit)}
              id='contact-us-form'
              className='mb-12 mt-6 flex flex-col gap-5'
              noValidate
            >
              <Field
                required
                label='Company Name'
                validationState={errors.company_name ? 'error' : 'none'}
                validationMessage={
                  errors.company_name?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.company_name?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:text-neutrual-90 [&_label]:!font-semibold'
              >
                <Input
                  {...register('company_name')}
                  placeholder='Enter company name'
                  size='large'
                  className='border-[#C7C7C7] [&_*]:!text-sm'
                  maxLength={100}
                  autoComplete='off'
                />
              </Field>
              <Field
                required
                label='Contact Person'
                validationState={errors.contact_person ? 'error' : 'none'}
                validationMessage={
                  errors.contact_person?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.contact_person?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('contact_person')}
                  placeholder='Enter contact person'
                  size='large'
                  className='border-[#C7C7C7] [&_*]:!text-sm'
                  maxLength={100}
                  autoComplete='off'
                />
              </Field>
              <Field
                required
                label='Email Address'
                validationState={errors.email ? 'error' : 'none'}
                validationMessage={
                  errors.email?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>{errors.email?.message}</div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('email')}
                  placeholder='Enter email address'
                  size='large'
                  className='border-[#C7C7C7] [&_*]:!text-sm'
                  maxLength={128}
                  autoComplete='off'
                />
              </Field>
              <Field
                required
                label='Phone Number'
                validationState={errors.phone_number ? 'error' : 'none'}
                validationMessage={
                  errors.phone_number?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.phone_number?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <div className='flex flex-row gap-2'>
                  <Select
                    size='large'
                    className={classNames('basis-2/5 [&_select]:!w-full [&_select]:!text-sm')}
                  >
                    {countries.map((option) => (
                      <option key={option.code} value={option.dial_code}>
                        {isoToEmoji(option.code)} {` (${option.dial_code}) ${option.name}`}
                      </option>
                    ))}
                  </Select>
                  <Input
                    {...register('phone_number')}
                    type='tel'
                    placeholder='Enter phone number'
                    size='large'
                    className='visible basis-3/5 !text-sm'
                    pattern='[0-9]*'
                    maxLength={20}
                    onInput={validateInput}
                    onKeyDown={(evt) =>
                      ['e', 'E', '+', '-', '.'].includes(evt.key) && evt.preventDefault()
                    }
                  ></Input>
                </div>
              </Field>
              <Field
                required
                label='Company Address'
                validationState={errors.company_address ? 'error' : 'none'}
                validationMessage={
                  errors.company_address?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.company_address?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Input
                  {...register('company_address')}
                  placeholder='Enter company address'
                  size='large'
                  className='border-[#C7C7C7] [&_*]:!text-sm'
                  maxLength={128}
                  autoComplete='off'
                />
              </Field>
              <Field
                required
                label='What can Magna AI do to supercharge your law firm?'
                validationState={errors.feedback_message ? 'error' : 'none'}
                validationMessage={
                  errors.feedback_message?.message && (
                    <div className='pt-2 font-sans text-xs text-red-1'>
                      {errors.feedback_message?.message}
                    </div>
                  )
                }
                validationMessageIcon={null}
                className='[&_label]:!font-semibold [&_label]:text-neutrual-900'
              >
                <Textarea
                  {...register('feedback_message')}
                  placeholder='Enter message'
                  size='large'
                  className='!min-h-[8.375rem]'
                  maxLength={500}
                />
              </Field>
            </form>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                className='!border-aero-10 !text-base !font-semibold'
                size='large'
                onClick={onCancel}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <DialogTrigger disableButtonEnhancement>
              <Button
                form='contact-us-form'
                type='submit'
                className='flex items-center gap-2 !bg-aero-7 !text-base !font-semibold !text-confirm'
                size='large'
              >
                {loading ? <Spinner size='tiny' /> : ''}
                Send
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ContactUsFormPopUp;
