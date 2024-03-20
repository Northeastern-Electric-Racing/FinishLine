import { Box, Grid, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { useState } from 'react';
import { getHourFromDate } from '../../../utils/design-review.utils';

interface FinalizeDesignReviewProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  onSubmit?: () => void;
  designReviewName: string;
  selectedStartDateTime: Date | null;
  designReviewConflicts?: String[];
}

const FinalizeDesignReviewDetailsModal = ({
  open,
  setOpen,
  onSubmit,
  designReviewName,
  selectedStartDateTime,
  designReviewConflicts
}: FinalizeDesignReviewProps) => {
  const handleClose = () => {
    setOpen(false);
  };
  const [docTemplate, setDocTemplate] = useState('');
  const [meetingType, setMeetingType] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [zoomLink, setZoomLink] = useState('');

  // Need to do this so it can be called in the title
  if (!selectedStartDateTime) {
    return null;
  }

  const title = `${designReviewName} on ${selectedStartDateTime?.toDateString()} at ${getHourFromDate(
    selectedStartDateTime
  )}`;

  const handleMeetingTypeChange = (_event: any, newMeetingType: string[]) => {
    setMeetingType(newMeetingType);
  };

  return (
    <NERModal open={open} title={title} onHide={handleClose} onSubmit={onSubmit} submitText="Finalize Design Review Details">
      <Grid>
        <Grid>
          <Grid style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ textDecoration: 'underline', fontSize: '1.2em', marginRight: 97 }}>
              Meeting Type:
            </Typography>
            <ToggleButtonGroup color="primary" value={meetingType} onChange={handleMeetingTypeChange}>
              <ToggleButton value="virtual">Virtual</ToggleButton>
              <ToggleButton value="inPerson">In-person</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ textDecoration: 'underline', fontSize: '1.2em', marginRight: 53 }}>
              Add Doc Template:
            </Typography>
            <TextField
              label="Type here"
              variant="outlined"
              value={docTemplate}
              onChange={(e) => setDocTemplate(e.target.value)}
              style={{ borderRadius: 10 }}
              size="small"
            />
          </Grid>
          <Grid style={{ display: 'flex', marginBottom: 20 }}>
            <Typography style={{ textDecoration: 'underline', fontSize: '1.2em', marginRight: 120 }}>Zoom Link:</Typography>
            <TextField
              label="Type here"
              variant="outlined"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              style={{ borderRadius: 10 }}
              size="small"
            />
          </Grid>
          <Grid style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
            <Typography style={{ textDecoration: 'underline', marginBottom: 10, fontSize: '1.2em', marginRight: 135 }}>
              Location:
            </Typography>
            <TextField
              label="Type here"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ borderRadius: 10 }}
              size="small"
            />
          </Grid>
          <Grid container justifyContent="center" style={{ alignItems: 'center' }}>
            {designReviewConflicts && designReviewConflicts.length > 0 && (
              <Grid item container justifyContent="center" style={{ alignItems: 'center' }}>
                <Box sx={{ backgroundColor: '#ef4345', width: '70%', padding: 0.5 }}>
                  <Typography>Design Reviews Day Conflicts</Typography>
                </Box>
                <Grid item container justifyContent="center" style={{ marginBottom: 20 }}>
                  <Box
                    sx={{
                      width: '70%',
                      height: '90px',
                      overflowY: 'auto',
                      backgroundColor: 'grey',
                      padding: 1
                    }}
                  >
                    {designReviewConflicts.map((conflictDesign, index) => (
                      <Typography key={index} style={{ color: 'black', borderTop: '1px solid black' }}>
                        {conflictDesign}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </NERModal>
  );
};

export default FinalizeDesignReviewDetailsModal;
