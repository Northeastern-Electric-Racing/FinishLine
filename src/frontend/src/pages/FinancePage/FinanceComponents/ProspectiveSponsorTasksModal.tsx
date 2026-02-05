/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Autocomplete, Checkbox } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import {
  useCreateProspectiveSponsorTask,
  useEditSponsorTask,
  useProspectiveSponsorTasks,
  useToggleSponsorTaskDone
} from '../../../hooks/finance.hooks';
import { ProspectiveSponsor, SponsorTask } from 'shared';
import { useAllMembers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import DeleteSponsorTaskModal from './DeleteSponsorTaskModal';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface ProspectiveSponsorTasksModalProps {
  onClose: () => void;
  prospectiveSponsor: ProspectiveSponsor;
}

const ProspectiveSponsorTasksModal: React.FC<ProspectiveSponsorTasksModalProps> = ({
  onClose,
  prospectiveSponsor
}) => {
  const toast = useToast();
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const { data: tasks } = useProspectiveSponsorTasks(prospectiveSponsor.prospectiveSponsorId);
  const { mutate: createTask } = useCreateProspectiveSponsorTask(prospectiveSponsor.prospectiveSponsorId);
  const { mutate: editTask } = useEditSponsorTask();
  const { mutate: toggleDone } = useToggleSponsorTaskDone();

  const [taskToDelete, setTaskToDelete] = useState<SponsorTask | undefined>(undefined);

  const taskSchema = yup.object().shape({
    sponsorTaskId: yup.string().optional(),
    dueDate: yup.date().required('Due date is required'),
    notifyDate: yup.date().nullable().optional(),
    assignee: yup.string().nullable().optional(),
    notes: yup.string().required('Notes is required'),
    done: yup.boolean().optional()
  });

  const schema = yup.object().shape({
    tasks: yup.array().of(taskSchema)
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { tasks: [] }
  });

  const { fields, append } = useFieldArray({ control, name: 'tasks' });

  useEffect(() => {
    if (tasks) {
      reset({
        tasks: tasks.map((task) => ({
          sponsorTaskId: task.sponsorTaskId,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
          assignee: task.assignee?.userId || '',
          notes: task.notes || '',
          done: task.done || false
        }))
      });
    }
  }, [tasks, reset]);

  const handleSave = handleSubmit(({ tasks }) => {
    tasks?.forEach((task) => {
      const payload = {
        dueDate: task.dueDate,
        notifyDate: task.notifyDate || undefined,
        assigneeUserId: task.assignee || undefined,
        notes: task.notes
      };
      if (task.sponsorTaskId) {
        try {
          editTask({ sponsorTaskId: task.sponsorTaskId, sponsorTaskData: payload });
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
        }
      } else {
        try {
          createTask(payload);
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message);
          }
        }
      }
    });
    onClose();
  });

  if (!users || usersIsLoading) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', p: '0px 8px 0px 14px', color: '#EF4345' }}>
        {['Done', 'Due Date', 'Notify Date', 'Assign to', 'Notes'].map((label) => (
          <Typography
            key={label}
            variant="h5"
            sx={{ flex: label === 'Done' ? 0.4 : 1, textDecoration: 'underline', fontSize: '23px', fontWeight: 'bold' }}
          >
            {label}
          </Typography>
        ))}
        <Box sx={{ width: 40 }} />
      </Box>

      {fields.map((item, idx) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            gap: 1,
            mb: 0.5,
            p: 1,
            borderRadius: 1,
            color: '#fff'
          }}
        >
          <Box sx={{ flex: 0.4, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Controller
              control={control}
              name={`tasks.${idx}.done`}
              render={({ field }) => (
                <Checkbox
                  checked={!!field.value}
                  disabled={!item.sponsorTaskId}
                  onChange={() => {
                    if (item.sponsorTaskId) {
                      toggleDone(item.sponsorTaskId);
                      field.onChange(!field.value);
                    }
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              control={control}
              name={`tasks.${idx}.dueDate`}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      placeholder: 'MM/DD/YY',
                      sx: { width: '100%' }
                    }
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              control={control}
              name={`tasks.${idx}.notifyDate`}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      placeholder: 'MM/DD/YY',
                      sx: { width: '100%' }
                    }
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              control={control}
              name={`tasks.${idx}.assignee`}
              render={({ field }) => (
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  value={users.find((u) => u.userId === field.value) || undefined}
                  onChange={(_, newValue) => field.onChange(newValue?.userId || '')}
                  sx={{ width: '100%' }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        width: '100%',
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } }
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Controller
              control={control}
              name={`tasks.${idx}.notes`}
              render={({ field }) => (
                <TextField
                  {...field}
                  error={!!errors.tasks?.[idx]?.notes}
                  helperText={errors.tasks?.[idx]?.notes?.message}
                  sx={{
                    width: '100%',
                    input: { color: '#fff' },
                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } },
                    label: { color: '#fff' }
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ width: 40, display: 'flex', justifyContent: 'center' }}>
            {fields[idx].sponsorTaskId && (
              <IconButton
                onClick={() => {
                  const fieldTask = fields[idx];
                  const taskToDelete: SponsorTask = {
                    ...fieldTask,
                    sponsorTaskId: fieldTask.sponsorTaskId || '',
                    assignee: fieldTask.assignee ? users.find((u) => u.userId === fieldTask.assignee) : undefined,
                    notifyDate: fieldTask.notifyDate ?? undefined,
                    done: fieldTask.done ?? false
                  };
                  setTaskToDelete(taskToDelete);
                }}
              >
                <RemoveCircle sx={{ width: '90%' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
      <Button
        startIcon={<AddCircle />}
        onClick={() =>
          append({
            dueDate: new Date(),
            notifyDate: undefined,
            assignee: '',
            notes: '',
            sponsorTaskId: undefined,
            done: false
          })
        }
      >
        Add Task
      </Button>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ mr: 2, color: 'white', border: '1px solid white', borderRadius: 1, px: 2 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={{ backgroundColor: '#EF4345', color: 'white', borderRadius: 1, px: 2 }}>
          Save
        </Button>
      </Box>
      {taskToDelete && (
        <DeleteSponsorTaskModal handleClose={() => setTaskToDelete(undefined)} sponsorTask={taskToDelete} />
      )}
    </Box>
  );
};

export default ProspectiveSponsorTasksModal;
