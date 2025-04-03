import React, { useEffect, useState } from 'react';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from '../index.module.scss';
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeTypes } from '@/app/utils/multipleThemes';

interface GraphProps {
  percentage: number;
}

const UsageGraph = (props: GraphProps) => {
  const { percentage } = props;
  const { theme, switchTheme } = useThemeContext();
  const [pathColor, setPathColor] = useState('#F3F3F4');
  useEffect(() => {
    if (percentage > 50) {
      setPathColor('#6DE9A1');
    } else if (percentage > 20) {
      setPathColor('#FEDF89');
    } else {
      setPathColor('#F04438');
    }
  }, [percentage]);

  return (
    <div
      className={`!h-[196px] !w-[196px] rounded-full bg-bg-graph p-6 ${theme === ThemeTypes.DARK ? styles.shadow_dark : styles.shadow_light}`}
    >
      <CircularProgressbarWithChildren
        value={percentage}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: `${pathColor}`,
          trailColor: theme === 'dark' ? '#93939B' : '#F3F3F4',
        })}
      >
        <div className='text-center text-sm font-[600] text-color-text-default'>
          <p>Left:</p>
          <p>{`${percentage || 0}%`}</p>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default UsageGraph;
