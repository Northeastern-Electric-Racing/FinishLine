import { Box, Checkbox, FormControlLabel, Link, Typography } from '@mui/material';
import { Event, EventStatus, TeamType } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { EventPill } from './EventPill';
import { useState } from 'react';
import StageGateWorkPackageModalContainer from '../../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import NERModal from '../../../components/NERModal';
import { useSetEventStatus } from '../../../hooks/calendar.hooks';
import { meetingStartTimePipeScheduleSlot } from '../../../utils/pipes';
import { EventDelayModal } from './EventDelayModal';
import EventSummaryModalButtons from './EventSummaryModalButtons';

interface EventSummaryModalDetailsProps {
  event: Event;
  teamTypes: TeamType[];
  markedStatus: EventStatus;
  setMarkedStatus: (_: EventStatus) => void;
}

const EventSummaryModalDetails: React.FC<EventSummaryModalDetailsProps> = ({
  event,
  teamTypes,
  markedStatus,
  setMarkedStatus
}) => {
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState<boolean>(false);
  const [showUnmarkCompleteModal, setShowUnmarkCompleteModal] = useState<boolean>(false);
  const { mutateAsync } = useSetEventStatus(event.eventId);

  const MarkCompleteModal: React.FC = () => {
    return (
      <NERModal
        open={showMarkCompleteModal}
        title="Mark Event Complete"
        onHide={() => setShowMarkCompleteModal(false)}
        cancelText="No"
        submitText="Yes"
        onSubmit={async () => {
          setShowMarkCompleteModal(false);
          await mutateAsync({ status: EventStatus.DONE });
          setMarkedStatus(EventStatus.DONE);
        }}
      >
        <Typography>Are you sure you want to mark this event as complete?</Typography>
      </NERModal>
    );
  };

  const UnmarkCompleteModal: React.FC = () => {
    return (
      <NERModal
        open={showUnmarkCompleteModal}
        title="Mark Event as Not Complete"
        onHide={() => setShowUnmarkCompleteModal(false)}
        cancelText="No"
        submitText="Yes"
        onSubmit={async () => {
          setShowUnmarkCompleteModal(false);
          await mutateAsync({ status: EventStatus.SCHEDULED });
          setMarkedStatus(EventStatus.SCHEDULED);
        }}
      >
        <Typography>
          Are you sure you want to mark this event as <b>not</b> complete?
        </Typography>
      </NERModal>
    );
  };

  const [firstWorkPackage] = event.workPackages;

  const wbsNum = firstWorkPackage
    ? {
        carNumber: firstWorkPackage.wbsElement.carNumber,
        projectNumber: firstWorkPackage.wbsElement.projectNumber,
        workPackageNumber: firstWorkPackage.wbsElement.workPackageNumber
      }
    : { carNumber: 0, projectNumber: 0, workPackageNumber: 0 };

  return (
    <>
      <Box display="flex" flexDirection={'column'} paddingBottom={2} rowGap={2} marginTop="20px">
        <StageGateWorkPackageModalContainer
          wbsNum={wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <EventDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} event={event} />
        <Box display="flex" gap={3} paddingRight={'10px'}>
          <EventPill icon={<AccessTimeIcon />} displayText={meetingStartTimePipeScheduleSlot(event.scheduledTimes)} />
          <EventPill icon={<LocationOnIcon />} displayText={event.location ? event.location : 'Online'} />
        </Box>
        <Box rowGap={2} display="flex" flexDirection={'column'}>
          <Box display="flex" gap={8} alignItems={'center'}>
            <Box display="flex" gap={1} alignItems={'center'}>
              <DescriptionIcon />
              <Link target="_blank" href={event.questionDocument ?? ''} paddingLeft="4px">
                <Typography fontSize={18}>
                  {event.questionDocument ? 'Question Document' : 'No Question Document'}
                </Typography>
              </Link>
            </Box>

            <FormControlLabel
              label="Mark Event as complete"
              control={
                <Checkbox
                  checked={markedStatus === EventStatus.DONE}
                  onChange={() => {
                    if (markedStatus === EventStatus.DONE) setShowUnmarkCompleteModal(true);
                    else setShowMarkCompleteModal(true);
                  }}
                  sx={{
                    color: 'inherit',
                    '&.Mui-checked': { color: 'inherit' }
                  }}
                />
              }
            />
          </Box>
          <Box display="flex" gap={16} alignItems={'center'}>
            <Box display="flex" gap={1} alignItems={'center'}>
              <VideocamIcon />
              <Link target="_blank" href={event.zoomLink ?? ''} paddingLeft="4px">
                <Typography fontSize={18}>{event.zoomLink ? 'Zoom Link' : 'No Zoom'}</Typography>
              </Link>
            </Box>
            {markedStatus === EventStatus.DONE && (
              <EventSummaryModalButtons
                event={event}
                handleStageGateClick={() => setShowStageGateModal(true)}
                handleDelayClick={() => setShowDelayModal(true)}
                teamTypes={teamTypes}
              />
            )}
          </Box>
        </Box>
      </Box>
      <MarkCompleteModal />
      <UnmarkCompleteModal />
    </>
  );
};

export default EventSummaryModalDetails;
