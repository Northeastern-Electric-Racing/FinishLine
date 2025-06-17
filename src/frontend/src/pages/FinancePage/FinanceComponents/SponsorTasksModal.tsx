import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, Button, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import { useCreateSponsorTask, useEditSponsorTask, useGetSponsorTasks } from '../../../hooks/finance.hooks';
import { Sponsor, SponsorTask } from 'shared';
import { useAllUsers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import DeleteSponsorTaskModal from './DeleteSponsorTaskModal';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface SponsorTasksModalProps {
  onClose: () => void;
  sponsor: Sponsor;
}

const SponsorTasksModal: React.FC<SponsorTasksModalProps> = ({ onClose, sponsor }) => {
  const toast = useToast();
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllUsers();
  const { data: sponsorTasks } = useGetSponsorTasks(sponsor.sponsorId);
  const { mutate: createTask } = useCreateSponsorTask(sponsor.sponsorId);
  const { mutate: editTask } = useEditSponsorTask();

  const [sponsorTaskToDelete, setSponsorTaskToDelete] = useState<SponsorTask | undefined>(undefined);

  const taskSchema = yup.object().shape({
    sponsorTaskId: yup.string().optional(),
    dueDate: yup.date().required('Due date is required'),
    notifyDate: yup.date().nullable().optional(),
    assignee: yup.string().nullable().optional(),
    notes: yup.string().required('Notes is required')
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
    if (sponsorTasks) {
      reset({
        tasks: sponsorTasks.map((task) => ({
          sponsorTaskId: task.sponsorTaskId,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
          assignee: task.assignee?.userId || '',
          notes: task.notes || ''
        }))
      });
    }
  }, [sponsorTasks, reset]);

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
      <Box sx={{ display: 'flex', color: '#EF4345' }}>
        {['Due Date', 'Notify Date', 'Assign to', 'Notes'].map((label) => (
          <Typography
            key={label}
            variant="h5"
            sx={{ flex: 1, textDecoration: 'underline', fontSize: '23px', fontWeight: 'bold' }}
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
                    sx: {
                      width: '155px'
                    }
                  }
                }}
              />
            )}
          />
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
                    sx: {
                      width: '155px'
                    }
                  }
                }}
              />
            )}
          />
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      width: '155px',
                      input: { color: '#fff' },
                      '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } }
                    }}
                  />
                )}
              />
            )}
          />
          <Controller
            control={control}
            name={`tasks.${idx}.notes`}
            render={({ field }) => (
              <TextField
                {...field}
                error={!!errors.tasks?.[idx]?.notes}
                helperText={errors.tasks?.[idx]?.notes?.message}
                sx={{
                  width: '155px',
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } },
                  label: { color: '#fff' }
                }}
              />
            )}
          />
          {fields[idx].sponsorTaskId && (
            <IconButton
              onClick={() => {
                const fieldTask = fields[idx];
                const taskToDelete: SponsorTask = {
                  ...fieldTask,
                  sponsorTaskId: fieldTask.sponsorTaskId || '',
                  assignee: fieldTask.assignee ? users.find((u) => u.userId === fieldTask.assignee) : undefined,
                  notifyDate: fieldTask.notifyDate ?? undefined
                };
                setSponsorTaskToDelete(taskToDelete);
              }}
            >
              <RemoveCircle sx={{ width: '90%' }} />
            </IconButton>
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddCircle />}
        onClick={() =>
          append({ dueDate: new Date(), notifyDate: undefined, assignee: '', notes: '', sponsorTaskId: undefined })
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
      {sponsorTaskToDelete && (
        <DeleteSponsorTaskModal handleClose={() => setSponsorTaskToDelete(undefined)} sponsorTask={sponsorTaskToDelete} />
      )}
    </Box>
  );
};

export default SponsorTasksModal;
