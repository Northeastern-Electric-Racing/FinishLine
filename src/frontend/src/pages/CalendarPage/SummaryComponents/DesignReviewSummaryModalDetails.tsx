import { FormControl, FormLabel, Grid, IconButton, Stack, TextField } from '@mui/material';
import { DesignReview } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from './DesignReviewPill';
import { meetingStartTimePipe } from '../../../utils/pipes';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEditDesignReview } from '../../../hooks/design-reviews.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import * as yup from 'yup';
import { useToast } from '../../../hooks/toasts.hooks';
import SaveIcon from '@mui/icons-material/Save';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
  isEditing: boolean;
  setEditing: (editing: boolean) => void;
}

export interface DesignReviewEditProps {
  zoomLink: string;
  location: string;
  docTemplateLink: string;
}

const schema = yup.object().shape({
  zoomLink: yup
    .string()
    .optional()
    .test('zoom-link', 'Must be a valid zoom link', (value) => value!.includes('zoom.us/') || value! === ''),
  location: yup.string().optional(),
  docTemplateLink: yup.string().optional()
});

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({
  designReview,
  isEditing,
  setEditing
}) => {
  const toast = useToast();

  const {
    isLoading: editDesignReviewIsLoading,
    mutateAsync: editDesignReview,
    isError: editDesignReviewIsError,
    error: editDesignReviewError
  } = useEditDesignReview(designReview.designReviewId);

  const onSave = async (payload: DesignReviewEditProps) => {
    setEditing(false);
    try {
      await editDesignReview({
        ...designReview,
        zoomLink: payload.zoomLink === '' ? designReview.zoomLink ?? null : payload.zoomLink,
        location: payload.location === '' ? designReview.location ?? null : payload.location,
        docTemplateLink: payload.docTemplateLink === '' ? designReview.docTemplateLink ?? null : payload.docTemplateLink,
        teamTypeId: designReview.teamType.teamTypeId,
        attendees: designReview.attendees.map((user) => user.userId),
        requiredMembersIds: designReview.requiredMembers.map((member) => member.userId),
        optionalMembersIds: designReview.optionalMembers.map((member) => member.userId)
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<DesignReviewEditProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...designReview,
      zoomLink: designReview.zoomLink ?? '',
      location: designReview.location ?? '',
      docTemplateLink: designReview.docTemplateLink ?? ''
    }
  });

  if (!designReview || editDesignReviewIsLoading) return <LoadingIndicator />;
  if (editDesignReviewIsError) return <ErrorPage error={editDesignReviewError!} message={editDesignReviewError?.message} />;

  return (
    <form id={'design-reviews-edit-form'} onSubmit={handleSubmit(onSave)}>
      <Grid container direction="row" alignItems="center" justifyContent="center" columnSpacing={5} paddingBottom={2}>
        <Grid item xs={3}>
          <Stack direction="row">
            <DesignReviewPill
              icon={<AccessTimeIcon />}
              isLink={false}
              displayText={meetingStartTimePipe(designReview.meetingTimes)}
            />
            {isEditing ? (
              <IconButton type="submit" form="design-reviews-edit-form">
                <SaveIcon />
              </IconButton>
            ) : (
              <></>
            )}
          </Stack>
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
    </form>
  );
};

export default DesignReviewSummaryModalDetails;
