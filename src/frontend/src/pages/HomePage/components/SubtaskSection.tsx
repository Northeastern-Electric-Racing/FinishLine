import { Typography, useTheme, IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import React from 'react';
import { Checklist } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';
import { useToggleChecklist } from '../../../hooks/onboarding.hook';
import { useToast } from '../../../hooks/toasts.hooks';
import { isChecklistChecked } from '../../../utils/onboarding.utils';
import NERMarkdown from '../../../components/NERMarkdown';

interface SubtaskSectionProps {
  parentTask: Checklist;
  checkedChecklists?: Checklist[];
  isAdmin?: boolean;
}

const SubtaskSection: React.FC<SubtaskSectionProps> = ({ parentTask, checkedChecklists, isAdmin = false }) => {
  const theme = useTheme();
  const toast = useToast();
  const { subtasks } = parentTask;
  const { mutate: toggleChecklist } = useToggleChecklist();

  const handleToggleChecklist = (subtaskId: string) => {
    toggleChecklist(
      { checklistId: subtaskId },
      {
        onError: (error: any) => {
          toast.error(error.message);
        }
      }
    );
  };

  // All items (tasks and info blocks) now stored in subtasks with itemType field
  const allItems = subtasks
    .map((subtask) => ({
      ...subtask,
      itemType: subtask.itemType,
      displayIndex: subtask.displayIndex ?? 999
    }))
    .sort((a, b) => a.displayIndex - b.displayIndex);

  return (
    <Box
      sx={
        isAdmin
          ? {}
          : {
              padding: 2,
              marginTop: -0.5,
              marginBottom: 3,
              borderRadius: '0px 0px 10px 10px',
              backgroundColor: '#CECECE'
            }
      }
    >
      <Box display="flex" flexDirection="column" gap={2} sx={{ width: '100%' }}>
        {allItems.map((item) => {
          if (item.itemType === "TASK") {
            return (
              <Box key={item.checklistId} display="flex" alignItems="center" gap={1}>
                {isAdmin ? (
                  <IconButton>
                    <GridDragIcon sx={{ color: 'black' }} />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleToggleChecklist(item.checklistId)}>
                    <Checkbox
                      checked={isChecklistChecked(checkedChecklists, item)}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fill: 'black',
                          backgroundColor: 'black',
                          borderRadius: 1
                        },
                        '&.Mui-checked .MuiSvgIcon-root': {
                          backgroundColor: 'white'
                        },
                        '&:hover': {
                          backgroundColor: 'transparent'
                        }
                      }}
                    />
                  </IconButton>
                )}
                <Typography color="black" fontWeight="bold">
                  {item.content} {item.isOptional && '(Optional)'}
                </Typography>
              </Box>
            );
          }
          // INFO block
          return (
            <Box
              key={item.checklistId}
              sx={{
                backgroundColor: theme.palette.background.paper,
                padding: 2,
                borderRadius: 2,
                width: '100%'
              }}
            >
              <NERMarkdown markdown={item.content} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SubtaskSection;
