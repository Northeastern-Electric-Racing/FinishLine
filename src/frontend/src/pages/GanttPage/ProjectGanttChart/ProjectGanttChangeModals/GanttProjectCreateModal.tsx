import { Box, Typography } from '@mui/material';
import { ProjectGantt } from 'shared';
import dayjs from 'dayjs';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';
import { getProjectStartDate, getProjectEndDate } from '../../../../utils/gantt.utils';
import { useCreateSingleProject } from '../../../../hooks/projects.hooks';
import { CreateSingleProjectPayload } from '../../../../utils/types';
import { WorkPackageApiInputs } from '../../../../apis/work-packages.api';
import { useCreateSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { GanttRequestChangeModalProps } from './GanttRequestChangeModal';
import { useCreateTask } from '../../../../hooks/tasks.hooks';

interface GanttProjectCreateModalProps extends GanttRequestChangeModalProps {}

export const GanttProjectCreateModal = ({ change, handleClose, open }: GanttProjectCreateModalProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync: createProject } = useCreateSingleProject();
  const { isLoading: workPackageIsLoading, mutateAsync: createWorkPackage } = useCreateSingleWorkPackage();
  const { isLoading: isLoadingTaskCreate, mutateAsync: createSingleTask } = useCreateTask();
  const project = change.element as ProjectGantt;
  const startDate = getProjectStartDate(project);
  const latestEndDate = getProjectEndDate(project);

  if (isLoading || workPackageIsLoading || isLoadingTaskCreate) return <LoadingIndicator />;

  const changeInTimeline = `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(latestEndDate).format('MMMM D, YYYY')}`;

  const handleSubmit = async () => {
    const [selectedTeam] = project.teams;

    const teamIds: string[] = selectedTeam ? [selectedTeam.teamId] : [];

    const payload: CreateSingleProjectPayload = {
      name: project.name,
      budget: 0,
      summary: `New Project for ${project.name}`,
      descriptionBullets: [],
      leadId: undefined,
      managerId: undefined,
      links: [],
      teamIds,
      carNumber: project.wbsNum.carNumber
    };

    const workPackagePayloads: WorkPackageApiInputs[] = project.workPackages.map((workPackage) => ({
      name: workPackage.name,
      startDate: workPackage.startDate.toISOString(),
      duration: dayjs(workPackage.endDate).diff(dayjs(workPackage.startDate), 'week'),
      crId: undefined,
      blockedBy: workPackage.blockedBy,
      descriptionBullets: workPackage.descriptionBullets,
      stage: workPackage.stage ?? 'NONE'
    }));

    try {
      const createdProject = await createProject(payload);
      toast.success('Project Created Successfully!');

      for (const workPackage of workPackagePayloads) {
        await createWorkPackage({ ...workPackage, projectWbsNum: createdProject.wbsNum });
      }
      toast.success('All work packages created successfully!');

      if (project.tasks && project.tasks.length > 0) {
        for (const task of project.tasks) {
          try {
            await createSingleTask({
              wbsNum: createdProject.wbsNum,
              title: task.title,
              priority: task.priority,
              status: task.status,
              assignees: task.assignees.map((user) => user.userId),
              notes: task.notes || '',
              deadline: task.deadline ? task.deadline.toISOString() : undefined,
              startDate: task.startDate ? task.startDate.toISOString() : undefined
            });
            toast.success('All tasks created successfully!');
          } catch (error) {
            console.error('Error creating task:', error);
            toast.error(`Failed to create task: ${task.title}`);
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
      title={'New Project: ' + project.name}
      handleSubmit={handleSubmit}
      onHide={() => handleClose(true)}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline}`}</Typography>
        <Typography>
          Are you sure you want to create this project with the existing timeline and its work packages? Changing this will
          not require a change request
        </Typography>
      </Box>
    </NERDraggableFormModal>
  );
};
