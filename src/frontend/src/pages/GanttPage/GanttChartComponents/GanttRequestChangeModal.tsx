import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { RequestEventChange } from '../../../utils/gantt.utils';
import { ChangeRequestReason, ChangeRequestType, validateWBS } from 'shared';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';
import dayjs from 'dayjs';
import { useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

interface GanttRequestChangeModalProps {
  change: RequestEventChange;
  handleClose: () => void;
  open: boolean;
}

export const GanttRequestChangeModal = ({ change, handleClose, open }: GanttRequestChangeModalProps) => {
  const toast = useToast();
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>(ChangeRequestReason.Estimation);
  const [explanationForChange, setExplanationForChange] = useState('');
  const {
    data: workPackage,
    isLoading: wpIsLoading,
    isError: wpIsError,
    error: wpError
  } = useSingleWorkPackage(validateWBS(change.eventId));
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

    const payload = {
      wbsNum: validateWBS(change.eventId),
      type: ChangeRequestType.Issue,
      what: `Move timeline From: ${changeInTimeline(change.prevStart, change.prevEnd)} To: ${changeInTimeline(
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
        name: change.name,
        duration: change.duration,
        startDate: change.newStart.toLocaleDateString(),
        blockedBy: workPackage.blockedBy,
        expectedActivities: workPackage.expectedActivities.map((expectedActivity) => expectedActivity.detail),
        deliverables: workPackage.deliverables.map((deliverable) => deliverable.detail)
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
    <NERModal
      open={open}
      onHide={handleClose}
      title="Work Package Timeline Change Request"
      onSubmit={handleSubmit}
      disabled={!reasonForChange || !explanationForChange}
    >
      <Box sx={{ width: '450px' }}>
        <Typography sx={{ mb: 0.5, fontSize: '1.2em' }}>{change.name} Timeline changed</Typography>
        <Typography sx={{ fontSize: '1em', mb: 0.5 }}>
          {`From: ${changeInTimeline(change.prevStart, change.prevEnd)}`}
        </Typography>
        <Typography sx={{ fontSize: '1em' }}>{`To: ${changeInTimeline(change.newStart, change.newEnd)}`}</Typography>
      </Box>
      <Box sx={{ padding: '0 15px 0 15px', mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Reason for Change</InputLabel>
          {/* In the console, this part kept throwing warnings because the field for reasonForChange 
      was undefined when I clicked cancel on the modal. Is there a way to fix that */}

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
    </NERModal>
  );
};
