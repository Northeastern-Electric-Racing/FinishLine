import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import {
  useCreateSponsorTask,
  useDeleteSponsorTask,
  useEditSponsorTask,
  useGetSponsorTasks
} from '../../../hooks/finance.hooks';
import { Sponsor, SponsorTask } from 'shared';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface SponsorNotesModalProps {
  onClose: () => void;
  sponsor: Sponsor;
}

const SponsorNotesModal: React.FC<SponsorNotesModalProps> = ({ onClose, sponsor }) => {
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();

  const [taskForms, setTaskForms] = useState<SponsorTask[]>([]);

  const { mutate: createTask } = useCreateSponsorTask(sponsor.sponsorId);
  const { mutate: editTask } = useEditSponsorTask();
  const { mutate: deleteTask } = useDeleteSponsorTask();

  const { data: sponsorTasks } = useGetSponsorTasks(sponsor.sponsorId);

  useEffect(() => {
    if (Array.isArray(sponsorTasks)) {
      setTaskForms(
        sponsorTasks.map((task) => ({
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
          assignee: task.assignee || undefined,
          notes: task.notes || '',
          sponsorTaskId: task.sponsorTaskId || ''
        }))
      );
    } else {
      setTaskForms([{ dueDate: new Date(), notifyDate: undefined, assignee: undefined, sponsorTaskId: '', notes: '' }]);
    }
  }, [sponsorTasks]);

  const handleChange = (index: number, field: keyof SponsorTask, value: any) => {
    setTaskForms((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addTask = () => {
    setTaskForms((prev) => [
      ...prev,
      { dueDate: new Date(), notifyDate: undefined, assignee: undefined, sponsorTaskId: '', notes: '' }
    ]);
  };

  const removeTask = (index: number) => {
    const taskToRemove = taskForms[index];
    if (taskToRemove?.sponsorTaskId) {
      deleteTask({ sponsorTaskId: taskToRemove.sponsorTaskId });
    }
    setTaskForms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    taskForms.forEach((form) => {
      const payload = {
        dueDate: form.dueDate,
        notes: form.notes,
        notifyDate: form.notifyDate,
        assigneeId: form.assignee?.userId
      };

      if (form.sponsorTaskId) {
        editTask({ sponsorTaskId: form.sponsorTaskId, sponsorTaskData: payload });
      } else {
        createTask(payload);
      }
    });
    onClose();
  };

  if (!users || usersIsLoading) {
    return <LoadingIndicator />;
  }

  if (usersIsError) {
    return <ErrorPage message={usersError.message} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography sx={{ flex: 1 }}>Due Date</Typography>
        <Typography sx={{ flex: 1 }}>Notify Date</Typography>
        <Typography sx={{ flex: 1 }}>Assign to</Typography>
        <Typography sx={{ flex: 1 }}>Notes</Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      {/* Task forms */}
      {taskForms.map((task, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <DatePicker
            value={task.dueDate || null}
            onChange={(newValue) => handleChange(idx, 'dueDate', newValue)}
            slotProps={{
              textField: {
                placeholder: 'MM/DD/YY',
                sx: {
                  flex: 1,
                  input: { color: 'white' },
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } }
                }
              }
            }}
          />
          <DatePicker
            value={task.notifyDate || null}
            onChange={(newValue) => handleChange(idx, 'notifyDate', newValue)}
            slotProps={{
              textField: {
                placeholder: 'MM/DD/YY',
                sx: {
                  flex: 1,
                  input: { color: 'white' },
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } }
                }
              }
            }}
          />
          <Select
            value={task.assignee?.userId || ''}
            onChange={(e) => handleChange(idx, 'assignee', users.find((u) => u.userId === e.target.value) || undefined)}
            sx={{ flex: 1, color: 'white', '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } } }}
          >
            {users.map((user) => (
              <MenuItem key={user.userId} value={user.userId} sx={{ color: 'white' }}>
                {user.firstName} {user.lastName}
              </MenuItem>
            ))}
          </Select>
          <TextField
            value={task.notes || ''}
            onChange={(e) => handleChange(idx, 'notes', e.target.value)}
            InputProps={{ style: { color: 'white' } }}
            sx={{
              flex: 1,
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' } }
            }}
          />
          <IconButton onClick={() => removeTask(idx)} sx={{ color: 'white' }}>
            <RemoveCircle />
          </IconButton>
        </Box>
      ))}

      {/* Add Task Button */}
      <Button onClick={addTask} startIcon={<AddCircle />} sx={{ color: 'white', mb: 4 }}>
        Add Notes
      </Button>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ mr: 2, color: 'white', border: '1px solid white', borderRadius: 1, px: 2 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={{ backgroundColor: '#d32f2f', color: 'white', borderRadius: 1, px: 2 }}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default SponsorNotesModal;
