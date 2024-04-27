import { Box, Grid } from '@mui/material';
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
    <Box display="flex" flexDirection={'column'} paddingBottom={2} rowGap={2} marginTop="20px">
      <Box display="flex" justifyContent="space-between">
        <DesignReviewPill
          icon={<AccessTimeIcon />}
          isLink={false}
          displayText={meetingStartTimePipe(designReview.meetingTimes)}
        />
        <DesignReviewPill
          icon={<LocationOnIcon />}
          isLink={false}
          displayText={designReview.location ? designReview.location : 'Online'}
        />
      </Box>
      <DesignReviewPill
        isLink
        icon={<DescriptionIcon />}
        linkURL={designReview.docTemplateLink ?? ''}
        displayText={designReview.docTemplateLink ? 'Question Doc' : 'No Doc'}
      />

      <DesignReviewPill
        isLink
        icon={<VideocamIcon />}
        linkURL={designReview.zoomLink ?? ''}
        displayText={designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}
      />
    </Box>
  );
};

export default DesignReviewSummaryModalDetails;
