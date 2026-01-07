import { Typography, useTheme, IconButton } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { Box } from '@mui/system';
import React from 'react';
import { Checklist, ChecklistItemType } from 'shared';
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
    toggleChecklist({ checklistId: subtaskId }, {
      onError: (error: any) => {
        toast.error(error.message);
      }
    });
  };

  // All items (tasks and info blocks) are now stored in subtasks with itemType field
  // Keep descriptions for backward compatibility with old data
  const allItems = [
    ...subtasks.map((subtask) => ({
      ...subtask,
      itemType: subtask.itemType ?? 'TASK',
      displayOrder: subtask.displayOrder ?? 999
    })),
    // Backward compatibility: show old descriptions only if they exist and aren't already in subtasks as info blocks
    ...(parentTask.descriptions && parentTask.descriptions.length > 0 
      ? parentTask.descriptions.map((description, index) => ({
          checklistId: `info-${index}`,
          name: description,
          itemType: 'INFO' as const,
          displayOrder: 1000 + index,
          isOptional: false
        }))
      : [])
  ].sort((a, b) => a.displayOrder - b.displayOrder);

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
          if (item.itemType === 'TASK') {
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
                  {item.name} {item.isOptional && '(Optional)'}
                </Typography>
              </Box>
            );
          } else {
            // INFO block - content is in descriptions[0] for new items, or name for backward compatibility
            const content = (item as any).descriptions?.[0] || item.name;
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
                <NERMarkdown markdown={content} />
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
};

export default SubtaskSection;
