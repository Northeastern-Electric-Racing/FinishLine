import { Box, Typography, useTheme } from '@mui/material';
import {
  GanttChange,
  GANTT_CHART_CELL_SIZE,
  GANTT_CHART_GAP_SIZE,
  transformGanttTaskToWorkPackage,
  transformWorkPackageToGanttTask
} from '../../../../utils/gantt.utils';
import { addDays, differenceInDays } from 'date-fns';
import { DragEvent, MouseEvent, useEffect, useState } from 'react';
import useId from '@mui/material/utils/useId';
import useMeasure from 'react-use-measure';
import { WbsNumber, wbsPipe, WorkPackage } from 'shared';
import { useSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import GanttTaskBarEdit from './GanttTaskBarEdit';

const GanttTaskBarBlockedEdit = ({
  days,
  wbsNum,
  createChange,
  getStartCol,
  getEndCol,
  addWorkPackage,
  getNewWorkPackageNumber,
  teamName
}: {
  days: Date[];
  wbsNum: WbsNumber;
  createChange: (change: GanttChange) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
  teamName: string;
}) => {
  const theme = useTheme();
  const id = useId() || 'id'; // id for creating event changes
  const [startX, setStartX] = useState<number | null>(null);
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const widthPerDay = 7.2; //width per day to use for resizing calculations, kind of arbitrary,
  const [width, setWidth] = useState(0); // current width of component, will change on resize
  const [measureRef, bounds] = useMeasure();
  const { isLoading, data, isError, error } = useSingleWorkPackage(wbsNum);

  useEffect(() => {
    if (bounds.width !== 0 && width === 0) {
      setWidth(bounds.width);
    }
  }, [bounds, width]);

  if (isLoading || !data) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} />;

  const task = transformWorkPackageToGanttTask(data, teamName);

  // used to make sure that any changes to the start and end dates are made in multiples of 7
  const roundToMultipleOf7 = (num: number) => {
    return Math.round(num / 7) * 7;
  };

  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    setIsResizing(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (isResizing) {
      const currentX = e.clientX;
      const deltaX = currentX - startX!;
      setWidth(Math.max(100, width + deltaX));
      setStartX(currentX);
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      // Use change in width to calculate new length
      const newEventLengthInDays = roundToMultipleOf7(width / widthPerDay);
      // The gantt chart tasks are inclusive (their width includes the full width of their start and end date)
      const displayWeeks = newEventLengthInDays / 7 + 1;
      // We need these magic pixel numbers to dynamically calculate the correct width of the task to keep it in sync with the stored end date
      const correctWidth = displayWeeks * 38 + (displayWeeks - 1) * 10;
      const newEndDate = addDays(task.start, newEventLengthInDays);
      setWidth(correctWidth);
      createChange({
        id,
        element: transformGanttTaskToWorkPackage(task),
        type: 'change-end-date',
        originalEnd: task.end,
        newEnd: newEndDate
      });
    }
  };

  const onDragStart = () => {
    setShowDropPoints(true);
  };
  const onDragEnd = () => {
    setShowDropPoints(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (day: Date) => {
    const days = roundToMultipleOf7(differenceInDays(day, task.start));
    createChange({ id, element: transformGanttTaskToWorkPackage(task), type: 'shift-by-days', days });
  };

  return (
    <>
      <div
        style={{ position: 'relative', width: '100%', marginTop: 10 }}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gap: GANTT_CHART_GAP_SIZE,
            gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${days.length}, minmax(auto, 1fr))`,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {/* Drop areas */}
          {showDropPoints &&
            days.map((day, index) => (
              <Box
                key={index}
                onDragOver={onDragOver}
                onDrop={() => onDrop(day)}
                sx={{
                  borderRadius: '0.25rem',
                  height: '2rem',
                  minWidth: GANTT_CHART_CELL_SIZE,
                  maxWidth: GANTT_CHART_CELL_SIZE,
                  backgroundColor: `color-mix(in srgb, ${theme.palette.background.default}, transparent 75%);`
                }}
              />
            ))}
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: GANTT_CHART_GAP_SIZE,
            gridTemplateRows: `repeat(1, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${days.length}, minmax(${GANTT_CHART_CELL_SIZE}, 1fr))`,
            width: '100%'
          }}
        >
          <div
            ref={measureRef}
            style={{
              gridColumnStart: getStartCol(task.start),
              gridColumnEnd: getEndCol(task.end),
              height: '2rem',
              width: width === 0 ? `unset` : `${width}px`,
              border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
              borderRadius: '0.25rem',
              backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
              cursor: 'move'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'visible'
              }}
            >
              <Box
                draggable={true}
                onDrag={onDragStart}
                onDragEnd={onDragEnd}
                style={{
                  padding: '0.25rem',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 1,
                  userSelect: 'none'
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: task.styles ? task.styles.color : '#ffffff',
                      px: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {task.name}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  cursor: 'ew-resize',
                  height: '100%',
                  width: '5rem',
                  position: 'relative',
                  right: '-10'
                }}
                onMouseDown={handleMouseDown}
              />
            </Box>
          </div>
        </Box>
      </div>
      {task.unblockedWorkPackages.map((workPackage) => {
        return (
          <GanttTaskBarEdit
            key={workPackage.id}
            days={days}
            task={transformWorkPackageToGanttTask(workPackage, task.teamName)}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            isProject={false}
            addWorkPackage={addWorkPackage}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
      {task.blocking.map((wbsNum) => {
        return (
          <GanttTaskBarBlockedEdit
            key={wbsPipe(wbsNum)}
            days={days}
            wbsNum={wbsNum}
            teamName={task.teamName}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            addWorkPackage={addWorkPackage}
            getNewWorkPackageNumber={getNewWorkPackageNumber}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarBlockedEdit;
