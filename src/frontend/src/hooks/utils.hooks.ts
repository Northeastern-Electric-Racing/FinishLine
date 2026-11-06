/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility hooks for various different use cases.
 */

/**
 * A custom hook that builds on useLocation to parse the query string for you.
 * @returns Query data.
 */
export const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

/**
 * A custom hook that gives the current time and updates it every tick.
 * Ticks land on multiples of tickMs (a one minute tick updates right as the minute changes),
 * instead of counting from when the component mounted.
 * @param tickMs how often the time is updated, in milliseconds
 * @returns The current time as of the last tick.
 */
export const useNow = (tickMs: number): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      timeout = setTimeout(
        () => {
          setNow(new Date());
          scheduleNextTick();
        },
        tickMs - (Date.now() % tickMs)
      );
    };

    // catch up on any time that passed since the first render
    // then sync with the clock
    setNow(new Date());
    scheduleNextTick();

    return () => clearTimeout(timeout);
  }, [tickMs]);

  return now;
};
