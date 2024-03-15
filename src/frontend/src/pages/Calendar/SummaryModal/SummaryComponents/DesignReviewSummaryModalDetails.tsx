import { Grid, TextField } from '@mui/material';
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
  editing: boolean;
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({ designReview, editing }) => {
  const [locationState, setLocationState] = useState<string>(designReview.location || '');
  const [documentState, setDocumentState] = useState<string>(designReview.docTemplateLink || '');
  const [zoomState, setZoomState] = useState<string>(designReview.zoomLink || '');

  return (
    <Grid container direction="row" alignItems="center" justifyContent="center" columnSpacing={1}>
      <Grid item xs={3}>
        <DesignReviewPill
          icon={<AccessTimeIcon />}
          isLink={false}
          displayText={meetingStartTimePipe(designReview.meetingTimes)}
        />
      </Grid>
      <Grid item xs={3}>
        {editing ? (
          <TextField
            variant="standard"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLocationState(event.target.value);
            }}
            value={locationState}
            label="Enter Location"
          />
        ) : (
          <DesignReviewPill
            icon={<LocationOnIcon />}
            isLink={false}
            displayText={locationState ? locationState : 'Online'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {editing ? (
          <TextField
            variant="standard"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setDocumentState(event.target.value);
            }}
            value={documentState}
            label="Enter Docs URL"
          />
        ) : (
          <DesignReviewPill
            isLink
            icon={<DescriptionIcon />}
            linkURL={documentState ?? ''}
            displayText={documentState ? 'Docs' : 'No Doc'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {editing ? (
          <TextField
            variant="standard"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setZoomState(event.target.value);
            }}
            value={zoomState}
            label="Enter Zoom Link"
          />
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
