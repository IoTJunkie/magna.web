import CustomIcon from '@/app/_components/common/CustomIcon';
import React from 'react';

interface IInterrogativeQuestionFormProps {
  isLinkExpired: boolean;
}
const ExpiredLink = () => {
  return (
    <div className='flex flex-col items-center'>
      <CustomIcon name='alert-icon' width={88} height={88} className='hidden sm:block' />
      <CustomIcon name='alert-icon' width={45} height={45} className='hidden max-sm:block' />
      <div className='mt-6 flex flex-col font-[600] text-[#111827]'>
        <span className='text-center'>Link has expired.</span>
        <span>Please contact your team owner to get a new invitation link.</span>
      </div>
    </div>
  );
};

const InviteMemberValidLink = ({ isLinkExpired }: IInterrogativeQuestionFormProps) => {
  const showContent = () => {
    if (isLinkExpired) return <ExpiredLink />;
    return <></>;
  };

  return (
    <div className='flex w-full flex-col justify-center'>
      <h3 className='mb-[0.375rem] text-[2rem] font-[600] leading-[2.5rem] text-[#111827]'>
        Invite Link Expired
      </h3>
      {showContent()}
    </div>
  );
};

export default InviteMemberValidLink;
