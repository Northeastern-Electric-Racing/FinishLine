import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import NERModal from '../../../components/NERModal';
import { useState } from 'react';

interface FinalizeDesignReviewProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  onSubmit?: () => void;
}

const FinalizeDesignReviewDetailsModal = ({ open, setOpen, onSubmit }: FinalizeDesignReviewProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  const names = ['jdel', 'dehkdh', 'dehjkdhk', 'dsahksdh', 'dsajkldsaj'];
  const locations = ['The Bay', 'Zoom'];
  const [docTemplate, setDocTemplate] = useState('');
  const [meetingType, setMeetingType] = useState<string[]>([]);
  const [location, setLocation] = useState('');

  const handleMeetingTypeChange = (_event: any, newMeetingType: string[]) => {
    setMeetingType(newMeetingType);
  };

  const handleLocationChange = (event: any) => {
    setLocation(event.target.value);
  };

  return (
    <NERModal open={open} title={''} onHide={handleClose} onSubmit={onSubmit} submitText="Finalize Design Review Details">
      <Grid>
        <Grid>
          <Grid style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ textDecoration: 'underline', fontSize: '1.2em', marginRight: 50 }}>
              Add Doc Template:
            </Typography>
            <TextField
              label="Type here"
              variant="outlined"
              value={docTemplate}
              onChange={(e) => setDocTemplate(e.target.value)}
              style={{ backgroundColor: 'grey', borderRadius: 10 }}
              size="small"
            />
          </Grid>
          <Grid style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ textDecoration: 'underline', fontSize: '1.2em', marginRight: 95 }}>
              Meeting Type:
            </Typography>
            <ToggleButtonGroup color="primary" value={meetingType} onChange={handleMeetingTypeChange}>
              <ToggleButton value="virtual">Virtual</ToggleButton>
              <ToggleButton value="inPerson">In-person</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
            <Typography style={{ textDecoration: 'underline', marginBottom: 10, fontSize: '1.2em', marginRight: 135 }}>
              Location:
            </Typography>
            <FormControl style={{ backgroundColor: 'grey', width: '45%', borderRadius: 5 }} fullWidth>
              <InputLabel>Location</InputLabel>
              <Select value={location} onChange={handleLocationChange} variant="outlined">
                {locations.map((loc: string) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid container justifyContent="center" style={{ alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#ef4345', width: '80%', padding: 0.5 }}>
              <Typography>Design Reviews Day Conflicts</Typography>
            </Box>
            <Grid container justifyContent="center" style={{ marginBottom: 20 }}>
              <Box
                sx={{
                  width: '80%',
                  height: '90px',
                  overflowY: 'auto',
                  backgroundColor: 'grey',
                  padding: 1
                }}
              >
                {names.map((name) => (
                  <Typography style={{ color: 'black', borderTop: '1px solid black' }}>{name}</Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </NERModal>
  );
};

export default FinalizeDesignReviewDetailsModal;
