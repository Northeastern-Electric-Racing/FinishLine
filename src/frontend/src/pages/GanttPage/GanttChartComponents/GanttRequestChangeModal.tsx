import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { RequestEventChange } from '../../../utils/gantt.utils';
import { ChangeRequestReason, ChangeRequestType, validateWBS } from 'shared';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useCreateStandardChangeRequest } from '../../../hooks/change-requests.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useSingleWorkPackage } from '../../../hooks/work-packages.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import Draggable from 'react-draggable';

interface GanttRequestChangeModalProps {
  change: RequestEventChange;
  handleClose: () => void;
  open: boolean;
}

export const GanttRequestChangeModal = ({ change, handleClose, open }: GanttRequestChangeModalProps) => {
  const toast = useToast();
  const theme = useTheme();
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
        name: workPackage.name,
        stage: workPackage.stage,
        duration: change.duration,
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
    <>
      {open && (
        <Draggable handle=".draggable-handle">
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              right: '5%',
              backgroundColor: theme.palette.background.paper,
              boxShadow: 24,
              zIndex: 6,
              width: '30%',
              borderRadius: '8px'
            }}
          >
            <Box className="draggable-handle" sx={{ backgroundColor: '#ef4345', padding: 2, borderRadius: '10px 10px 0 0' }}>
              <Typography sx={{ fontSize: '1.2em' }}>{change.name}</Typography>
            </Box>
            <Box sx={{ padding: 2, borderRadius: '10px 0 10px 0' }}>
              <Typography sx={{ fontSize: '1em', mb: 0.5 }}>
                {`Old: ${changeInTimeline(change.prevStart, change.prevEnd)}`}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '15px' }}>
              <NERFailButton onClick={handleClose}>Cancel</NERFailButton>
              <NERSuccessButton onClick={handleSubmit} disabled={!reasonForChange || !explanationForChange} sx={{ ml: 2 }}>
                Submit
              </NERSuccessButton>
            </Box>
          </Box>
        </Draggable>
      )}
    </>
  );
};
