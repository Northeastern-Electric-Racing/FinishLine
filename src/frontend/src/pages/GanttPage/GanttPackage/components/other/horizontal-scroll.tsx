import React, { SyntheticEvent, useRef, useEffect } from 'react';
import styles from './horizontal-scroll.module.css';
import { useAuth } from '../../../../../hooks/auth.hooks';

export type HorizontalScrollProps = {
  scroll: number;
  svgWidth: number;
  taskListWidth: number;
  rtl: boolean;
  onScroll: (event: SyntheticEvent<HTMLDivElement>) => void;
};

export const HorizontalScroll = ({ scroll, svgWidth, taskListWidth, rtl, onScroll }: HorizontalScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scroll;
    }
  }, [scroll]);

  const theme = useAuth().user?.defaultTheme;

  return (
    <div
      dir="ltr"
      style={{
        margin: rtl ? `0px ${taskListWidth}px 0px 0px` : `0px 0px 0px ${taskListWidth}px`
      }}
      className={theme === 'LIGHT' ? styles.scrollWrapper : styles.scrollWrapperDark}
      onScroll={onScroll}
      ref={scrollRef}
    >
      <div style={{ width: svgWidth }} className={styles.scroll} />
    </div>
  );
};
