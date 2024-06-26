import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { ChangeRequestReason, ChangeRequestType, WorkPackage } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useCreateStandardChangeRequest } from '../../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';

interface GanttWorkPackageCreateModalProps {
  workPackage: WorkPackage;
  handleClose: () => void;
  open: boolean;
}

export const GanttWorkPackageCreateModal = ({ workPackage, handleClose, open }: GanttWorkPackageCreateModalProps) => {
  const toast = useToast();
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>(ChangeRequestReason.Initialization);
  const [explanationForChange, setExplanationForChange] = useState('');
  const { isLoading, mutateAsync } = useCreateStandardChangeRequest();

  if (isLoading) return <LoadingIndicator />;

  const handleReasonChange = (event: SelectChangeEvent<ChangeRequestReason>) => {
    setReasonForChange(event.target.value as ChangeRequestReason);
  };

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  const changeInTimeline = (startDate: Date, endDate: Date) => {
    return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`;
  };

  const duration = dayjs(workPackage.endDate).diff(dayjs(workPackage.startDate), 'week');

  const handleSubmit = async () => {
    if (!reasonForChange) {
      return;
    }

    const payload = {
      wbsNum: {
        carNumber: workPackage.wbsNum.carNumber,
        projectNumber: workPackage.wbsNum.projectNumber,
        workPackageNumber: 0
      },
      type: ChangeRequestType.Issue,
      what: `Create New Work Package with timeline of: ${changeInTimeline(workPackage.startDate, workPackage.endDate)}`,
      why: [
        {
          explain: explanationForChange,
          type: reasonForChange
        }
      ],
      proposedSolutions: [],
      workPackageProposedChanges: {
        name: workPackage.name,
        stage: workPackage.stage,
        duration,
        startDate: workPackage.startDate.toLocaleDateString(),
        blockedBy: [],
        descriptionBullets: [],
        leadId: undefined,
        managerId: undefined,
        links: []
      }
    };
    try {
      await mutateAsync(payload);
      toast.success('Change Request Created Successfully!');
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
      disableSuccessButton={!reasonForChange || !explanationForChange}
      handleSubmit={handleSubmit}
      onHide={handleClose}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline(
          workPackage.startDate,
          workPackage.endDate
        )}`}</Typography>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Reason for Initialization</InputLabel>
            <Select value={reasonForChange} label="Reason for Initialization" onChange={handleReasonChange}>
              {Object.entries(ChangeRequestReason).map(([key, value]) => (
                <MenuItem value={value}>{key}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Explanation for Initialization"
            sx={{ mt: 2 }}
            value={explanationForChange}
            onChange={handleExplanationChange}
            multiline
          />
        </Box>
      </Box>
    </NERDraggableFormModal>
  );
};
