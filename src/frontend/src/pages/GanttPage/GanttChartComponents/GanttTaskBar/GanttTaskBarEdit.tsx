import { Box, Chip, Typography, useTheme } from '@mui/material';
import {
  EventChange,
  GANTT_CHART_CELL_SIZE,
  GANTT_CHART_GAP_SIZE,
  GanttTaskData,
  GanttWorkPackageTextColorPipe,
  GanttWorkPackageStageColorPipe
} from '../../../../utils/gantt.utils';
import { addDays, differenceInDays } from 'date-fns';
import { DragEvent, MouseEvent, useEffect, useState } from 'react';
import useId from '@mui/material/utils/useId';
import useMeasure from 'react-use-measure';
import AddWorkPackageModal from '../../AddWorkPackageModal';
import { WbsElementStatus } from 'shared';

const GanttTaskBarEdit = ({
  days,
  event,
  createChange,
  getStartCol,
  getEndCol,
  isProject,
  addWorkPackage
}: {
  days: Date[];
  event: GanttTaskData;
  createChange: (change: EventChange) => void;
  getStartCol: (event: GanttTaskData) => number;
  getEndCol: (event: GanttTaskData) => number;
  isProject: boolean;
  addWorkPackage: (task: GanttTaskData) => void;
}) => {
  const theme = useTheme();
  const id = useId() || 'id'; // id for creating event changes
  const [startX, setStartX] = useState<number | null>(null);
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [initialWidth, setInitialWidth] = useState(0); // original width of the component, should not change on resize
  const [width, setWidth] = useState(0); // current width of component, will change on resize
  const [measureRef, bounds] = useMeasure();

  const lengthInDays = differenceInDays(event.end, event.start);

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
      const newEventLengthInDays = roundToMultipleOf7(Math.round((lengthInDays / initialWidth) * width));
      const newEndDate = addDays(event.start, newEventLengthInDays);
      createChange({ id, eventId: event.id, type: 'change-end-date', originalEnd: event.end, newEnd: newEndDate });
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
    const days = roundToMultipleOf7(differenceInDays(day, event.start));
    createChange({ id, eventId: event.id, type: 'shift-by-days', days });
  };

  useEffect(() => {
    if (bounds.width !== 0 && width === 0) {
      setInitialWidth(bounds.width);
      setWidth(bounds.width);
    }
  }, [bounds, width]);

  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);

  return (
    <div
      style={{ position: 'relative', width: '100%', marginTop: 10 }}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <AddWorkPackageModal
        showModal={showAddWorkPackageModal}
        handleClose={() => setShowAddWorkPackageModal(false)}
        addWorkPackage={(workPackage) => {
          const dup = id + event.workPackages.length + 1;
          addWorkPackage({
            id: dup,
            name: workPackage.name,
            start: new Date(),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            type: 'task',
            workPackages: [],
            projectId: event.id,
            projectNumber: event.projectNumber,
            carNumber: event.carNumber,
            styles: {
              color: GanttWorkPackageTextColorPipe(workPackage.stage),
              backgroundColor: GanttWorkPackageStageColorPipe(workPackage.stage, WbsElementStatus.Inactive)
            }
          });

          createChange({
            id,
            eventId: dup,
            type: 'create-work-package',
            name: workPackage.name,
            stage: workPackage.stage,
            start: new Date(),
            end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
          });
        }}
      />
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
            gridColumnStart: getStartCol(event),
            gridColumnEnd: getEndCol(event),
            height: '2rem',
            width: width === 0 ? `unset` : `${width}px`,
            border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
            borderRadius: '0.25rem',
            backgroundColor: event.styles ? event.styles.backgroundColor : theme.palette.background.paper,
            cursor: isProject ? 'default' : 'move'
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
              draggable={!isProject}
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
                    color: event.styles ? event.styles.color : '#ffffff',
                    px: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {event.name}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                cursor: isProject ? 'default' : 'ew-resize',
                height: '100%',
                width: '5rem',
                position: 'relative',
                right: '-10'
              }}
              onMouseDown={isProject ? undefined : handleMouseDown}
            />
          </Box>
        </div>
        {isProject && (
          <Chip
            label={'+'}
            onClick={() => {
              setShowAddWorkPackageModal(true);
            }}
          />
        )}
      </Box>
    </div>
  );
};

export default GanttTaskBarEdit;
