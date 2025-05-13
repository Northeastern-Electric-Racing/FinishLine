// SponsorNotesForm.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, MenuItem, Button, Grid, Select, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Sponsor, SponsorTask } from 'shared';
import { EditableTask, SponsorTaskPayload } from '../../../hooks/finance.hooks';
import SidePagePopup from './SidePagePopup';
import { AddCircle, RemoveCircle } from '@mui/icons-material';

interface SponsorNotesModalProps {
  open: boolean;
  onClose: () => void;
  sponsor: Sponsor;
  onSubmit: (data: EditableTask[]) => void;
}

const SponsorNotesModal: React.FC<SponsorNotesModalProps> = ({ open, onClose, sponsor, onSubmit }) => {
  const [tasks, setTasks] = useState<EditableTask[]>(sponsor.sponsorTasks);

  const handleTaskChange = (index: number, updatedTask: Partial<EditableTask>) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], ...updatedTask };
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { dueDate: new Date(), notes: '', notifyDate: undefined, asigneeId: undefined }]);
  };

  const removeTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleSave = () => {
    onSubmit(tasks);
  };

  return (
    <SidePagePopup
      showPage={open}
      handleClose={onClose}
      title={`Notes for ${sponsor.name}`}
      component={
        <Box sx={{ p: 2 }}>
          {tasks.map((task, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {/* Due Date */}
              <TextField
                type="date"
                value={task.dueDate ?? undefined}
                onChange={(e) => handleTaskChange(idx, { dueDate: new Date(e.target.value) })}
              />

              {/* Notify Date */}
              <TextField
                type="date"
                value={task.notifyDate ?? undefined}
                onChange={(e) =>
                  handleTaskChange(idx, {
                    notifyDate: e.target.value ? new Date(e.target.value) : undefined
                  })
                }
              />

              {/* Assignee */}
              <Select value={task.asigneeId || ''} onChange={(e) => handleTaskChange(idx, { asigneeId: e.target.value })}>
                {/* Replace with your list of assignees */}
                <MenuItem value="user1">User 1</MenuItem>
                <MenuItem value="user2">User 2</MenuItem>
              </Select>

              {/* Notes */}
              <TextField value={task.notes} onChange={(e) => handleTaskChange(idx, { notes: e.target.value })} />

              <IconButton onClick={() => removeTask(idx)}>
                <RemoveCircle />
              </IconButton>
            </Box>
          ))}

          <Button onClick={addTask} startIcon={<AddCircle />}>
            Add Task
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button onClick={onClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

export default SponsorNotesModal;
