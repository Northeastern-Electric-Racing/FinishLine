import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { RequestEventChange } from '../../../utils/gantt.utils';
import { ChangeRequestReason, ChangeRequestType, WorkPackage, validateWBS } from 'shared';
import { useEffect, useState } from 'react';
import NERModal from '../../../components/NERModal';
import dayjs from 'dayjs';
import { useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { getSingleWorkPackage } from '../../../apis/work-packages.api';

interface GanttRequestChangeProps {
  change: RequestEventChange;
}

export const GanttRequestChange: React.FC<GanttRequestChangeProps> = ({ change }) => {
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>();
  const [explanationForChange, setExplanationForChange] = useState('');
  const [showModal, setShowModal] = useState(true);
  const [workPackage, setWorkPackage] = useState<WorkPackage>();
  const { isLoading, isError, error, mutateAsync } = useCreateStandardChangeRequest();

  useEffect(() => {
    const fetchWorkPackage = async () => {
      try {
        const wp = await getSingleWorkPackage(validateWBS(change.eventId));
        setWorkPackage(wp.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWorkPackage();
  });

  if (!workPackage || !showModal) {
    return null;
  }

  const handleReasonChange = (event: SelectChangeEvent<ChangeRequestReason>) => {
    setReasonForChange(event.target.value as ChangeRequestReason);
  };

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

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
      )} - ${dayjs(change.newEnd).format('MMMM D, YYYY')}`,
      why: [
        {
          explain: explanationForChange,
          type: reasonForChange
        }
      ],
      proposedSolutions: [],
      workPackageProposedChanges: {
        name: change.name,
        duration: (change.newEnd.getTime() - change.newStart.getTime()) / (1000 * 60 * 60 * 24), // is there a better way to do this
        startDate: change.newStart.toLocaleDateString(),
        blockedBy: workPackage.blockedBy,
        expectedActivities: workPackage.expectedActivities.map((expectedActivity) => expectedActivity.detail),
        deliverables: workPackage.deliverables.map((deliverable) => deliverable.detail)
      }
    };
    console.log('payload: ', payload);
    await mutateAsync(payload);

    console.log('Reason:', reasonForChange);
    console.log('Explanation:', explanationForChange);
    setShowModal(false);
  };

  return (
    <NERModal
      open={true}
      onHide={() => setShowModal(false)}
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
