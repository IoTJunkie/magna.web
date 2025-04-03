import React, { type FC, useEffect, useState } from 'react';

const DEFAULT_MS = 30;

export interface ITypewriterProps {
  text: string | string[];
  speed?: number;
  loop?: boolean;
  random?: number;
  delay?: number;
  cursor?: boolean;
  className?: string;
}

const Typewriter: FC<ITypewriterProps> = ({
  text,
  speed = DEFAULT_MS,
  loop = false,
  random = DEFAULT_MS,
  delay = DEFAULT_MS,
  cursor = true,
  className,
}) => {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const textArray: string[] = Array.isArray(text) ? text : [text];

  useEffect(() => {
    setTimeout(
      () => {
        if (currentTextIndex < textArray[currentStringIndex]!.length) {
          setCurrentTextIndex(currentTextIndex + 1);
        } else {
          if (currentStringIndex < textArray.length - 1) {
            setTimeout(() => {
              setCurrentTextIndex(0);
              setCurrentStringIndex(currentStringIndex + 1);
            }, delay);
          } else {
            if (loop) {
              setTimeout(() => {
                setCurrentTextIndex(0);
                setCurrentStringIndex(0);
              }, delay);
            }
          }
        }
      },
      speed + Math.random() * random,
    );
  });

  return (
    <p className={className}>
      {textArray[currentStringIndex]?.substring(0, currentTextIndex)}
      <span className={'cursor'}>{cursor && '▎'}</span>
    </p>
  );
};

Typewriter.displayName = 'Typewriter';

export default Typewriter;
