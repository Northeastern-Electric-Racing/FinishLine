import { Grid } from '@mui/material';
import { DesignReview } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from './DesignReviewPill';
import { meetingStartTimePipe } from '../../../utils/pipes';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({ designReview }) => {
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
        <DesignReviewPill
          icon={<LocationOnIcon />}
          isLink={false}
          displayText={designReview.location ? designReview.location : 'Online'}
        />
      </Grid>
      <Grid item xs={3}>
        <DesignReviewPill
          isLink
          icon={<DescriptionIcon />}
          linkURL={designReview.docTemplateLink ?? ''}
          displayText={designReview.docTemplateLink ? 'Question Doc' : 'No Doc'}
        />
      </Grid>
      <Grid item xs={3}>
        <DesignReviewPill
          isLink
          icon={<VideocamIcon />}
          linkURL={designReview.zoomLink ?? ''}
          displayText={designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}
        />
      </Grid>
    </Grid>
  );
};

export default DesignReviewSummaryModalDetails;
