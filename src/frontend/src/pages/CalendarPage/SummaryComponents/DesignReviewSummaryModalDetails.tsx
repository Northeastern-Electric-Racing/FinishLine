import { FormControl, FormLabel, Grid, TextField } from '@mui/material';
import { DesignReview } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from './DesignReviewPill';
import { meetingStartTimePipe } from '../../../utils/pipes';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { DesignReviewEditProps } from '../DesignReviewSummaryModal';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
  isEditing: boolean;
  control: Control<DesignReviewEditProps>;
  errors: FieldErrors<DesignReviewEditProps>;
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({
  designReview,
  isEditing,
  control,
  errors
}) => {
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
            <Controller
              name="location"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  variant="standard"
                  onChange={onChange}
                  value={value}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            icon={<LocationOnIcon />}
            isLink={false}
            displayText={designReview.location ? designReview.location : 'Online'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {isEditing ? (
          <FormControl>
            <FormLabel sx={{ whiteSpace: 'nowrap' }}>Enter Docs URL</FormLabel>
            <Controller
              name="docTemplateLink"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  variant="standard"
                  onChange={onChange}
                  value={value}
                  error={!!errors.docTemplateLink}
                  helperText={errors.docTemplateLink?.message}
                />
              )}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            isLink
            icon={<DescriptionIcon />}
            linkURL={designReview.docTemplateLink ?? ''}
            displayText={designReview.docTemplateLink ? 'Question Doc' : 'No Doc'}
          />
        )}
      </Grid>
      <Grid item xs={3}>
        {isEditing ? (
          <FormControl>
            <FormLabel sx={{ overflow: 'hidden', width: '100%', height: '23px' }}>Enter Zoom URL</FormLabel>
            <Controller
              name="zoomLink"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  variant="standard"
                  onChange={onChange}
                  value={value}
                  error={!!errors.zoomLink}
                  helperText={errors.zoomLink?.message}
                />
              )}
            />
          </FormControl>
        ) : (
          <DesignReviewPill
            isLink
            icon={<VideocamIcon />}
            linkURL={designReview.zoomLink ?? ''}
            displayText={designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default DesignReviewSummaryModalDetails;
