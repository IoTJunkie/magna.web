const ChatSkeleton = () => {
  return (
    <>
      <div className='max-w-chat-layout mx-auto mt-6 w-full px-5 2xl:px-0'>
        <div className='flex size-7 animate-pulse rounded-full bg-neutrual-25' />

        <div className='mt-3 h-14 animate-pulse rounded-xl border border-neutrual-25 bg-neutrual-25 px-5 py-4'></div>

        <div className='mt-5 flex'>
          <div className='flex size-7 animate-pulse items-center justify-center rounded-full bg-neutrual-25 p-1'></div>
        </div>

        <div className='mt-3 h-24 whitespace-pre-wrap break-words rounded-xl bg-aero-1 px-5 py-4 text-base text-text-support'></div>
      </div>

      <div className='max-w-chat-layout mx-auto mt-6 w-full px-5 2xl:px-0'>
        <div className='flex size-7 animate-pulse rounded-full bg-neutrual-25' />
        <div className='mt-3 h-14 animate-pulse rounded-xl border border-neutrual-25 bg-neutrual-25 px-5 py-4'></div>

        <div className='mt-5 flex'>
          <div className='flex size-7 animate-pulse items-center justify-center rounded-full bg-neutrual-25 p-1'></div>
        </div>

        <div className='mt-3 h-36 whitespace-pre-wrap break-words rounded-xl bg-aero-1 px-5 py-4 text-base text-text-support'></div>
      </div>
    </>
  );
};

export default ChatSkeleton;

ChatSkeleton.displayName = 'ChatSkeleton';
