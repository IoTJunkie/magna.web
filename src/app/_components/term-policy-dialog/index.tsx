/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from '@fluentui/react-components';

type Props = {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
};

const TermAndPolicyDialog = (props: Props) => {
  const { open, onClose } = props;

  return (
    <Dialog
      {...{
        open,
        onOpenChange: onClose,
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle className='text-lg'>
            Magna AI - Terms of Service and Privacy Policy{' '}
          </DialogTitle>
          <DialogContent className='h-[31.25rem] !overflow-auto text-xs text-color-text-support'>
            <div className='py-2 text-base font-bold'>Terms of Service</div>
            <div className='whitespace-pre-wrap'>
              Welcome to Magna AI, your trusted legal companion. By using Magna AI’s services, you
              agree to comply with and be bound by the following terms and conditions. Please read
              them carefully before using Magna.
            </div>
            <div className='text-sm font-semibold'>User Conduct:</div>
            <div className='pl-2'>
              Users are responsible for the accuracy and legality of the questions posed and
              policies uploaded.
              <br />
              Any misuse or violation of laws using Magna's services is strictly prohibited.
            </div>
            <div className='text-sm font-semibold'>Intellectual Property:</div>
            <div className='pl-2'>
              Magna AI and its features are protected by intellectual property laws.
            </div>
            <div className='pl-2'>
              Users may not copy, modify, distribute, or reproduce any part of Magna AI without
              explicit permission.
            </div>
            <div className='text-sm font-semibold'>Legal Guidance:</div>
            <div className='pl-2'>
              Magna AI's legal chatbot provides general information and should not be considered a
              substitute for professional legal advice.
              <br />
              Users should consult with qualified legal professionals for specific legal matters.
            </div>
            <div className='py-2 text-base font-bold'>Policy Pro</div>
            <div className='text-sm font-semibold'>Data Security:</div>
            <div className='pl-2'>
              Magna AI takes user privacy seriously. Personal data is handled in accordance with our
              Privacy Policy.
            </div>
            <div className='text-sm font-semibold'>Termination:</div>
            <div className='pl-2'>
              Magna AI reserves the right to terminate services or access for users who violate the
              terms.
            </div>
            <div className='text-sm font-semibold'>Privacy Policy:</div>
            <div className='pl-2'>
              Your privacy is important to us. This Privacy Policy outlines how Magna AI collects,
              uses, and protects your information.
            </div>
            <div className='text-sm font-semibold'>Information Collected:</div>
            <div className='pl-2'>
              Magna AI collects user-provided information and usage data to enhance services.
            </div>
            <div className='text-sm font-semibold'>Data Security:</div>
            <div className='pl-2'>
              Magna AI employs industry-standard security measures to protect user data.
            </div>
            <div className='text-sm font-semibold'>Third-Party Services:</div>
            <div className='pl-2'>
              Magna AI may use third-party services for analytics, but will not share personally
              identifiable information.
            </div>
            <div className='text-sm font-semibold'>Policy Pro Data:</div>
            <div className='pl-2'>
              Uploaded policies for analysis are not stored beyond the analysis process.
            </div>
            <div className='text-sm font-semibold'>Cookies:</div>
            <div className='pl-2'>
              Magna AI uses cookies for functionality and analytics. Users can manage cookie
              preferences.
            </div>
            <div className='text-sm font-semibold'>Updates:</div>
            <div className='pl-2'>
              Magna AI may update the Terms of Service and Privacy Policy. Users will be notified of
              significant changes.
              <br />
              By using Magna AI, you agree to these terms and policies. If you have any questions,
              please contact{' '}
              <span
                className='underline hover:cursor-pointer'
                onClick={() => {
                  window.open('mailto:support@magna.com');
                }}
              >
                support@magna.com
              </span>
              .
            </div>
          </DialogContent>
          <DialogActions className='mt-4 [&_button]:!border-aero-10'>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance='secondary' className='w-fit self-end'>
                Close
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default TermAndPolicyDialog;
