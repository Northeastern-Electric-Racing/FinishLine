import { Box, Chip, Typography } from '@mui/material';
import useId from '@mui/material/utils/useId';
import { useTheme } from '@mui/system';
import { CSSProperties, DragEvent, MouseEvent, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { addDaysToDate, WbsElementStatus, wbsPipe, WorkPackage, WorkPackageStage } from 'shared';
import {
  GanttChange,
  GanttTask,
  GANTT_CHART_CELL_SIZE,
  transformGanttTaskToWorkPackage
} from '../../../../utils/gantt.utils';
import AddGanttWorkPackageModal from '../AddGanttWorkPackageModal';
import { differenceInDays } from 'date-fns';
import {
  ganttTaskBarBackgroundStyles,
  ganttTaskBarContainerStyles,
  taskNameContainerStyles,
  webKitBoxContainerStyles,
  webKitBoxStyles
} from './GanttTaskBarDisplayStyles';
import { ArcherElement } from 'react-archer';

interface GanttTaskBarEditProps {
  days: Date[];
  task: GanttTask;
  isProject: boolean;
  createChange: (change: GanttChange) => void;
  getNewWorkPackageNumber: (projectId: string) => number;
  addWorkPackage: (workPackage: WorkPackage) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
}

export const GanttTaskBarEditView = ({
  days,
  task,
  isProject,
  createChange,
  getNewWorkPackageNumber,
  addWorkPackage,
  getStartCol,
  getEndCol
}: GanttTaskBarEditProps) => {
  const theme = useTheme();
  const [showAddWorkPackageModal, setShowAddWorkPackageModal] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [showDropPoints, setShowDropPoints] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(0); // current width of component, will change on resize
  const [measureRef, bounds] = useMeasure();
  const widthPerDay = 7.2; //width per day to use for resizing calculations, kind of arbitrary,
  const id = useId() || 'id'; // id for creating event changes

  const taskBarDisplayStyles: CSSProperties = {
    gridColumnStart: getStartCol(task.start),
    gridColumnEnd: getEndCol(task.end),
    height: '2rem',
    width: isProject ? 'unset' : width === 0 ? `unset` : `${width}px`,
    border: `1px solid ${isResizing ? theme.palette.text.primary : theme.palette.divider}`,
    borderRadius: '0.25rem',
    backgroundColor: task.styles ? task.styles.backgroundColor : theme.palette.background.paper,
    cursor: isProject ? 'default' : 'move'
  };

  const dropPointCellStyles: CSSProperties = {
    borderRadius: '0.25rem',
    height: '2rem',
    minWidth: GANTT_CHART_CELL_SIZE,
    maxWidth: GANTT_CHART_CELL_SIZE,
    backgroundColor: `color-mix(in srgb, ${theme.palette.background.default}, transparent 75%);`
  };

  const hoverContainerBoxStyles: CSSProperties = {
    cursor: isProject ? 'default' : 'ew-resize',
    height: '100%',
    width: '5rem',
    position: 'relative',
    right: '-10'
  };

  useEffect(() => {
    if (bounds.width !== 0 && width === 0) {
      setWidth(bounds.width);
    }
  }, [bounds, width]);

  const handleAddWorkPackageInfo = (workPackageInfo: { name: string; stage?: WorkPackageStage }) => {
    const dup = id + task.unblockedWorkPackages.length + 1;
    const newWorkPackageNumber = getNewWorkPackageNumber(task.projectId ?? '');
    const workPackage: WorkPackage = {
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
      blocking: [],
      descriptionBullets: [],
      links: [],
      wbsElementId: '-1',
      dateCreated: new Date(),
      lead: undefined,
      manager: undefined,
      teamTypes: [],
      changes: [],
      materials: [],
      assemblies: [],
      designReviews: [],
      deleted: false
    };
    addWorkPackage(workPackage);

    createChange({
      id,
      type: 'create-work-package',
      element: workPackage
    });
  };

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
      const newEndDate = addDaysToDate(task.start, newEventLengthInDays);
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

  const AddWorkPackageModal = () => {
    return (
      <AddGanttWorkPackageModal
        showModal={showAddWorkPackageModal}
        handleClose={() => setShowAddWorkPackageModal(false)}
        addWorkPackage={handleAddWorkPackageInfo}
      />
    );
  };

  return (
    <div style={ganttTaskBarContainerStyles()} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <AddWorkPackageModal />
      <Box
        sx={{
          ...ganttTaskBarBackgroundStyles(days.length),
          position: 'absolute', // These will make it so that the bar stays on top of the drop points, i kind of like it going to a new line though
          top: 0,
          left: 0
        }}
      >
        {/* Drop areas */}
        {showDropPoints &&
          days.map((day, index) => (
            <Box key={index} onDragOver={onDragOver} onDrop={() => onDrop(day)} sx={dropPointCellStyles} />
          ))}
      </Box>
      <Box sx={ganttTaskBarBackgroundStyles(days.length)}>
        <ArcherElement
          id={task.teamName + wbsPipe(task)}
          relations={task.blocking.map((blocking) => {
            return {
              targetId: task.teamName + wbsPipe(blocking),
              targetAnchor: 'left',
              sourceAnchor: 'right',
              style: { strokeDasharray: '5,5', noCurves: true, endMarker: false }
            };
          })}
        >
          <div ref={measureRef} style={taskBarDisplayStyles}>
            <Box sx={webKitBoxContainerStyles()}>
              <Box draggable={!isProject} onDrag={onDragStart} onDragEnd={onDragEnd} sx={webKitBoxStyles()}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Typography variant="body1" sx={taskNameContainerStyles(task)}>
                    {task.name}
                  </Typography>
                </Box>
              </Box>

              <Box sx={hoverContainerBoxStyles} onMouseDown={isProject ? undefined : handleMouseDown} />
            </Box>
          </div>
        </ArcherElement>
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
