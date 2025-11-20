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

interface GanttProjectCreateModalProps extends GanttRequestChangeModalProps {}

export const GanttProjectCreateModal = ({ change, handleClose, open }: GanttProjectCreateModalProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync: createProject } = useCreateSingleProject();
  const { isLoading: workPackageIsLoading, mutateAsync: createWorkPackage } = useCreateSingleWorkPackage();
  const project = change.element as ProjectGantt;

  const startDate = getProjectStartDate(project);
  const latestEndDate = getProjectEndDate(project);

  if (isLoading || workPackageIsLoading) return <LoadingIndicator />;

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
      const project = await createProject(payload);
      toast.success('Project Created Successfully!');
      for (const workPackage of workPackagePayloads) {
        await createWorkPackage({ ...workPackage, projectWbsNum: project.wbsNum });
      }
      toast.success('All work packages created successfully!');
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
