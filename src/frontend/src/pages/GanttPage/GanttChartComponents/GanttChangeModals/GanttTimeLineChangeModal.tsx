import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { RequestEventChange } from '../../../../utils/gantt.utils';
import { ChangeRequestReason, ChangeRequestType, WorkPackage } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import { CreateStandardChangeRequestPayload, useCreateStandardChangeRequest } from '../../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { useSingleWorkPackage } from '../../../../hooks/work-packages.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { NERDraggableFormModal } from '../../../../components/NERDraggableFormModal';

interface GanttTimeLineChangeModalProps {
  change: RequestEventChange;
  handleClose: () => void;
  open: boolean;
}

export const GanttTimeLineChangeModal = ({ change, handleClose, open }: GanttTimeLineChangeModalProps) => {
  const toast = useToast();
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>(ChangeRequestReason.Estimation);
  const [explanationForChange, setExplanationForChange] = useState('');
  const {
    data: workPackage,
    isLoading: wpIsLoading,
    isError: wpIsError,
    error: wpError
  } = useSingleWorkPackage(change.element.wbsNum);
  const { isLoading, mutateAsync } = useCreateStandardChangeRequest();

  if (!workPackage || wpIsLoading || isLoading) return <LoadingIndicator />;
  if (wpIsError) return <ErrorPage error={wpError} />;

  const handleReasonChange = (event: SelectChangeEvent<ChangeRequestReason>) => {
    setReasonForChange(event.target.value as ChangeRequestReason);
  };

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  const changeInTimeline = (startDate: Date, endDate: Date) => {
    return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`;
  };

  const handleSubmit = async () => {
    if (!reasonForChange) {
      return;
    }

    const changeWorkPackage = change.element as WorkPackage;

    const duration = dayjs(changeWorkPackage.endDate).diff(dayjs(changeWorkPackage.startDate), 'week');

    const payload: CreateStandardChangeRequestPayload = {
      wbsNum: change.element.wbsNum,
      type: ChangeRequestType.Issue,
      what: `Move timeline From: ${changeInTimeline(workPackage.startDate, workPackage.endDate)} To: ${changeInTimeline(
        change.newStart,
        change.newEnd
      )}`,
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
        startDate: change.newStart.toLocaleDateString(),
        blockedBy: workPackage.blockedBy,
        descriptionBullets: workPackage.descriptionBullets,
        leadId: workPackage.lead ? workPackage.lead.userId : undefined,
        managerId: workPackage.manager ? workPackage.manager.userId : undefined,
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
      title={change.element.name}
      disableSuccessButton={!reasonForChange || !explanationForChange}
      handleSubmit={handleSubmit}
      onHide={handleClose}
    >
      <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
        <Typography sx={{ fontSize: '1em', mb: 0.5 }}>
          {`Old: ${changeInTimeline(workPackage.startDate, workPackage.endDate)}`}
        </Typography>
        <Typography sx={{ fontSize: '1em' }}>{`New: ${changeInTimeline(change.newStart, change.newEnd)}`}</Typography>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Reason for Change</InputLabel>
            <Select value={reasonForChange} label="Reason for Change" onChange={handleReasonChange}>
              {Object.entries(ChangeRequestReason).map(([key, value]) => (
                <MenuItem value={value}>{key}</MenuItem>
              ))}
            </Select>
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
      </Box>
    </NERDraggableFormModal>
  );
};
