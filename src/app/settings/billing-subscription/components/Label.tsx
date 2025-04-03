import styles from './index.module.scss';

interface ILabelProps {
  content: string;
  className: string;
}

const Label = (props: ILabelProps) => {
  return (
    <div
      className={`h-[2rem] w-[10rem]  rotate-45 justify-center bg-aero-7 text-center text-[#FFFFFF] ${styles.label} ${props.className}`}
    >
      <p className='text-[1rem] leading-8'>{props.content}</p>
    </div>
  );
};

export default Label;
