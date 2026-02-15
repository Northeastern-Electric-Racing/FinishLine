import React, { useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import { useDeleteSponsorTask, useEditSponsorTask } from '../../../hooks/finance.hooks';
import { SponsorTask } from 'shared';
import { useAllMembers } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import SponsorTaskCard from './SponsorTaskCard';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

interface SponsorTasksModalProps {
  onClose: () => void;
  tasks: SponsorTask[] | undefined;
  createTask: (payload: { dueDate: Date; notifyDate?: Date; assigneeUserId?: string; notes: string }) => void;
}

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

const SponsorTasksModal: React.FC<SponsorTasksModalProps> = ({ onClose, tasks: sponsorTasks, createTask }) => {
  const toast = useToast();
  const { data: users, isLoading: usersIsLoading, isError: usersIsError, error: usersError } = useAllMembers();
  const { mutate: editTask } = useEditSponsorTask();
  const { mutate: deleteTask } = useDeleteSponsorTask();

  const deletedTaskIds = useRef<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { tasks: [] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' });

  useEffect(() => {
    if (sponsorTasks) {
      const mapped = sponsorTasks.map((task) => ({
        sponsorTaskId: task.sponsorTaskId,
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined,
        assignee: task.assignee?.userId || '',
        notes: task.notes || '',
        done: task.done || false
      }));
      // Sort: incomplete tasks first, done tasks at the bottom
      mapped.sort((a, b) => Number(a.done) - Number(b.done));
      reset({ tasks: mapped });
      deletedTaskIds.current = [];
    }
  }, [sponsorTasks, reset]);

  const handleSave = handleSubmit(({ tasks }) => {
    // Delete removed tasks
    deletedTaskIds.current.forEach((sponsorTaskId) => {
      deleteTask({ sponsorTaskId });
    });

    // Edit existing / create new tasks
    tasks?.forEach((task) => {
      const payload = {
        dueDate: task.dueDate,
        notifyDate: task.notifyDate || undefined,
        assigneeUserId: task.assignee || undefined,
        notes: task.notes,
        done: task.done ?? false
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
    toast.success('Tasks saved successfully!');
    onClose();
  });

  if (!users || usersIsLoading) return <LoadingIndicator />;
  if (usersIsError) return <ErrorPage message={usersError.message} />;

  return (
    <Box>
      {fields.map((item, idx) => (
        <Box key={item.id} sx={{ mb: 1.5 }}>
          <SponsorTaskCard
            control={control}
            errors={errors}
            fieldPrefix={`tasks.${idx}`}
            members={users}
            showDoneCheckbox
            isExistingTask={!!item.sponsorTaskId}
            onRemove={() => {
              if (item.sponsorTaskId) {
                deletedTaskIds.current.push(item.sponsorTaskId);
              }
              remove(idx);
            }}
          />
        </Box>
      ))}
      <Button
        startIcon={<AddCircle />}
        onClick={() =>
          append({ dueDate: new Date(), notifyDate: undefined, assignee: '', notes: '', sponsorTaskId: undefined, done: false })
        }
        sx={{ mb: 2 }}
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
    </Box>
  );
};

export default SponsorTasksModal;
