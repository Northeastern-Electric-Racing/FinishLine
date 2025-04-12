import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import {
  GanttChange,
  GanttCollection,
  GanttTask,
  HighlightTaskComparator,
  RequestEventChange
} from '../../../utils/gantt.utils';
import { useState } from 'react';

interface GanttChartCollectionSectionProps<E, T> {
  startDate: Date;
  endDate: Date;
  onCancelChanges: () => void;
  onEditPressed: () => void;
  onNewTaskPressed: () => void;
  onNewSubTaskPressed: (parentTask: GanttTask<T>) => void;
  createTaskTitle: string;
  onSavePressed: () => void;
  onCreateChange: (change: GanttChange<T>) => void;
  highlightedChange: RequestEventChange<T>;
  shouldShowChildren: (task: GanttTask<T>) => boolean;
  onShowChildrenToggle: (task: GanttTask<T>) => void;
  collection: GanttCollection<E, T>;
  allowEdit: boolean;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttChartCollectionSection = <E, T>({
  startDate,
  endDate,
  onCancelChanges,
  onEditPressed,
  collection,
  onNewSubTaskPressed,
  onNewTaskPressed,
  createTaskTitle,
  onSavePressed,
  onCreateChange,
  highlightedChange,
  shouldShowChildren,
  onShowChildrenToggle,
  allowEdit,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttChartCollectionSectionProps<E, T>) => {
  const theme = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);

  const collectionSectionBackgroundStyle = {
    mt: 1,
    py: 1,
    background: isEditMode ? theme.palette.divider : 'transparent',
    borderRadius: '0.25rem',
    width: 'fit-content'
  };

  const collectionDescriptionContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: '-15px',
    pl: 2,
    position: 'sticky',
    left: 0,
    width: 'fit-content',
    height: '30px'
  };

  const handleSave = () => {
    onSavePressed();
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    onCancelChanges();
  };

  const handleEdit = () => {
    onEditPressed();

    setIsEditMode(true);
  };

  // Sorting the work packages of each project based on their start date
  collection.tasks.forEach((task) => {
    task.children.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  });

  return (
    <Box sx={collectionSectionBackgroundStyle}>
      <Box sx={collectionDescriptionContainerStyle}>
        <Typography variant="h6" fontWeight={400}>
          {collection.title}
        </Typography>
        {allowEdit && (
          <>
            {isEditMode ? (
              <Box display={'flex'} alignItems="center">
                <Chip label="Save" onClick={handleSave} sx={{ marginRight: '10px' }} />
                <Chip label="Cancel" onClick={handleCancel} sx={{ marginRight: '10px' }} />
                <Chip label={createTaskTitle} onClick={onNewTaskPressed} />
              </Box>
            ) : (
              <IconButton onClick={handleEdit}>
                <Edit />
              </IconButton>
            )}
          </>
        )}
      </Box>
      <Box key={collection.id} sx={{ my: 0, width: 'fit-content', pl: 2 }}>
        <GanttChartSection
          start={startDate}
          end={endDate}
          isEditMode={isEditMode}
          createChange={onCreateChange}
          highlightedChange={highlightedChange}
          tasks={collection.tasks}
          shouldShowChildren={shouldShowChildren}
          onAddTaskPressed={onNewSubTaskPressed}
          onShowChildrenToggle={onShowChildrenToggle}
          highlightSubtaskComparator={highlightSubtaskComparator}
          highlightTaskComparator={highlightTaskComparator}
        />
      </Box>
    </Box>
  );
};

export default GanttChartCollectionSection;
