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
import { validateWBS } from 'shared';

interface GanttChartSectionProps {
  start: Date;
  end: Date;
  projects: GanttTaskData[];
  isEditMode: boolean;
  createChange: (change: EventChange) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  highlightedChange?: RequestEventChange;
  addWorkPackage: (task: GanttTaskData) => void;
}

const GanttChartSection = ({
  start,
  end,
  projects,
  isEditMode,
  createChange,
  showWorkPackagesMap,
  setShowWorkPackagesMap,
  highlightedChange,
  addWorkPackage
}: GanttChartSectionProps) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [currentTask, setCurrentTask] = useState<GanttTaskData | undefined>(undefined);
  const [cursorY, setCursorY] = useState<number>(0);

  const handleOnMouseOver = (e: React.MouseEvent, event: GanttTaskData) => {
    if (!isEditMode) {
      setCurrentTask(event);
      setCursorY(e.clientY);
    }
  };

  const handleCreateProjectChange = (change: EventChange) => {
    createChange(change);
    setCurrentTask(undefined);
  };

  const handleOnMouseLeave = () => {
    setCurrentTask(undefined);
  };

  const toggleWorkPackages = (projectTask: GanttTaskData) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(projectTask.id, !prev.get(projectTask.id))));
  };

  if (highlightedChange && highlightedChange.createProject) {
    if (highlightedChange.createProject) {
      //TODO: add new project as highlighted change
      //console.log('New Project: ');
      //console.log(highlightedChange);
    } else {
      try {
        validateWBS(highlightedChange.eventId);
        //do nothing this case is already handled
      } catch {
        //console.log('New Work Package: ');
        //console.log(highlightedChange);
        //TODO: add new work package as highlighted change
      }
    }
  }

  return projects.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      <Box sx={{ mt: '1rem', width: 'fit-content' }}>
        {projects.map((project) => {
          return (
            <>
              <Box display="flex" alignItems="center">
                <GanttTaskBar
                  key={project.id}
                  days={days}
                  event={project}
                  isEditMode={isEditMode}
                  createChange={handleCreateProjectChange}
                  handleOnMouseOver={handleOnMouseOver}
                  handleOnMouseLeave={handleOnMouseLeave}
                  onWorkPackageToggle={() => toggleWorkPackages(project)}
                  showWorkPackages={showWorkPackagesMap.get(project.id)}
                  addWorkPackage={addWorkPackage}
                />
              </Box>
              <Collapse in={showWorkPackagesMap.get(project.id)}>
                {project.workPackages.map((workPackage) => {
                  return (
                    <GanttTaskBar
                      key={workPackage.id}
                      days={days}
                      event={workPackage}
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
          yCoordinate={cursorY}
          title={!currentTask.projectId ? currentTask.name.substring(8) : currentTask.name.substring(6)}
          startDate={currentTask.start}
          endDate={currentTask.end}
          color={currentTask.styles?.backgroundColor}
          lead={currentTask.lead}
          manager={currentTask.manager}
        />
      )}
    </Box>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChartSection;
