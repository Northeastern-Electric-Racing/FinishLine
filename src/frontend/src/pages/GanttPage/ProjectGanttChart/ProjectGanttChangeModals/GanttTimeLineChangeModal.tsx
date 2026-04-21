import { Box, FormControl, InputLabel, TextField, Typography } from '@mui/material';
import { dateToMidnightUTC, Link, LinkCreateArgs, ProjectGantt, Task, WbsElementPreview, WorkPackage } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { useCreateSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { useCreateTask, useEditTask, CreateTaskPayload, TaskPayload } from '../../../../hooks/tasks.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';
import { GanttRequestChangeModalProps } from './GanttRequestChangeModal';
import { useSingleProject } from '../../../../hooks/projects.hooks';

interface GanttTimeLineChangeModalProps extends GanttRequestChangeModalProps {}

export const GanttTimeLineChangeModal = ({ change, handleClose, open }: GanttTimeLineChangeModalProps) => {
  const toast = useToast();
  const [explanationForChange, setExplanationForChange] = useState('');
  const {
    data: originalProject,
    isLoading: originalProjectIsLoading,
    isError: originalProjectIsError,
    error: originalProjectError
  } = useSingleProject(change.element.wbsNum);
  const { isLoading: isLoadingChangeRequest, mutateAsync: createStandardChangeRequest } = useCreateStandardChangeRequest();
  const { isLoading: isLoadingWorkPackageCreate, mutateAsync: createSingleWorkPackage } = useCreateSingleWorkPackage();
  const { isLoading: isLoadingTaskCreate, mutateAsync: createTask } = useCreateTask();
  const { isLoading: isLoadingTaskEdit, mutateAsync: editTask } = useEditTask();

  if (
    !originalProject ||
    originalProjectIsLoading ||
    isLoadingChangeRequest ||
    isLoadingWorkPackageCreate ||
    isLoadingTaskCreate ||
    isLoadingTaskEdit
  )
    return <LoadingIndicator />;
  if (originalProjectIsError) return <ErrorPage error={originalProjectError} />;

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  const changeInTimeline = (startDate: Date, endDate: Date) => {
    return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`;
  };

  const transformLinkToLinkCreateArgs = (link: Link): LinkCreateArgs => {
    return {
      linkId: link.linkId,
      linkTypeName: link.linkType.name,
      url: link.url
    };
  };

  const project = change.element as ProjectGantt;

  const editedWorkPackages: WorkPackage[] = [];
  const createdWorkPackages: WorkPackage[] = [];
  project.workPackages.forEach((workPackage) => {
    if (workPackage.wbsElementId === '-1') {
      createdWorkPackages.push(workPackage);
    } else {
      const existingWorkPackage = originalProject.workPackages.find((wp) => workPackage.id === wp.id);
      if (
        existingWorkPackage &&
        (existingWorkPackage.startDate.getTime() !== workPackage.startDate.getTime() ||
          existingWorkPackage.endDate.getTime() !== workPackage.endDate.getTime())
      ) {
        editedWorkPackages.push(workPackage);
      }
    }
  });

  const editedTasks: Task[] = [];
  const createdTasks: Task[] = [];
  project.tasks?.forEach((task) => {
    const existingTask = originalProject.tasks.find((t) => t.taskId === task.taskId);
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

    try {
      if (editedWorkPackages.length > 0) {
        const payload: CreateStandardChangeRequestPayload = {
          wbsNum: change.element.wbsNum,
          why: explanationForChange,
          projectProposedChanges: {
            workPackageProposedChanges: editedWorkPackages.map((workPackage) => {
              const duration = dayjs(workPackage.endDate).diff(dayjs(workPackage.startDate), 'week');
              return {
                name: workPackage.name,
                stage: workPackage.stage,
                duration,
                startDate: dateToMidnightUTC(change.newStart).toISOString(),
                blockedBy: workPackage.blockedBy,
                descriptionBullets: workPackage.descriptionBullets,
                leadId: workPackage.lead ? workPackage.lead.userId : undefined,
                managerId: workPackage.manager ? workPackage.manager.userId : undefined,
                links: workPackage.links.map(transformLinkToLinkCreateArgs)
              };
            }),
            budget: originalProject.budget,
            summary: originalProject.summary,
            teamIds: originalProject.teams.map((team) => team.teamId),
            name: originalProject.name,
            descriptionBullets: originalProject.descriptionBullets,
            links: originalProject.links.map(transformLinkToLinkCreateArgs),
            leadId: originalProject.lead?.userId,
            managerId: originalProject.manager?.userId,
            carNumber: originalProject.wbsNum.carNumber
          }
        };

        await createStandardChangeRequest(payload);
        toast.success('Change Request Created Successfully!');
      }

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
            wbsNum: project.wbsNum,
            title: task.title,
            priority: task.priority,
            status: task.status,
            assignees: task.assignees?.map((user) => user.userId) || [],
            notes: task.notes || '',
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
            taskId: task.taskId,
            title: task.title,
            priority: task.priority,
            notes: task.notes || '',
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
      title={(change.element as WbsElementPreview).name ?? (change.element as Task).title}
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
