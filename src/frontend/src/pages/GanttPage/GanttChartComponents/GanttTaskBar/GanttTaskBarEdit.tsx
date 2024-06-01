import { Box, Chip, Typography, useTheme } from '@mui/material';
import {
  GANTT_CHART_CELL_SIZE,
  GANTT_CHART_GAP_SIZE,
  transformWorkPackageToGanttTask,
  GanttTask,
  GanttChange,
  transformGanttTaskToWorkPackage
} from '../../../../utils/gantt.utils';
import { addDays, differenceInDays } from 'date-fns';
import { DragEvent, MouseEvent, useEffect, useState } from 'react';
import useId from '@mui/material/utils/useId';
import useMeasure from 'react-use-measure';
import AddWorkPackageModal from '../AddWorkPackageModal';
import { WbsElementStatus, wbsPipe, WorkPackage } from 'shared';
import GanttTaskBarBlockedEdit from './GanttTaskBarBlockedEditView';

const GanttTaskBarEdit = ({
  days,
  task,
  createChange,
  getStartCol,
  getEndCol,
  isProject,
  addWorkPackage,
  getNewWorkPackageNumber
}: {
  days: Date[];
  task: GanttTask;
  createChange: (change: GanttChange) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  isProject: boolean;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
}) => {
  const theme = useTheme();
  const id = useId() || 'id'; // id for creating event changes
  const [startX, setStartX] = useState<number | null>(null);
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const widthPerDay = 7.2; //width per day to use for resizing calculations, kind of arbitrary,
  const [width, setWidth] = useState(0); // current width of component, will change on resize
  const [measureRef, bounds] = useMeasure();

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

  useEffect(() => {
    if (isProject) {
      setWidth(0);
    }
    if (bounds.width !== 0 && width === 0) {
      setWidth(bounds.width);
    }
  }, [bounds, task.end, task.start, width, isProject]);

  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);

  return (
    <>
      <div
        style={{ position: 'relative', width: '100%', marginTop: 10 }}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <AddWorkPackageModal
          showModal={showAddWorkPackageModal}
          handleClose={() => setShowAddWorkPackageModal(false)}
          addWorkPackage={(workPackageInfo) => {
            const dup = id + task.unblockedWorkPackages.length + 1;
            const newWorkPackageNumber = getNewWorkPackageNumber(task.projectId ?? '');
            const workPackage = {
              id: dup,
              name: workPackageInfo.name,
              startDate: new Date(),
              endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
              blockedBy: [],
              wbsNum: {
                carNumber: task.carNumber,
                projectNumber: task.projectNumber,
                workPackageNumber: newWorkPackageNumber
              },
              stage: workPackageInfo.stage,
              projectName: task.name,
              status: WbsElementStatus.Inactive,
              orderInProject: newWorkPackageNumber,
              duration: 1,
              immediatelyBlocking: [],
              descriptionBullets: [],
              links: [],
              wbsElementId: '-1',
              dateCreated: new Date(),
              lead: undefined,
              manager: undefined,
              changes: [],
              materials: [],
              assemblies: []
            };
            addWorkPackage(workPackage);

            createChange({
              id,
              type: 'create-work-package',
              element: workPackage
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
              gridColumnStart: getStartCol(task.start),
              gridColumnEnd: getEndCol(task.end),
              height: '2rem',
              width: width === 0 ? `unset` : `${width}px`,
              border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
              borderRadius: '0.25rem',
              backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
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
      {task.unblockedWorkPackages.map((workPackage) => {
        return (
          <GanttTaskBarEdit
            key={workPackage.id}
            days={days}
            task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.totalWorkPackages)}
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
        const workPackage = task.totalWorkPackages.find((wp) => wbsPipe(wp.wbsNum) === wbsPipe(wbsNum));
        if (!workPackage) return <></>;

        return (
          <GanttTaskBarBlockedEdit
            key={wbsPipe(wbsNum)}
            days={days}
            task={transformWorkPackageToGanttTask(workPackage, task.teamName, task.totalWorkPackages)}
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

export default GanttTaskBarEdit;
