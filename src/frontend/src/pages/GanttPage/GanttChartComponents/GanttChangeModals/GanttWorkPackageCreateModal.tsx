import { Box, Typography } from '@mui/material';
import { WorkPackage } from 'shared';
import dayjs from 'dayjs';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';
import { useCreateSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { WorkPackageCreateArgs } from '../../../../apis/work-packages.api';

interface GanttWorkPackageCreateModalProps {
  workPackage: WorkPackage;
  handleClose: () => void;
  open: boolean;
}

export const GanttWorkPackageCreateModal = ({ workPackage, handleClose, open }: GanttWorkPackageCreateModalProps) => {
  const toast = useToast();
  const { isLoading, mutateAsync } = useCreateSingleWorkPackage();

  if (isLoading) return <LoadingIndicator />;

  const changeInTimeline = (startDate: Date, endDate: Date) => {
    return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`;
  };

  const duration = dayjs(workPackage.endDate).diff(dayjs(workPackage.startDate), 'week');

  const handleSubmit = async () => {
    const payload: WorkPackageCreateArgs = {
      name: workPackage.name,
      stage: workPackage.stage ?? 'NONE',
      duration,
      startDate: workPackage.startDate.toLocaleDateString(),
      blockedBy: [],
      descriptionBullets: [],
      projectWbsNum: { ...workPackage.wbsNum, workPackageNumber: 0 }
    };
    try {
      await mutateAsync(payload);
      toast.success('Work Package Created Successfully!');
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <NERDraggableFormModal
      open={open}
      title={'New Workpackage: ' + workPackage.name}
      handleSubmit={handleSubmit}
      onHide={handleClose}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline(
          workPackage.startDate,
          workPackage.endDate
        )}`}</Typography>
        <Typography>
          Are you sure you want to create this work package with this timeline? Changing this will require a change request.
        </Typography>
      </Box>
    </NERDraggableFormModal>
  );
};
