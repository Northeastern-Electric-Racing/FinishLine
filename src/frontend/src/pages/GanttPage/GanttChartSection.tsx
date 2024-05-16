/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { eachDayOfInterval, isMonday } from 'date-fns';
import { EventChange, GanttTaskData, RequestEventChange } from '../../utils/gantt.utils';
import { Box, Typography, Collapse } from '@mui/material';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import { useState } from 'react';
import GanttToolTip from './GanttChartComponents/GanttToolTip';

interface GanttChartSectionProps {
  start: Date;
  end: Date;
  displayEvents: GanttTaskData[];
  isEditMode: boolean;
  createChange: (change: EventChange) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  highlightedChange?: RequestEventChange;
}

const GanttChartSection = ({
  start,
  end,
  displayEvents,
  isEditMode,
  createChange,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  highlightedChange
}: GanttChartSectionProps) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const projects = displayEvents.filter((event) => !event.project);
  const [currentTask, setCurrentTask] = useState<GanttTaskData | undefined>(undefined);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const handleOnMouseOver = (e: React.MouseEvent, event: GanttTaskData) => {
    if (!isEditMode) {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
      setCurrentTask(event);
    }
  };

  const handleOnMouseLeave = () => {
    setCurrentTask(undefined);
  };

  const toggleWorkPackages = (projectTask: GanttTaskData) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(projectTask.id, !prev.get(projectTask.id))));
  };

  return displayEvents.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      <Box sx={{ mt: '1rem', width: 'fit-content' }}>
        {projects.map((project) => {
          return (
            <>
              <Box display="flex" alignItems="flex-start">
                <GanttTaskBar
                  key={project.id}
                  days={days}
                  event={project}
                  isEditMode={isEditMode}
                  createChange={createChange}
                  handleOnMouseOver={handleOnMouseOver}
                  handleOnMouseLeave={handleOnMouseLeave}
                  onWorkPackageToggle={() => toggleWorkPackages(project)}
                  showWorkPackages={showWorkPackagesMap.get(project.id)}
                />
              </Box>
              <Collapse in={showWorkPackagesMap.get(project.id)}>
                {project.children.map((workPackage) => {
                  const displayWorkPackage = displayEvents.find((event) => event.id === workPackage.id);
                  return (
                    <GanttTaskBar
                      key={workPackage.id}
                      days={days}
                      event={displayWorkPackage!}
                      isEditMode={isEditMode}
                      createChange={createChange}
                      handleOnMouseOver={handleOnMouseOver}
                      handleOnMouseLeave={handleOnMouseLeave}
                      highlightedChange={
                        highlightedChange && workPackage.id === highlightedChange.eventId ? highlightedChange : undefined
                      }
                    />
                  );
                })}
              </Collapse>
            </>
          );
        })}
      </Box>
      {currentTask && (
        <GanttToolTip
          xCoordinate={cursorX}
          yCoordinate={cursorY}
          title={!currentTask.project ? currentTask.name.substring(8) : currentTask.name.substring(6)}
          startDate={currentTask.start}
          endDate={currentTask.end}
          color={currentTask.styles?.backgroundColor}
          projectLead={currentTask.projectLead}
          projectManager={currentTask.projectManager}
        />
      )}
    </Box>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChartSection;
