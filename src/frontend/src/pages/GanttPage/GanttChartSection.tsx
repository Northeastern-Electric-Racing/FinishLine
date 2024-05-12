/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { eachDayOfInterval, isMonday } from 'date-fns';
import { applyChangesToEvents, EventChange, GanttTaskData } from '../../utils/gantt.utils';
import { Box, Typography, Collapse } from '@mui/material';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar';
import { useEffect, useState } from 'react';

interface GanttChartSectionProps {
  start: Date;
  end: Date;
  tasks: GanttTaskData[];
  isEditMode: boolean;
  saveChanges: (eventChanges: EventChange[]) => void;
  showWorkPackagesMap: Map<string, boolean>;
  setShowWorkPackagesMap: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
}

const GanttChartSection = ({
  start,
  end,
  tasks,
  isEditMode,
  saveChanges,
  showWorkPackagesMap,
  setShowWorkPackagesMap
}: GanttChartSectionProps) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);

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

  const toggleWorkPackages = (projectTask: GanttTaskData) => {
    setShowWorkPackagesMap((prev) => new Map(prev.set(projectTask.id, !prev.get(projectTask.id))));
  };

  return tasks.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      {/* Data display: reset list of events every time eventChanges list changes using key */}
      <Box sx={{ mt: '1rem', width: 'fit-content' }} key={eventChanges.length}>
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
