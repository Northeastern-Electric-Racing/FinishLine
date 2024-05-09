import {
  Box,
  Button,
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
import { ChangeRequestReason } from 'shared';
import { useState } from 'react';

interface GanttRequestChangeProps {
  change: RequestEventChange;
}

export const GanttRequestChange: React.FC<GanttRequestChangeProps> = ({ change }) => {
  const theme = useTheme();
  const [reasonForChange, setReasonForChange] = useState<ChangeRequestReason>();
  const [explanationForChange, setExplanationForChange] = useState('');
  const [showModal, setShowModal] = useState(true);

  const handleReasonChange = (event: SelectChangeEvent<ChangeRequestReason>) => {
    setReasonForChange(event.target.value as ChangeRequestReason);
  };

  const handleExplanationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExplanationForChange(event.target.value);
  };

  // finish submit logic
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Reason:', reasonForChange);
    console.log('Explanation:', explanationForChange);
  };

  if (!showModal) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '10%',
        right: '10%',
        width: '30%',
        // overflowY: 'auto',
        zIndex: 5,
        borderRadius: '10px',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box component="form" onSubmit={(event) => handleSubmit(event)}>
        <Box sx={{ backgroundColor: '#ef4345', padding: '10px' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Work Package Timeline Change Request</Typography>
        </Box>
        <Box sx={{ backgroundColor: theme.palette.background.paper, padding: '15px' }}>
          <Typography sx={{ mb: 1 }}>{change.name} Timeline changed from:</Typography>
          <Typography>
            {`${change.prevStart.toLocaleDateString()} - ${change.prevEnd.toLocaleDateString()} to
            ${change.newStart.toLocaleDateString()} - ${change.newEnd.toLocaleDateString()}`}
          </Typography>
        </Box>
        <Box sx={{ padding: '0 15px 0 15px' }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Reason for Change</InputLabel>
            <Select value={reasonForChange} label="Reason for Change" onChange={handleReasonChange}>
              {Object.keys(ChangeRequestReason).map((reason) => (
                <MenuItem value={reason}>{reason}</MenuItem>
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
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1, padding: '5px 0 5px 0' }}>
          <Button type="submit">Submit Change</Button>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </Box>
      </Box>
    </Box>
  );
};
