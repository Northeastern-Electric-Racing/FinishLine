import { FormControl, FormLabel, Grid, TextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { DesignReview } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from '../../../../components/DesignReviewPill';
import { meetingStartTimePipe } from '../../../../utils/pipes';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
  isEditing: boolean;
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({ designReview, isEditing }) => {
  const [locationState, setLocationState] = useState<string>(designReview.location || '');
  const [documentState, setDocumentState] = useState<string>(designReview.docTemplateLink || '');
  const [zoomState, setZoomState] = useState<string>(designReview.zoomLink || '');

  return (
    <Grid container direction="row" alignItems="center" justifyContent="center" columnSpacing={5} paddingBottom={2}>
      <Grid item xs={3}>
        <DesignReviewPill
          icon={<AccessTimeIcon />}
          isLink={false}
          displayText={meetingStartTimePipe(designReview.meetingTimes)}
        />
      </Grid>
      <Grid item xs={3}>
        {isEditing ? (
          <FormControl>
            <FormLabel sx={{ whiteSpace: 'nowrap' }}>Enter Location</FormLabel>
            <TextField
              variant="standard"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setLocationState(event.target.value);
              }}
              value={locationState}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            icon={<LocationOnIcon />}
            isLink={false}
            displayText={locationState ? locationState : 'Online'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {isEditing ? (
          <FormControl>
            <FormLabel sx={{ whiteSpace: 'nowrap' }}>Enter Docs URL</FormLabel>
            <TextField
              variant="standard"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setDocumentState(event.target.value);
              }}
              value={documentState}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            isLink
            icon={<DescriptionIcon />}
            linkURL={documentState ?? ''}
            displayText={documentState ? 'Question Doc' : 'No Doc'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {isEditing ? (
          <FormControl>
            <FormLabel sx={{ overflow: 'hidden', width: '100%', height: '23px' }}>Enter Zoom Link4f3rf3f3rf</FormLabel>
            <TextField
              variant="standard"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setZoomState(event.target.value);
              }}
              value={zoomState}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            isLink
            icon={<VideocamIcon />}
            linkURL={zoomState ?? ''}
            displayText={zoomState ? 'Zoom Link' : 'No Zoom'}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DesignReviewSummaryModalDetails;
