import { Box, Grid, Link, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import React, { useState, useEffect } from 'react';
import { Event, meetingStartTimePipeNumbers, wbsPipe } from 'shared';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FinalizeEventInformation } from './EventDetailPage';
import { useCurrentUser, useUserScheduleSettings } from '../../../hooks/users.hooks';

interface FinalizeEventProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  event: Event;
  conflictingEvents: Event[];
  startTime: number;
  selectedDate: Date;
  finalizeEvent: (data: FinalizeEventInformation) => void;
}

const FinalizeEventDetailsModal = ({
  open,
  setOpen,
  event,
  conflictingEvents,
  finalizeEvent,
  startTime,
  selectedDate
}: FinalizeEventProps) => {
  const [meetingType, setMeetingType] = useState<string[]>([]);
  const currentUser = useCurrentUser();
  const { data: userScheduleSettings } = useUserScheduleSettings(currentUser.userId);

  const createValidationSchema = () =>
    yup.object().shape({
      zoomLink: meetingType.includes('virtual')
        ? yup.string().required('Meeting link is required for virtual meetings').url('Please enter a valid URL')
        : yup.string().optional(),
      location: yup.string().optional(),
      docTemplateLink: yup.string().required('Question Doc is Required')
    });

  const [firstWorkPackage] = event.workPackages;

  const wbsNum = firstWorkPackage
    ? {
        carNumber: firstWorkPackage.wbsElement.carNumber,
        projectNumber: firstWorkPackage.wbsElement.projectNumber,
        workPackageNumber: firstWorkPackage.wbsElement.workPackageNumber
      }
    : { carNumber: 0, projectNumber: 0, workPackageNumber: 0 };

  const eventName = firstWorkPackage?.wbsElement?.name
    ? `${firstWorkPackage.wbsElement.carNumber}.${firstWorkPackage.wbsElement.projectNumber}.${firstWorkPackage.wbsElement.workPackageNumber} - ${firstWorkPackage.wbsElement.name}`
    : event.title;

  const title = `Finalize Event for ${eventName}`;

  const eventConflicts = conflictingEvents.map(
    (_event) => `${wbsPipe(wbsNum)} - ${eventName} at ${meetingStartTimePipeNumbers([startTime])}`
  );

  const defaultValues = {
    docTemplateLink: event.questionDocumentLink ?? '',
    zoomLink: event.zoomLink ?? userScheduleSettings?.personalZoomLink ?? '',
    location: event.location ?? undefined
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(createValidationSchema()),
    defaultValues,
    mode: 'onChange'
  });

  const handleMeetingTypeChange = (_event: any, newMeetingType: string[]) => {
    setMeetingType(newMeetingType);
    reset(defaultValues);
  };

  const onSubmit = async (data: { docTemplateLink: string; zoomLink?: string; location?: string }) => {
    finalizeEvent({ ...data, zoomLink: data.zoomLink ? data.zoomLink : undefined, meetingType });
    setOpen(false);
  };

  useEffect(() => {
    if (userScheduleSettings && !event.zoomLink) {
      reset({
        docTemplateLink: event.questionDocumentLink ?? '',
        zoomLink: userScheduleSettings.personalZoomLink ?? '',
        location: event.location ?? undefined
      });
    }
    if (event.zoomLink === '') {
      reset({
        zoomLink: undefined
      });
    }
  }, [userScheduleSettings, event, reset]);

  return (
    <NERFormModal
      open={open}
      onHide={() => setOpen(false)}
      title={title}
      reset={() => reset(defaultValues)}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      submitText="Schedule"
      formId="finalize-event-form"
    >
      <Box style={{ display: 'flex', marginBottom: 20 }}>
        <Typography style={{ fontSize: '1.2em', marginRight: 90 }}>Meeting Time:</Typography>
        <Typography style={{ fontSize: '1.2em' }}>{`${meetingStartTimePipeNumbers([
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
          <Box style={{ marginRight: 90 }}>
            <Typography style={{ fontSize: '1.2em', marginLeft: -10, display: 'inline' }}>Meeting Link:</Typography>
            <Tooltip
              title="Ensure your Meeting Link is Publicly Accessible and Does Not Require a Password."
              placement="right"
            >
              <HelpIcon style={{ fontSize: 'medium', verticalAlign: 'middle' }} />
            </Tooltip>
          </Box>
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
        {eventConflicts && eventConflicts.length > 0 && (
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
                {eventConflicts.map((conflictDesign, index) => (
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
export default FinalizeEventDetailsModal;
