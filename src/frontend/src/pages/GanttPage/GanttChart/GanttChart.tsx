import { Box, useTheme } from '@mui/material';
import {
  GanttChange,
  GanttCollection,
  GanttTask,
  HighlightTaskComparator,
  RequestEventChange
} from '../../../utils/gantt.utils';
import GanttChartCollectionSection from './GanttChartCollectionSection';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';
import { eachDayOfInterval, isMonday, differenceInDays } from 'date-fns';
import { getMonday } from '../../../utils/datetime.utils';
import { toDateString } from 'shared';
import { GANTT_CHART_CELL_SIZE, GANTT_CHART_GAP_SIZE } from '../../../utils/gantt.utils';
import { useRef, useCallback, useEffect } from 'react';

export interface GanttEditability<E, T> {
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
  onNewTaskPressed: (collection: GanttCollection<E, T>) => void;
  onNewSubTaskPressed: (parent: GanttTask<T>) => void;
  createTaskTitle: string;
  onEditPressed: (collection: GanttCollection<E, T>) => void;
  onSavePressed: () => void;
  onCancelChanges: (collection: GanttCollection<E, T>) => void;
  onCreateChange: (change: GanttChange<T>) => void;
  highlightedChange: RequestEventChange<T>;
}

interface GanttChartProps<E, T> {
  startDate: Date;
  endDate: Date;
  collections: GanttCollection<E, T>[];
  editability?: GanttEditability<E, T>;
}

const GanttChart = <E, T>({ startDate, endDate, collections, editability }: GanttChartProps<E, T>) => {
  const theme = useTheme();
  const days = eachDayOfInterval({ start: startDate, end: endDate }).filter((day) => isMonday(day));

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const currentWeekCol = days.findIndex((day) => toDateString(day) === toDateString(getMonday(today))) + 1;
  const daysIntoWeek = differenceInDays(today, getMonday(today));
  const dailyOffset = daysIntoWeek * (parseFloat(GANTT_CHART_CELL_SIZE) / 7);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const validCollections = collections.filter((c) => c.tasks);

  const sectionDataRef = useRef<
    { sectionEl: HTMLDivElement | null; placeholderEl: HTMLDivElement | null; height: number }[]
  >([]);

  if (sectionDataRef.current.length !== validCollections.length) {
    sectionDataRef.current = validCollections.map((_, i) => ({
      sectionEl: sectionDataRef.current[i]?.sectionEl ?? null,
      placeholderEl: sectionDataRef.current[i]?.placeholderEl ?? null,
      height: sectionDataRef.current[i]?.height ?? 0
    }));
  }

  const updateVisibility = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const viewportBottom = containerRect.bottom;

    for (const data of sectionDataRef.current) {
      const { sectionEl, placeholderEl } = data;
      if (!sectionEl || !placeholderEl) continue;

      const el = sectionEl.style.display === 'none' ? placeholderEl : sectionEl;
      const elTop = el.getBoundingClientRect().top;
      const measuredHeight = sectionEl.offsetHeight || placeholderEl.offsetHeight;

      const isVisible = elTop <= viewportBottom;

      sectionEl.style.display = isVisible ? '' : 'none';
      placeholderEl.style.display = isVisible ? 'none' : '';
      placeholderEl.style.height = `${measuredHeight}px`;
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateVisibility, { passive: true });
    // Also re-check on container resize
    const ro = new ResizeObserver(updateVisibility);
    ro.observe(container);
    updateVisibility(); // initial pass

    return () => {
      container.removeEventListener('scroll', updateVisibility);
      ro.disconnect();
    };
  }, [updateVisibility]);

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        width: '100%',
        height: { xs: 'calc(100vh - 9.5rem)', md: 'calc(100vh - 6.25rem)' },
        overflow: 'scroll',
        position: 'relative',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <GanttChartTimeline start={startDate} end={endDate} />
      <Box sx={{ position: 'relative' }}>
        {validCollections.map((collection, idx) => (
          <Box key={idx}>
            {/* Real */}
            <Box
              ref={(el: HTMLDivElement | null) => {
                if (sectionDataRef.current[idx]) sectionDataRef.current[idx].sectionEl = el;
              }}
            >
              <GanttChartCollectionSection
                startDate={startDate}
                endDate={endDate}
                collection={collection}
                editability={editability}
              />
            </Box>
            {/* Placeholder */}
            <Box
              ref={(el: HTMLDivElement | null) => {
                if (sectionDataRef.current[idx]) sectionDataRef.current[idx].placeholderEl = el;
              }}
              style={{ display: 'none', height: 0 }}
            />
          </Box>
        ))}

        {currentWeekCol > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: `calc(${currentWeekCol - 1} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) + 1.1rem + ${dailyOffset}rem)`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: theme.palette.info.main,
              zIndex: 3,
              pointerEvents: 'none'
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default GanttChart;
