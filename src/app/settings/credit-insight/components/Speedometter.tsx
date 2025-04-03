import ThemeProvider from '@/app/providers/fluent-provider';
import { ThemeTypes } from '@/app/utils/multipleThemes';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

interface ISpeedometterProps {
  credits: number;
  theme: string;
}

// const screenWidth = window.innerWidth;
// const screenHeight = window.innerHeight;

const Speedometter = (props: ISpeedometterProps) => {
  useEffect(() => {
    const dpr = window.devicePixelRatio;
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    const cw = canvas?.width;
    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);
    const ch = canvas?.height;
    // canvas.style.width = screenWidth + 'px'
    // canvas.style.height = screenHeight + 'px'
    const PI = Math.PI;
    const PI2 = PI * 2;
    const cx = 100;
    const cy = 100;
    const r = 60;
    const min = PI * 0.9;
    const max = PI2 + PI * 0.1;
    let percent = (props.credits / 1200) * 100;
    let color = '#BDBDBD';
    if (percent < 20) {
      color = 'red';
    } else if (percent < 50) {
      color = '#F79009';
    } else {
      color = '#9AE5AD';
    }

    if (percent > 100) {
      percent = 100;
    }

    ctx.lineCap = 'round';
    ctx.font = '24px verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'gray';
    const step = [
      { value: '0', x: 30, y: 130 },
      { value: '200', x: 20, y: 80 },
      { value: '400', x: 40, y: 40 },
      { value: '600', x: 100, y: 25 },
      { value: '800', x: 160, y: 40 },
      { value: '1000', x: 180, y: 80 },
      { value: '', x: 175, y: 130 },
    ];

    function displayLargeNumber(credits: number): string {
      if (credits > 1000) {
        credits = credits / 1000;
        return credits
          .toFixed(credits % 1 === 0 ? 0 : 2)
          .toString()
          .concat('K');
      } else if (credits > 1000000) {
        credits = credits / 1000000;
        return credits
          .toFixed(credits % 1 === 0 ? 0 : 2)
          .toString()
          .concat('M');
      }
      return credits.toString();
    }

    function drawSpeedometter() {
      ctx.clearRect(0, 0, cw, ch);
      // draw full guage outline
      ctx.beginPath();
      ctx.arc(cx, cy, r, min, max);
      ctx.strokeStyle = '#DADADB33';
      ctx.lineWidth = 15;
      ctx.stroke();
      // draw percent indicator
      ctx.beginPath();
      ctx.arc(cx, cy, r, min, min + ((max - min) * percent) / 100);
      ctx.strokeStyle = color;
      ctx.lineWidth = 14;
      ctx.stroke();
      ctx.font = '500 1.75rem Arial';
      ctx.fillStyle = props.theme === ThemeTypes.DARK.toLowerCase() ? 'white' : 'black';
      ctx.fillText(displayLargeNumber(props.credits), cx, cy - 5);
      let start = 10;
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = '#BDBDBD';
        ctx.font = '400 0.625rem Arial';
        start += 10 * (i < 4 ? (i % 4) + 1 : 4 - (i % 4) + 1);
        ctx.fillText(step[i].value, step[i].x, step[i].y);
      }
    }
    drawSpeedometter();
  }, [props.credits, props.theme]);

  return <canvas id='myCanvas' width={200} height={200}></canvas>;
};

export default Speedometter;
