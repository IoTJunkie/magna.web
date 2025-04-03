import IntroduceSection from '@/app/_components/conversation/introduce-section';
import { ChevronCircleRight24Regular } from '@fluentui/react-icons';
import Image from 'next/image';
import Link from 'next/link';

type CardItem = {
  icon: string;
  title: string;
  description: string;
  url: string;
};

const WelcomePage = () => {
  const description =
    'Driving the fusion of AI and professional expertise, we offer advanced tools tailored for both professionals and everyday individuals. Our mission is "to democratize access to expert legal guidance, one intelligent interaction at a time."';

  const cardItems: CardItem[] = [
    {
      icon: '/svg/welcome_magna_AI.svg',
      title: 'Magna AI',
      description:
        'Description here. Driving the fusion of AI and professional expertise, we offer advanced tools.',
      url: '/legal-chat',
    },
    {
      icon: '/svg/welcome_policy_analyzer.svg',
      title: 'Policy Pro',
      description:
        'Description here. Driving the fusion of AI and professional expertise, we offer advanced tools.',
      url: '/policy-analyzer',
    },
  ];
  return (
    <div className='flex h-auto min-h-full flex-col justify-between'>
      <div className='max-w-chat-layout mx-auto flex w-full flex-1 flex-col overflow-hidden px-5 lg:mx-auto xl:px-0'>
        <IntroduceSection title='Welcome to Magna' description={description} type='dashboard' />
        <div className='mx-auto mt-10 grid w-full grid-cols-1 gap-8 md:mt-10 md:grid-cols-2 2xl:mt-11'>
          {cardItems.map((item) => (
            <Link href={item.url} key={item.url}>
              <div
                key={item.url}
                className='bg-mint-1 max-w-sm cursor-pointer rounded-[1.25rem] border border-neutrual-25 p-6 lg:max-w-md'
              >
                <div className='relative aspect-square w-12 xl:w-14'>
                  <Image fill src={item.icon} alt={item.title} />
                </div>

                <div className='mt-5 flex justify-between xl:mt-6'>
                  <h4 className='text-base font-semibold lg:text-lg'>{item.title}</h4>
                  <div>
                    <ChevronCircleRight24Regular className='text-aero-8' />
                  </div>
                </div>

                <p className='mt-4 font-sans text-sm text-text-support'>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* <div className='mt-[3.125rem] flex w-full justify-between border-t border-neutrual-50 px-5 py-4 text-xs md:mt-5 md:px-10'>
        <div>A team committed to success</div>
        <div>PLG Lawtech app</div>
      </div> */}
    </div>
  );
};

export default WelcomePage;

WelcomePage.displayName = 'WelcomePage';
