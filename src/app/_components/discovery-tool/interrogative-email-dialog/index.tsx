import { InterrogativeEmail } from '@/app/types/interrogativeEmail';
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
  Field,
  Input,
  Option,
  Spinner,
  useId,
} from '@fluentui/react-components';
import { yupResolver } from '@hookform/resolvers/yup';
import Markdown from 'markdown-to-jsx';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import ConfirmDialog from '../../common/ConfirmDialog';
import SwitchTemplateDialog from '../switch-template-dialog';
import './index.scss';

interface IInterrogativeEmailDialogProps {
  open?: boolean;
  onCancel?: () => void;
  loading: boolean;
  questionActive: string;
  sendEmailSuccess: () => void;
  isAskClient: boolean;
}

interface ITemplate {
  id: string;
  name: string;
  body_part: string;
  footer_part: string;
}

interface IEmailForm {
  recipents: string;
  subject: string;
}

const emailRegExp =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const InterrogativeEmailDialog = ({
  open,
  onCancel,
  loading,
  questionActive,
  sendEmailSuccess,
  isAskClient,
}: IInterrogativeEmailDialogProps) => {
  const [isOpenSwitchTemplateDialog, setIsOpenSwitchTemplateDialog] = useState<boolean>(false);
  const [isOpenConfirmCancelDialog, setIsOpenConfirmCancelDialog] = useState<boolean>(false);
  const dropdownId = useId('dropdown-default');
  const [templateEmail, setTemplateEmail] = useState<ITemplate>();
  const [templateActive, setTemplateActive] = useState<string>('');
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [loadingSendEmail, setLoadingSendEmail] = useState(false);
  const templatePrevActiveRef = useRef('');
  const ipRef = useRef<any>(null);
  const params = useParams();
  const caseId = params.id as string;

  const getTemplate = async () => {
    const session = await getSession();
    const url = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/template-email`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user?.access_token}`,
      },
    });
    if (response.ok) {
      const rs = await response.json();
      if (rs.length) {
        setTemplates(rs);
        setTemplateEmail(rs[0]);
        setTemplateActive(rs[0].name);
      }
    }
  };
  useEffect(() => {
    getTemplate();
  }, []);

  useEffect(() => {
    const elm = document.getElementById('input-subject');
    if (elm) {
      ipRef.current = elm;
    }
  }, [ipRef]);

  const schema = yup
    .object({
      subject: yup.string().trim().required('The Subject is required.'),
      recipents: yup
        .string()
        .trim()
        .required('The Recipients is required.')
        .matches(emailRegExp, 'Invalid email format. Please enter a valid email address.')
        .email('Invalid email format. Please enter a valid email address.'),
    })
    .required();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterrogativeEmail>({
    resolver: yupResolver<InterrogativeEmail>(schema),
  });

  const handleSwitchTemplateDialog = () => {
    setIsOpenSwitchTemplateDialog(true);
  };

  const handleSwitchTemplate = () => {
    setIsOpenSwitchTemplateDialog(false);
    ipRef.current && ipRef.current.focus();
    setTemplateActive(templatePrevActiveRef.current);
    const tp = templates.find((item) => item.name === templatePrevActiveRef.current);
    if (tp) {
      setTemplateEmail(tp);
    }
  };

  const onSubmit = async (val: IEmailForm) => {
    if (isAskClient) {
      try {
        setLoadingSendEmail(true);
        const session = await getSession();
        const bodyPart = document.getElementById('body_part')?.innerHTML;
        const footerPart = document.getElementById('footer_part')?.innerHTML;
        const params = {
          subject: val.subject,
          to_email: val.recipents,
          body_part: bodyPart,
          footer_part: footerPart,
          client_answer_url: `${process.env.NEXT_PUBLIC_WEB_DOMAIN}/question-form/${questionActive}`,
        };
        const refreshUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/${questionActive}/send-question`;
        const response = await fetch(refreshUrl, {
          method: 'POST',
          body: JSON.stringify(params),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });
        if (response) {
          sendEmailSuccess();
          onCancel && onCancel();
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoadingSendEmail(false);
      }
    } else {
      try {
        setLoadingSendEmail(true);
        const session = await getSession();
        const body = document.getElementById('body_part')?.innerHTML;
        const params = {
          subject: val.subject,
          to_email: val.recipents,
          body: body,
          case_id: caseId,
        };
        const refreshUrl = `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/discovery/questions/send-pdf`;
        const response = await fetch(refreshUrl, {
          method: 'POST',
          body: JSON.stringify(params),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        });
        if (response.ok) {
          sendEmailSuccess();
          onCancel && onCancel();
        }
      } catch (error) {
        console.log('error', error);
      } finally {
        setLoadingSendEmail(false);
      }
    }
  };
  return (
    <>
      <Dialog open={open} modalType='alert'>
        <DialogSurface className='h-[90%] w-[90%] lg:min-w-[54.375rem]'>
          <DialogBody>
            <DialogTitle className='!text-lg !font-semibold'>
              {isAskClient ? 'Interrogative Email' : 'Email All Interrogatories'}{' '}
            </DialogTitle>
            <DialogContent className='!text-support'>
              <form
                onSubmit={handleSubmit(onSubmit)}
                id='contact-us-form'
                className='mb-12 mt-6 flex flex-col gap-5'
              >
                <Field
                  required
                  label='Subject'
                  validationState={errors.subject ? 'error' : 'none'}
                  validationMessage={
                    errors.subject?.message && (
                      <div className='pt-2 font-sans text-xs text-red-1'>
                        {errors.subject?.message}
                      </div>
                    )
                  }
                  validationMessageIcon={null}
                  className='[&_label]:text-neutrual-90 [&_label]:!font-semibold'
                >
                  <Input
                    {...register('subject')}
                    placeholder='Enter email subject'
                    size='large'
                    className='mt-[0.5rem] border-[#C7C7C7] [&_*]:!text-sm'
                    maxLength={128}
                    autoComplete='off'
                    id='input-subject'
                  />
                </Field>
                <Field
                  required
                  label='Recipients'
                  validationState={errors.recipents ? 'error' : 'none'}
                  validationMessage={
                    errors.recipents?.message && (
                      <div className='pt-2 font-sans text-xs text-red-1'>
                        {errors.recipents?.message}
                      </div>
                    )
                  }
                  validationMessageIcon={null}
                  className='[&_label]:text-neutrual-90 [&_label]:!font-semibold'
                >
                  <Input
                    {...register('recipents')}
                    placeholder="Enter recipient's email"
                    size='large'
                    className='mt-[0.5rem] border-[#C7C7C7] [&_*]:!text-sm'
                    maxLength={128}
                    autoComplete='off'
                  />
                </Field>
                <div className='flex flex-col gap-[0.5rem]'>
                  <div className='flex flex-col justify-between lg:flex-row'>
                    <label className='text-[0.875rem] font-semibold leading-[1.625rem] text-color-text-default'>
                      Email Body
                    </label>
                    <Dropdown
                      aria-labelledby={dropdownId}
                      onOptionSelect={(e, data) => {
                        if (data.optionText !== templateEmail?.name) {
                          templatePrevActiveRef.current = data.optionText || '';
                          handleSwitchTemplateDialog();
                        }
                      }}
                      value={templateActive}
                      selectedOptions={[templateActive]}
                      placeholder='Use Template'
                      className='my-2 lg:my-0'
                    >
                      {templates.map((template) => (
                        <Option value={template.name} key={template.name}>
                          {template.name}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  {!templateEmail ? (
                    <Spinner size='small' />
                  ) : (
                    <div className='interrogative-email-body h-auto rounded-[0.25rem] border border-neutrual-50 p-[1.5rem_1rem] outline-none'>
                      <div
                        id='body_part'
                        contentEditable={true}
                        className='whitespace-pre-wrap outline-0'
                      >
                        {templateEmail?.body_part}
                      </div>
                      {isAskClient && (
                        <div
                          contentEditable={false}
                          className='my-6 rounded-md bg-bg-disable px-4 py-2 text-sm font-semibold'
                        >
                          Link to question form
                        </div>
                      )}
                      <div contentEditable={true} className='outline-0' id='footer_part'>
                        <Markdown>{templateEmail ? templateEmail?.footer_part : ''}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  className='!border-aero-10 !text-base !font-semibold'
                  size='large'
                  onClick={() => {
                    setIsOpenConfirmCancelDialog(true);
                  }}
                >
                  Cancel
                </Button>
              </DialogTrigger>

              <DialogTrigger disableButtonEnhancement>
                <Button
                  className={'gap-2 !bg-aero-7 !text-base !font-semibold !text-confirm'}
                  size='large'
                  onClick={handleSubmit(onSubmit)}
                  type='submit'
                >
                  {loading || (loadingSendEmail && <Spinner size='tiny' className='mr-1' />)}
                  Send email
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {isOpenSwitchTemplateDialog && (
        <SwitchTemplateDialog
          open={isOpenSwitchTemplateDialog}
          title='Switch Template'
          content='Switching the template will replace all existing content. Do you want to proceed?'
          onCancel={() => {
            ipRef.current && ipRef.current.focus();
            setIsOpenSwitchTemplateDialog(false);
          }}
          onConfirm={handleSwitchTemplate}
        />
      )}
      {isOpenConfirmCancelDialog && (
        <ConfirmDialog
          open={isOpenConfirmCancelDialog}
          title='Exit Interrogative Email'
          content='If you leave this page, all content will not be saved. Are you sure?'
          textCancel='Cancel'
          textConfirm='Exit'
          btnColorBtnConfirm='danger'
          onCancel={() => setIsOpenConfirmCancelDialog(false)}
          onConfirm={onCancel}
        />
      )}
    </>
  );
};

export default React.memo(InterrogativeEmailDialog);
