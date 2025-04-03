import { ThemeTypes } from '@/app/utils/multipleThemes';
import { useThemeContext } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface Props {
  name: string;
  height?: number;
  width?: number;
  className?: string;
}

const CustomIcon = ({ name, height = 24, width = 24, className }: Props) => {
  const { theme } = useThemeContext();
  const src = theme === ThemeTypes.DARK ? `/svg/${name}-${theme}.svg` : `/svg/${name}.svg`;

  return <Image src={src} alt={name} width={width} height={height} className={className} />;
};

export default CustomIcon;
