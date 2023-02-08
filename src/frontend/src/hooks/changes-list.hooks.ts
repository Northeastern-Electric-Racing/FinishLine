import { useLayoutEffect, useState } from 'react';

export const useWindowSize = (bodyWidth: number) => {
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const determinePosition = () => {
    return window.innerWidth < bodyWidth ? 'top' : 'right';
  };
  const [position, setPosition] = useState<'top' | 'right'>(determinePosition());
  useLayoutEffect(() => {
    const updateTooltipProps = () => {
      setInnerWidth(window.innerWidth);
      setPosition(determinePosition());
    };
    window.addEventListener('resize', () => {
      updateTooltipProps();
    });
    updateTooltipProps();
    return () =>
      window.removeEventListener('resize', () => {
        updateTooltipProps();
      });
  }, []);
  // for some reason it wants me to put determinePosition as a dependency
  // when it didn't require that in the ChangesList files
  return [innerWidth, position];
};
