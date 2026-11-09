import { Box, FormControl, InputLabel, TextField, Typography } from '@mui/material';
import { dateToMidnightUTC, ProjectGanttItem, GanttProjectTask, BaseWbsElement, GanttWorkPackage } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { useCreateTask, useEditTask, CreateTaskPayload, TaskPayload } from '../../../../hooks/tasks.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';
import { GanttRequestChangeModalProps } from './GanttRequestChangeModal';

interface GanttTimeLineChangeModalProps extends GanttRequestChangeModalProps {
  // the project as the server sent it, to tell what was edited on the chart; undefined if it was added on the chart
  originalProject?: ProjectGanttItem;
}

export const GanttTimeLineChangeModal = ({ change, handleClose, open, originalProject }: GanttTimeLineChangeModalProps) => {
  const toast = useToast();
  const [explanationForChange, setExplanationForChange] = useState('');
  const { isLoading: isLoadingWorkPackageCreate, mutateAsync: createSingleWorkPackage } = useCreateSingleWorkPackage();
  const { isLoading: isLoadingTaskCreate, mutateAsync: createTask } = useCreateTask();
  const { isLoading: isLoadingTaskEdit, mutateAsync: editTask } = useEditTask();

  if (isLoadingWorkPackageCreate || isLoadingTaskCreate || isLoadingTaskEdit) return <LoadingIndicator />;

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  const changeInTimeline = (startDate: Date, endDate: Date) => {
    return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`;
  };

  const project = change.element as ProjectGanttItem;

  const editedWorkPackages: GanttWorkPackage[] = [];
  const createdWorkPackages: GanttWorkPackage[] = [];
  project.workPackages.forEach((workPackage) => {
    if (workPackage.wbsElementId === '-1') {
      createdWorkPackages.push(workPackage);
    } else {
      const existingWorkPackage = originalProject?.workPackages.find((wp) => workPackage.id === wp.id);
      if (
        existingWorkPackage &&
        (existingWorkPackage.startDate.getTime() !== workPackage.startDate.getTime() ||
          existingWorkPackage.endDate.getTime() !== workPackage.endDate.getTime())
      ) {
        editedWorkPackages.push(workPackage);
      }
    }
  });

  const editedTasks: GanttProjectTask[] = [];
  const createdTasks: GanttProjectTask[] = [];
  project.tasks.forEach((task) => {
    const existingTask = originalProject?.tasks.find((t) => t.taskId === task.taskId);
    if (!existingTask) {
      createdTasks.push(task);
    } else {
      const hasChanges =
        existingTask.title !== task.title ||
        existingTask.notes !== task.notes ||
        existingTask.priority !== task.priority ||
        existingTask.status !== task.status ||
        existingTask.startDate?.getTime() !== task.startDate?.getTime() ||
        existingTask.deadline?.getTime() !== task.deadline?.getTime() ||
        existingTask.assignees.length !== task.assignees.length ||
        existingTask.assignees.some((assignee, index) => assignee.userId !== task.assignees[index]?.userId);

      if (hasChanges) {
        editedTasks.push(task);
      }
    }
  });

  const handleSubmit = async () => {
    if (editedWorkPackages.length > 0) {
      return;
    }

    // moving existing work packages isn't supported from here yet, so nothing is saved when one was moved
    try {
      createdWorkPackages.forEach(async (workPackage) => {
        const duration = dayjs(workPackage.endDate).diff(dayjs(workPackage.startDate), 'week');
        await createSingleWorkPackage({
          projectWbsNum: project.wbsNum,
          name: workPackage.name,
          startDate: dateToMidnightUTC(workPackage.startDate).toISOString(),
          duration,
          stage: workPackage.stage ?? 'NONE',
          blockedBy: [],
          descriptionBullets: []
        });
      });
      if (createdWorkPackages.length > 0) toast.success('Successfully Created Work Packages');

      if (createdTasks.length > 0) {
        for (const task of createdTasks) {
          const taskPayload: CreateTaskPayload = {
            wbsNum: task.wbsNum,
            title: task.title,
            priority: task.priority,
            status: task.status,
            assignees: task.assignees?.map((user) => user.userId) || [],
            notes: task.notes || '',
            labelIds: task.labels.map((l) => l.taskLabelId),
            blockedByIds: task.blockedBy.map((b) => b.taskId),
            deadline: task.deadline ? dateToMidnightUTC(task.deadline).toISOString() : undefined,
            startDate: task.startDate ? dateToMidnightUTC(task.startDate).toISOString() : undefined
          };

          try {
            await createTask(taskPayload);
            toast.success(`Successfully created ${createdTasks.length} task(s)`);
          } catch (error) {
            console.error('Error creating task:', error);
            toast.error(`Failed to create task: ${task.title}`);
          }
        }
      }

      if (editedTasks.length > 0) {
        for (const task of editedTasks) {
          const taskPayload: TaskPayload = {
            wbsNum: task.wbsNum,
            taskId: task.taskId,
            title: task.title,
            priority: task.priority,
            notes: task.notes || '',
            labelIds: task.labels.map((l) => l.taskLabelId),
            blockedByIds: task.blockedBy.map((b) => b.taskId),
            deadline: task.deadline,
            startDate: task.startDate
          };

          try {
            await editTask(taskPayload);
            toast.success(`Successfully updated ${editedTasks.length} task(s)`);
          } catch (error) {
            console.error('Error editing task:', error);
            toast.error(`Failed to edit task: ${task.title}`);
          }
        }
      }

      handleClose(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <NERDraggableFormModal
      open={open}
      title={(change.element as BaseWbsElement).name ?? (change.element as GanttProjectTask).title}
      disableSuccessButton={editedWorkPackages.length > 0 && !explanationForChange}
      handleSubmit={handleSubmit}
      onHide={() => handleClose(true)}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em', mb: 0.5 }}>
          {`Edit ${editedWorkPackages.length} Work Packages and Create ${createdWorkPackages.length} Work Packages`}
        </Typography>
        <Typography sx={{ fontSize: '1em', mb: 0.5 }}>
          {`Edit ${editedTasks.length} Tasks and Create ${createdTasks.length} Tasks`}
        </Typography>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline(change.newStart, change.newEnd)}`}</Typography>
        {editedWorkPackages.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Reason for Change</InputLabel>
            </FormControl>
            <TextField
              fullWidth
              label="Explanation for Change"
              sx={{ mt: 2 }}
              value={explanationForChange}
              onChange={handleExplanationChange}
              multiline
            />
          </Box>
        )}
      </Box>
    </NERDraggableFormModal>
  );
};
