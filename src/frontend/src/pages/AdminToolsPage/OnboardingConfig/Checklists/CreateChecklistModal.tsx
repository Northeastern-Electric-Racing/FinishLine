import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateChecklist } from '../../../../hooks/onboarding.hook';
import { useToast } from '../../../../hooks/toasts.hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormControl,
  FormLabel,
  TextField,
  InputAdornment,
  Checkbox,
  IconButton,
  useTheme,
  Typography
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import * as yup from 'yup';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NERMarkdown from '../../../../components/NERMarkdown';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import { GridDragIcon } from '@mui/x-data-grid';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import InfoIcon from '@mui/icons-material/Info';
import { ChecklistItemType } from 'shared';

interface CreateChecklistModalProps {
  open: boolean;
  handleClose: () => void;
  teamId?: string;
  teamTypeId?: string;
}

interface ChecklistItem {
  id: string;
  type: ChecklistItemType;
  content: string;
  isOptional?: boolean; // For tasks
}

interface ChecklistFormValues {
  content: string;
}

const schema: yup.ObjectSchema<ChecklistFormValues> = yup.object().shape({
  content: yup.string().required('Task name is required')
});

const CreateChecklistModal = ({ open, handleClose, teamId, teamTypeId }: CreateChecklistModalProps) => {
  const theme = useTheme();
  const toast = useToast();
  const { mutateAsync: createChecklist, isLoading, isError, error } = useCreateChecklist();

  const [items, setItems] = useState<ChecklistItem[]>([]);

  const defaultValues = {
    content: ''
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ChecklistFormValues>({
    resolver: yupResolver(schema),
    defaultValues
  });

  const addTask = () => {
    setItems([...items, { id: `task-${Date.now()}`, type: ChecklistItemType.TASK, content: '', isOptional: false }]);
  };

  const addInfoBlock = () => {
    setItems([...items, { id: `info-${Date.now()}`, type: ChecklistItemType.INFO, content: '' }]);
  };

  const updateItem = (index: number, updates: Partial<ChecklistItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const newItems = Array.from(items);
    const [removed] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, removed);
    setItems(newItems);
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onFormSubmit = async (data: ChecklistFormValues) => {
    try {
      const formattedData = {
        content: data.content,
        isOptional: false,
        teamId,
        teamTypeId
      };

      const parentChecklist = await createChecklist(formattedData);

      // Create all items in order with their displayIndex set
      await Promise.all(
        items.map((item) => {
          if (item.type === ChecklistItemType.TASK) {
            return createChecklist({
              content: item.content,
              teamId,
              teamTypeId,
              parentChecklistId: parentChecklist.checklistId,
              isOptional: item.isOptional || false,
              itemType: ChecklistItemType.TASK
            });
          } else if (item.type === ChecklistItemType.INFO) {
            return createChecklist({
              content: item.content,
              teamId,
              teamTypeId,
              parentChecklistId: parentChecklist.checklistId,
              isOptional: true, // INFO blocks are always optional
              itemType: ChecklistItemType.INFO
            });
          }
          throw new Error(`Unexpected checklist item type: ${String(item.type)}`);
        })
      );

      toast.success('Task created successfully');
      handleClose();
      reset();
      setItems([]);
    } catch (error) {
      toast.error('Failed to create checklist');
      console.error('Error in onFormSubmit:', error);
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={'Create Task'}
      reset={() => {
        reset({ content: '' });
        setItems([]);
      }}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={'create-task-form'}
      showCloseButton
      paperProps={{ maxWidth: '80vw' }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormControl fullWidth>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline',
              width: '39vw'
            }}
          >
            Task Name*
          </FormLabel>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Task Name"
                variant="outlined"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    '& fieldset': { border: 'none' }
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 5,
                  mt: 1,
                  width: '100%'
                }}
                error={!!errors.content}
                helperText={errors.content?.message}
              />
            )}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel
            sx={{
              color: theme.palette.error.main,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              textDecoration: 'underline',
              mb: 2
            }}
          >
            Subtasks & Information
          </FormLabel>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="items-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}>
                          {item.type === 'TASK' ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2
                              }}
                            >
                              <Box {...provided.dragHandleProps}>
                                <IconButton size="small">
                                  <GridDragIcon sx={{ color: 'black' }} />
                                </IconButton>
                              </Box>
                              <CheckBoxIcon sx={{ color: theme.palette.text.secondary }} />
                              <TextField
                                value={item.content || ''}
                                onChange={(e) => updateItem(index, { content: e.target.value })}
                                placeholder="Subtask Name"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <FormLabel sx={{ mr: 1, fontSize: '0.9rem' }}>Optional?</FormLabel>
                                      <Checkbox
                                        checked={item.isOptional || false}
                                        onChange={(e) => updateItem(index, { isOptional: e.target.checked })}
                                        size="small"
                                      />
                                      <IconButton onClick={() => removeItem(index)} size="small">
                                        <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                  disableUnderline: true,
                                  sx: {
                                    '& fieldset': { border: 'none' }
                                  }
                                }}
                                sx={{
                                  backgroundColor: theme.palette.background.paper,
                                  borderRadius: 5
                                }}
                              />
                            </Box>
                          ) : (
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={2}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    width: '35vw'
                                  }}
                                >
                                  <Box {...provided.dragHandleProps} sx={{ mt: 2 }}>
                                    <IconButton size="small">
                                      <GridDragIcon sx={{ color: 'black' }} />
                                    </IconButton>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mr: 1 }}>
                                    <InfoIcon sx={{ color: theme.palette.info.main }} />
                                  </Box>
                                  <TextField
                                    value={item.content || ''}
                                    onChange={(e) => updateItem(index, { content: e.target.value })}
                                    placeholder="Enter markdown content..."
                                    fullWidth
                                    multiline
                                    variant="outlined"
                                    minRows={8}
                                    maxRows={15}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                          <IconButton onClick={() => removeItem(index)} size="small">
                                            <RemoveCircleOutlineIcon sx={{ color: 'white' }} />
                                          </IconButton>
                                        </InputAdornment>
                                      ),
                                      disableUnderline: true,
                                      sx: {
                                        '& fieldset': { border: 'none' },
                                        fontSize: '1.1rem',
                                        lineHeight: 1.6,
                                        padding: 2
                                      }
                                    }}
                                    sx={{
                                      backgroundColor: theme.palette.background.paper,
                                      borderRadius: 3,
                                      '& .MuiInputBase-root': {
                                        alignItems: 'flex-start'
                                      }
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: 3,
                                    width: '35vw',
                                    padding: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    wordWrap: 'break-word',
                                    border: `1px solid ${theme.palette.divider}`,
                                    minHeight: '200px'
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      mb: 1,
                                      fontStyle: 'italic'
                                    }}
                                  >
                                    Preview:
                                  </Typography>
                                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                                    {item.content ? (
                                      <NERMarkdown markdown={item.content} />
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: theme.palette.text.disabled,
                                          fontStyle: 'italic'
                                        }}
                                      >
                                        Start typing to see formatted markdown...
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <IconButton
            onClick={addTask}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 5,
              fontSize: '1rem',
              padding: 1.5,
              flex: 1,
              justifyContent: 'flex-start'
            }}
          >
            <AddCircleOutlineIcon sx={{ color: theme.palette.text.primary, mr: 1 }} />
            Add Subtask
          </IconButton>
          <IconButton
            onClick={addInfoBlock}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 5,
              fontSize: '1rem',
              padding: 1.5,
              flex: 1,
              justifyContent: 'flex-start'
            }}
          >
            <AddCircleOutlineIcon sx={{ color: theme.palette.text.primary, mr: 1 }} />
            Add Information Block
          </IconButton>
        </Box>
      </Box>
    </NERFormModal>
  );
};

export default CreateChecklistModal;
