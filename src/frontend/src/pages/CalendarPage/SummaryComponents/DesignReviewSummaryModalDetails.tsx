import { Box, Checkbox, FormControlLabel, Link, Typography } from '@mui/material';
import { DesignReview, DesignReviewStatus, TeamType } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from './DesignReviewPill';
import { meetingStartTimePipe } from '../../../utils/pipes';
import { useState } from 'react';
import StageGateWorkPackageModalContainer from '../../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import { DesignReviewDelayModal } from './DesignReviewDelayModal';
import DesignReviewSummaryModalButtons from './DesignReviewSummaryModalButtons';
import NERModal from '../../../components/NERModal';
import { useSetDesignReviewStatus } from '../../../hooks/design-reviews.hooks';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
  teamTypes: TeamType[];
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({ designReview, teamTypes }) => {
  const [markCompleteChecked, setMarkCompleteChecked] = useState<boolean>(designReview.status === DesignReviewStatus.DONE);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState<boolean>(false);
  const [showUnmarkCompleteModal, setShowUnmarkCompleteModal] = useState<boolean>(false);
  const { mutateAsync } = useSetDesignReviewStatus(designReview.designReviewId);

  const MarkCompleteModal: React.FC = () => {
    return (
      <NERModal
        open={showMarkCompleteModal}
        title="Mark Design Review Complete"
        onHide={() => setShowMarkCompleteModal(false)}
        cancelText="No"
        submitText="Yes"
        onSubmit={async () => {
          await mutateAsync({ status: DesignReviewStatus.DONE });
          setMarkCompleteChecked(true);
          setShowMarkCompleteModal(false);
        }}
      >
        <Typography>Are you sure you want to mark this design review as complete?</Typography>
      </NERModal>
    );
  };

  const UnmarkCompleteModal: React.FC = () => {
    return (
      <NERModal
        open={showUnmarkCompleteModal}
        title="Mark Design Review as Not Complete"
        onHide={() => setShowUnmarkCompleteModal(false)}
        cancelText="No"
        submitText="Yes"
        onSubmit={async () => {
          await mutateAsync({ status: DesignReviewStatus.SCHEDULED });
          setMarkCompleteChecked(false);
          setShowUnmarkCompleteModal(false);
        }}
      >
        <Typography>
          Are you sure you want to mark this design review as <b>not</b> complete?
        </Typography>
      </NERModal>
    );
  };

  return (
    <>
      <Box display="flex" flexDirection={'column'} paddingBottom={2} rowGap={2} marginTop="20px">
        <StageGateWorkPackageModalContainer
          wbsNum={designReview.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />
        <Box display="flex" gap={3} paddingRight={'10px'}>
          <DesignReviewPill icon={<AccessTimeIcon />} displayText={meetingStartTimePipe(designReview.meetingTimes)} />
          <DesignReviewPill
            icon={<LocationOnIcon />}
            displayText={designReview.location ? designReview.location : 'Online'}
          />
        </Box>
        <Box rowGap={2} display="flex" flexDirection={'column'}>
          <Box display="flex" gap={8} alignItems={'center'}>
            <Box display="flex" gap={1} alignItems={'center'}>
              <DescriptionIcon />
              <Link target="_blank" href={designReview.docTemplateLink ?? ''} paddingLeft="4px">
                <Typography fontSize={18}>
                  {designReview.docTemplateLink ? 'Question Document' : 'No Question Document'}
                </Typography>
              </Link>
            </Box>
            <FormControlLabel
              label="Mark Design Review as complete"
              control={
                <Checkbox
                  checked={markCompleteChecked}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.checked) setShowMarkCompleteModal(true);
                    else setShowUnmarkCompleteModal(true);
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
              <Link target="_blank" href={designReview.zoomLink ?? ''} paddingLeft="4px">
                <Typography fontSize={18}>{designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}</Typography>
              </Link>
            </Box>
            {markCompleteChecked && (
              <DesignReviewSummaryModalButtons
                designReview={designReview}
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

export default DesignReviewSummaryModalDetails;
