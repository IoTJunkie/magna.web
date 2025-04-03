import React, { useState } from 'react';
import CustomIcon from '../common/CustomIcon';
import { ApiDeleteStatus } from '@/config';

type DeleteAccountMessageProps = {
  status: string | null;
};

const DeleteAccountMessage = ({ status }: DeleteAccountMessageProps) => {
  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <h3 className='mb-[2.9375rem] text-[2rem] font-semibold leading-[2.5rem] text-[#111827]'>
        Closing Account
      </h3>
      {status === ApiDeleteStatus.SUCCCESS ? (
        <>
          <CustomIcon name='icon-success' width={88} height={88} />
          <p className='mt-[1.5rem] text-center text-[1rem] font-bold leading-[1.375rem] text-[#111827]'>
            Your account has been closed successfully.
          </p>
        </>
      ) : status === ApiDeleteStatus.FAILURE ? (
        <>
          <CustomIcon name='close-fail-icon' width={88} height={88} />
          <p className='mt-[1.5rem] text-center text-[1rem] font-bold leading-[1.375rem] text-[#111827]'>
            There was an error closing your account. Please check with the admin for assistance.
          </p>
        </>
      ) : (
        <>
          <CustomIcon name='expired-icon' width={88} height={88} />
          <p className='mt-[1.5rem] text-center text-[1rem] font-bold leading-[1.375rem] text-[#111827]'>
            Confirmation link has expired. Please request another one.
          </p>
        </>
      )}
    </div>
  );
};

export default DeleteAccountMessage;
