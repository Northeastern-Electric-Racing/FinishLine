/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { eachDayOfInterval, isMonday } from 'date-fns';
import { GanttChange, GanttTaskData, RequestEventChange, transformProjectToGanttTask } from '../../utils/gantt.utils';
import { Box, Typography } from '@mui/material';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import { useState } from 'react';
import GanttToolTip from './GanttChartComponents/GanttToolTip';
import { ProjectPreview, wbsPipe, WorkPackage } from 'shared';

interface GanttChartSectionProps {
  start: Date;
  end: Date;
  projects: ProjectPreview[];
  isEditMode: boolean;
  createChange: (change: GanttChange) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  highlightedChange?: RequestEventChange;
  addWorkPackage: (task: WorkPackage) => void;
  teamName: string;
  getNewWorkPackageNumber: (projectId: string) => number;
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
  addWorkPackage,
  teamName,
  getNewWorkPackageNumber
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

  const handleCreateProjectChange = (change: GanttChange) => {
    createChange(change);
    setCurrentTask(undefined);
  };

  const handleOnMouseLeave = () => {
    setCurrentTask(undefined);
  };

  const toggleWorkPackages = (projectTask: ProjectPreview) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(projectTask.id, !prev.get(projectTask.id))));
  };

  return projects.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      <Box sx={{ mt: '1rem', width: 'fit-content' }}>
        {projects.map((project) => {
          return (
            <Box display="flex" alignItems="center">
              <GanttTaskBar
                key={project.id}
                days={days}
                task={transformProjectToGanttTask(project, teamName)}
                isEditMode={isEditMode}
                createChange={handleCreateProjectChange}
                handleOnMouseOver={handleOnMouseOver}
                handleOnMouseLeave={handleOnMouseLeave}
                onWorkPackageToggle={() => toggleWorkPackages(project)}
                showWorkPackages={showWorkPackagesMap.get(project.id)}
                addWorkPackage={addWorkPackage}
                getNewWorkPackageNumber={getNewWorkPackageNumber}
                highlightedChange={
                  highlightedChange && wbsPipe(project.wbsNum) === wbsPipe(highlightedChange.element.wbsNum)
                    ? highlightedChange
                    : undefined
                }
              />
            </Box>
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
    <Typography sx={{ marginTop: 5 }}>No Projects to Display</Typography>
  );
};

export default GanttChartSection;
