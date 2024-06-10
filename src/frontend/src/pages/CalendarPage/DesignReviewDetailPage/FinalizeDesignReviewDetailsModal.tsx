import { Box, Grid, Link, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { DesignReview, wbsPipe } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FinalizeReviewInformation } from './DesignReviewDetailPage';

const schema = yup.object().shape({
  zoomLink: yup
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

  const title = `Finalize Design Review for ${designReview.wbsName}`;

  const designReviewConflicts = conflictingDesignReviews.map(
    (designReview) => `${wbsPipe(designReview.wbsNum)} - ${designReview.wbsName} at ${meetingStartTimePipe([startTime])}`
  );

  const handleMeetingTypeChange = (_event: any, newMeetingType: string[]) => {
    setMeetingType(newMeetingType);
  };

  const onSubmit = async (data: { docTemplateLink: string; zoomLink?: string; location?: string }) => {
    finalizeDesignReview({ ...data, meetingType });
    setOpen(false);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      docTemplateLink: '',
      zoomLink: undefined,
      location: undefined
    }
  });

  return (
    <NERFormModal
      open={open}
      onHide={() => setOpen(false)}
      title={title}
      reset={() => reset({ docTemplateLink: '', zoomLink: undefined, location: undefined })}
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
            href="https://docs.google.com/document/d/1Rr2R6m6gr1hg1cjqkEmRg1Kk1-t1-SRPpso-CT_s3bg/edit#heading=h.yy87wzv6zqbj"
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
          sx={{ width: 0.5 }}
          errorMessage={errors.docTemplateLink}
        />
      </Box>
      {meetingType.includes('virtual') && (
        <Box style={{ display: 'flex', marginBottom: 20 }}>
          <Typography style={{ fontSize: '1.2em', marginRight: 120 }}>Zoom Link:</Typography>
          <ReactHookTextField name="zoomLink" control={control} sx={{ width: 0.5 }} errorMessage={errors.zoomLink} />
        </Box>
      )}
      {meetingType.includes('inPerson') && (
        <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 50 }}>
          <Typography style={{ fontSize: '1.2em', marginRight: 132 }}>Location:</Typography>
          <ReactHookTextField name="location" control={control} sx={{ width: 0.49 }} errorMessage={errors.location} />
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
