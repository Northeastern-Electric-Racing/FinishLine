import { Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, useTheme } from '@mui/material';
import GanttChartSection from './GanttChartSection';
import { GanttCollection } from '../../../utils/gantt.utils';
import { useState } from 'react';
import { GanttEditability } from './GanttChart';

interface GanttChartCollectionSectionProps<E, T> {
  startDate: Date;
  endDate: Date;
  collection: GanttCollection<E, T>;
  editability?: GanttEditability<E, T>;
}

const GanttChartCollectionSection = <E, T>({
  startDate,
  endDate,
  collection,
  editability
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
    editability?.onSavePressed();
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    editability?.onCancelChanges(collection);
  };

  const handleEdit = () => {
    editability?.onEditPressed(collection);
    setIsEditMode(true);
  };

  collection.tasks.forEach((task) => {
    task.children.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  });

  const ignore = () => {};
  const ignoreBool = () => false;

  return (
    <Box sx={collectionSectionBackgroundStyle}>
      <Box sx={collectionDescriptionContainerStyle}>
        <Typography variant="h6" fontWeight={400}>
          {collection.title}
        </Typography>
        {editability && (
          <>
            {isEditMode ? (
              <Box display={'flex'} alignItems="center">
                <Chip label="Save" onClick={handleSave} sx={{ marginRight: '10px' }} />
                <Chip label="Cancel" onClick={handleCancel} sx={{ marginRight: '10px' }} />
                <Chip label={editability.createTaskTitle} onClick={() => editability.onNewTaskPressed(collection)} />
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
          createChange={editability?.onCreateChange ?? ignore}
          highlightedChange={editability?.highlightedChange}
          tasks={collection.tasks}
          onAddTaskPressed={editability?.onNewSubTaskPressed ?? ignore}
          highlightSubtaskComparator={editability?.highlightSubtaskComparator ?? ignoreBool}
          highlightTaskComparator={editability?.highlightTaskComparator ?? ignoreBool}
        />
      </Box>
    </Box>
  );
};

export default GanttChartCollectionSection;
