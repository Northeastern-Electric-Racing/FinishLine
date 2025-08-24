import { Box, Grid, Link, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import React, { useState, useEffect } from 'react';
import { DesignReview, wbsPipe } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FinalizeReviewInformation } from './DesignReviewDetailPage';
import { useCurrentUser, useUserScheduleSettings } from '../../../hooks/users.hooks';

// Create dynamic schema based on meeting type
const createValidationSchema = (isVirtual: boolean) =>
  yup.object().shape({
    zoomLink: isVirtual
      ? yup
          .string()
          .required('Zoom link is required for virtual meetings')
          .test('zoom-link', 'Must be a valid zoom link', (value) => (value ? value.includes('zoom.us/') : false))
      : yup
          .string()
          .optional()
          .test('zoom-link', 'Must be a valid zoom link', (value) => (value ? value.includes('zoom.us/') : true)),
    location: yup.string().optional(),
    docTemplateLink: yup.string().required('Question Doc is Required')
  });

interface FinalizeDesignReviewProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  designReview: DesignReview;
  conflictingDesignReviews: DesignReview[];
  startTime: number;
  selectedDate: Date;
  finalizeDesignReview: (data: FinalizeReviewInformation) => void;
}

const FinalizeDesignReviewDetailsModal = ({
  open,
  setOpen,
  designReview,
  conflictingDesignReviews,
  finalizeDesignReview,
  startTime,
  selectedDate
}: FinalizeDesignReviewProps) => {
  const [meetingType, setMeetingType] = useState<string[]>([]);
  const currentUser = useCurrentUser();
  const { data: userScheduleSettings } = useUserScheduleSettings(currentUser.userId);

  const title = `Finalize Design Review for ${designReview.wbsName}`;

  const designReviewConflicts = conflictingDesignReviews.map(
    (designReview) => `${wbsPipe(designReview.wbsNum)} - ${designReview.wbsName} at ${meetingStartTimePipe([startTime])}`
  );

  const handleMeetingTypeChange = (_event: any, newMeetingType: string[]) => {
    setMeetingType(newMeetingType);
    // Clear zoom link errors when switching away from virtual meetings
    if (!newMeetingType.includes('virtual')) {
      clearErrors('zoomLink');
    }
  };

  const onSubmit = async (data: { docTemplateLink: string; zoomLink?: string; location?: string }) => {
    finalizeDesignReview({ ...data, meetingType });
    setOpen(false);
  };

  // Create default values with personal zoom link if available
  const createDefaultValues = () => ({
    docTemplateLink: designReview.docTemplateLink ?? '',
    zoomLink: designReview.zoomLink ?? userScheduleSettings?.personalZoomLink ?? '',
    location: designReview.location ?? undefined
  });

  const defaultValues = createDefaultValues();

  const {
    handleSubmit,
    control,
    reset,
    clearErrors,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createValidationSchema(meetingType.includes('virtual'))),
    defaultValues
  });

  // Update validation schema when meeting type changes
  useEffect(() => {
    // Re-trigger validation with the current form values
    trigger();
  }, [meetingType, trigger]);

  // Update form when user schedule settings are loaded
  useEffect(() => {
    if (userScheduleSettings && !designReview.zoomLink) {
      reset({
        docTemplateLink: designReview.docTemplateLink ?? '',
        zoomLink: userScheduleSettings.personalZoomLink ?? '',
        location: designReview.location ?? undefined
      });
    }
  }, [userScheduleSettings, designReview, reset]);

  return (
    <NERFormModal
      open={open}
      onHide={() => setOpen(false)}
      title={title}
      reset={() => reset(defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      submitText="Schedule"
      formId="finalize-design-review-form"
    >
      <Box style={{ display: 'flex', marginBottom: 20 }}>
        <Typography style={{ fontSize: '1.2em', marginRight: 90 }}>Meeting Time:</Typography>
        <Typography style={{ fontSize: '1.2em' }}>{`${meetingStartTimePipe([
          startTime
        ])} - ${selectedDate.toDateString()}`}</Typography>
      </Box>
      <Box style={{ display: 'flex', marginBottom: 20 }}>
        <Typography style={{ fontSize: '1.2em', marginRight: 97 }}>Meeting Type:</Typography>
        <ToggleButtonGroup color="primary" value={meetingType} onChange={handleMeetingTypeChange}>
          <ToggleButton value="virtual">Virtual</ToggleButton>
          <ToggleButton value="inPerson">In-person</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box style={{ display: 'flex', marginBottom: 20 }}>
        <Box>
          <Typography style={{ fontSize: '1.2em', marginRight: 90 }}>Question Doc:</Typography>
          <Link
            href="https://docs.google.com/document/d/1DtbMNPUs0PMUI3D3UC-1ZpUXu3CvNoFzFvrypapg3os/edit?usp=sharing"
            target="_blank"
            underline="hover"
            fontSize={16}
          >
            Doc Template
          </Link>
        </Box>
        <ReactHookTextField
          name="docTemplateLink"
          control={control}
          sx={{ width: 0.48 }}
          errorMessage={errors.docTemplateLink}
        />
      </Box>
      {meetingType.includes('virtual') && (
        <Box style={{ display: 'flex', marginBottom: 20, alignItems: 'center' }}>
          <Typography style={{ fontSize: '1.2em', marginRight: 5 }}>Zoom Link:</Typography>
          <Tooltip title="Ensure your Zoom Link is Publicly Accessible and Does Not Require a Password." placement="right">
            <HelpIcon style={{ fontSize: 'medium', marginRight: 96 }} />
          </Tooltip>
          <ReactHookTextField name="zoomLink" control={control} sx={{ width: 0.48 }} errorMessage={errors.zoomLink} />
        </Box>
      )}
      {meetingType.includes('inPerson') && (
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
          <Typography style={{ fontSize: '1.2em', marginRight: 132 }}>Location:</Typography>
          <ReactHookTextField name="location" control={control} sx={{ width: 0.48 }} errorMessage={errors.location} />
        </Box>
      )}
      <Grid container justifyContent="center" style={{ alignItems: 'center' }}>
        {designReviewConflicts && designReviewConflicts.length > 0 && (
          <Grid item container justifyContent="center" style={{ alignItems: 'center' }}>
            <Box sx={{ backgroundColor: '#ef4345', width: '70%', padding: 0.5 }}>
              <Typography>Design Review Conflicts</Typography>
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
    </NERFormModal>
  );
};

export default FinalizeDesignReviewDetailsModal;
