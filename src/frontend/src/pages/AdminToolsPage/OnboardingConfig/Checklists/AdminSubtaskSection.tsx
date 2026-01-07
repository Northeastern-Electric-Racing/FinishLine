import { Typography, useTheme, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { Checklist, ChecklistPreview, ChecklistItemType } from 'shared';
import { GridDragIcon } from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateSubtaskModal from './CreateSubtaskModal';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import NERDeleteModal from '../../../../components/NERDeleteModal';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteChecklist, useReorderChecklistItems } from '../../../../hooks/onboarding.hook';
import EditSubtaskModal from './EditSubtaskModal';
import NERMarkdown from '../../../../components/NERMarkdown';
import CreateInfoBlockModal from './CreateInfoBlockModal';
import EditInfoBlockModal from './EditInfoBlockModal';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';

interface AdminSubtaskSectionProps {
  parentTask: Checklist;
}

const AdminSubtaskSection: React.FC<AdminSubtaskSectionProps> = ({ parentTask }) => {
  const theme = useTheme();
  const toast = useToast();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showCreateInfoModal, setShowCreateInfoModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ChecklistPreview & { descriptions?: string[], itemType?: ChecklistItemType } | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ChecklistPreview | null>(null);
  const [infoToEdit, setInfoToEdit] = useState<ChecklistPreview & { descriptions?: string[] } | null>(null);

  const { mutateAsync: deleteChecklist } = useDeleteChecklist();
  const { mutate: reorderItems } = useReorderChecklistItems(parentTask.checklistId);

  const handleDelete = async (itemId: string) => {
    try {
      await deleteChecklist(itemId);
      toast.success('Item deleted successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setItemToDelete(null);
  };

  const { subtasks } = parentTask;

  // All items (tasks and info blocks) are now stored in subtasks with itemType field
  const allItems = subtasks
    .map((subtask) => ({
      ...subtask,
      itemType: subtask.itemType ?? ('TASK' as ChecklistItemType),
      displayOrder: subtask.displayOrder ?? 999
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [localItems, setLocalItems] = useState(allItems);

  // Update local items when allItems changes
  useState(() => {
    setLocalItems(allItems);
  });

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.index === source.index) {
      return;
    }

    // Reorder locally
    const newItems = Array.from(localItems);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    
    setLocalItems(newItems);

    // Send to backend - all items are now real checklist items
    const itemIds = newItems.map((item) => item.checklistId);
    reorderItems({ itemIds }, {
      onError: (error: any) => {
        toast.error(error.message || 'Failed to reorder items');
        setLocalItems(allItems); // Revert on error
      }
    });
  };

  return (
    <Box sx={{ px: 5 }}>
      {localItems.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={parentTask.checklistId}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {localItems.map((item, index) => (
                    <Draggable key={item.checklistId} draggableId={item.checklistId} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: item.itemType === 'TASK' ? 'center' : 'flex-start',
                              justifyContent: 'space-between',
                              borderRadius: 3,
                              mb: 2,
                              backgroundColor: item.itemType === 'INFO' ? theme.palette.background.paper : 'transparent',
                              padding: item.itemType === 'INFO' ? 2 : 0
                            }}
                          >
                            {item.itemType === 'TASK' ? (
                              <>
                                <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1 }}>
                                  <Box {...provided.dragHandleProps}>
                                    <IconButton>
                                      <GridDragIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                  </Box>
                                  <Typography color="black" fontWeight="bold">
                                    {item.name} {item.isOptional && '(Optional)'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex' }}>
                                  <IconButton onClick={() => setItemToDelete(item)}>
                                    <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
                                  </IconButton>
                                  <IconButton onClick={() => setTaskToEdit(item)}>
                                    <EditIcon sx={{ color: 'black' }} />
                                  </IconButton>
                                </Box>
                              </>
                            ) : (
                              <>
                                <Box display="flex" alignItems="flex-start" gap={1} sx={{ width: '100%' }}>
                                  <Box {...provided.dragHandleProps} sx={{ mt: 0.5 }}>
                                    <IconButton>
                                      <GridDragIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <NERMarkdown markdown={(item as any).descriptions?.[0] || item.name} />
                                  </Box>
                                  <Box sx={{ display: 'flex' }}>
                                    <IconButton onClick={() => setItemToDelete(item)}>
                                      <RemoveCircleOutlineIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                    <IconButton onClick={() => setInfoToEdit({ ...item, descriptions: (item as any).descriptions || [item.name] })}>
                                      <EditIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </>
                            )}
                          </Box>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      )}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', mb: -1 }}>
        <IconButton sx={{ color: 'red' }} onClick={() => setShowCreateTaskModal(true)}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          <Typography>Add Subtask</Typography>
        </IconButton>
        <IconButton sx={{ color: 'red' }} onClick={() => setShowCreateInfoModal(true)}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          <Typography>Add Information</Typography>
        </IconButton>
      </Box>
      {showCreateTaskModal && (
        <CreateSubtaskModal
          open={showCreateTaskModal}
          handleClose={() => setShowCreateTaskModal(false)}
          parentChecklist={parentTask}
        />
      )}
      {showCreateInfoModal && (
        <CreateInfoBlockModal
          open={showCreateInfoModal}
          handleClose={() => setShowCreateInfoModal(false)}
          parentChecklist={parentTask}
        />
      )}
      {itemToDelete && (
        <NERDeleteModal
          open={!!itemToDelete}
          onHide={() => setItemToDelete(null)}
          formId="delete-item-form"
          dataType={itemToDelete.itemType === 'INFO' ? 'Information Block' : 'Task'}
          onFormSubmit={() => handleDelete(itemToDelete.checklistId)}
        />
      )}
      {taskToEdit && (
        <EditSubtaskModal
          open={!!taskToEdit}
          handleClose={() => setTaskToEdit(null)}
          parentChecklist={parentTask}
          defaultValues={taskToEdit}
        />
      )}
      {infoToEdit && (
        <EditInfoBlockModal
          open={!!infoToEdit}
          handleClose={() => setInfoToEdit(null)}
          parentChecklist={parentTask}
          defaultValues={infoToEdit}
        />
      )}
    </Box>
  );
};

export default AdminSubtaskSection;
