/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { eachDayOfInterval, isMonday } from 'date-fns';
import { useEffect, useState } from 'react';
import { applyChangesToEvents, EventChange, GanttTaskData } from '../../utils/gantt.utils';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';

interface GanttChartSectionProps {
  start: Date;
  end: Date;
  tasks: GanttTaskData[];
  isEditMode: boolean;
  saveChanges: (eventChanges: EventChange[]) => void;
  onExpanderClick: (ganttTasks: GanttTaskData) => void;
}

const GanttChartSection = ({ start, end, tasks, isEditMode, saveChanges, onExpanderClick }: GanttChartSectionProps) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const [showWorkPackagesList, setShowWorkPackagesList] = useState<{ [key: string]: boolean }>({});
  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };

  useEffect(() => {
    // only try to save changes when we're going from non-editing to editing mode
    if (!isEditMode) {
      saveChanges(eventChanges);
      setEventChanges([]); // reset the changes after sending them
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  const displayEvents = applyChangesToEvents(tasks, eventChanges);
  const projects = displayEvents.filter((event) => !event.project);

  const toggleWorkPackages = (projectId: string) => {
    setShowWorkPackagesList((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId]
    }));
  };

  return tasks.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      {/* Data display: reset list of events every time eventChanges list changes using key */}
      <Box sx={{ mt: '1rem', width: 'fit-content' }} key={eventChanges.length}>
        {projects.map((project, index) => {
          return (
            <>
              <Box display="flex" alignItems="flex-start">
                <Box position="fixed" zIndex="2">
                  <IconButton onClick={() => toggleWorkPackages(project.id)}>
                    {showWorkPackagesList[project.id] ? <ExpandMore fontSize="large" /> : <ChevronRight fontSize="large" />}
                  </IconButton>
                </Box>
                <GanttTaskBar
                  key={project.id}
                  days={days}
                  event={project}
                  isEditMode={isEditMode}
                  createChange={createChange}
                />
              </Box>
              <Collapse in={showWorkPackagesList[project.id]}>
                {project.children.map((workPackage) => {
                  return (
                    <GanttTaskBar
                      key={workPackage.id}
                      days={days}
                      event={workPackage}
                      isEditMode={isEditMode}
                      createChange={createChange}
                    />
                  );
                })}
              </Collapse>
            </>
          );
        })}
      </Box>
    </Box>
  ) : (
    <Typography sx={{ mx: 1 }}>No items to display</Typography>
  );
};

export default GanttChartSection;
