import { Box } from '@mui/material';
import { DesignReview, TeamType } from 'shared';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import { DesignReviewPill } from './DesignReviewPill';
import { meetingStartTimePipe } from '../../../utils/pipes';
import { useState } from 'react';
import DesignReviewSummaryModalCheckBox from './DesignReviewSummaryCheckbox';
import StageGateWorkPackageModalContainer from '../../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import { DesignReviewDelayModal } from './DesignReviewDelayModal';
import DesignReviewSummaryModalButtons from './DesignReviewSummaryModalButtons';

interface DesignReviewSummaryModalDetailsProps {
  designReview: DesignReview;
  teamTypes: TeamType[];
}

const DesignReviewSummaryModalDetails: React.FC<DesignReviewSummaryModalDetailsProps> = ({ designReview, teamTypes }) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);

  return (
    <Box display="flex" flexDirection={'column'} paddingBottom={2} rowGap={2} marginTop="20px">
      <StageGateWorkPackageModalContainer
        wbsNum={designReview.wbsNum}
        modalShow={showStageGateModal}
        handleClose={() => setShowStageGateModal(false)}
        hideStatus
      />
      <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />
      <Box display="flex" justifyContent="space-between" paddingRight={'10px'}>
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
      <Box rowGap={2} display="flex" flexDirection={'column'}>
        <Box display="flex" gap={8} alignItems={'center'}>
          <DesignReviewPill
            isLink
            icon={<DescriptionIcon />}
            linkURL={designReview.docTemplateLink ?? ''}
            displayText={designReview.docTemplateLink ? 'Question Doc' : 'No Doc'}
          />
          <DesignReviewSummaryModalCheckBox
            onChange={(checked) => {
              setChecked(checked);
            }}
            checked={checked}
          />
        </Box>
        <Box display="flex" gap={12} alignItems={'center'}>
          <DesignReviewPill
            isLink
            icon={<VideocamIcon />}
            linkURL={designReview.zoomLink ?? ''}
            displayText={designReview.zoomLink ? 'Zoom Link' : 'No Zoom'}
          />
          {checked && (
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
  );
};

export default DesignReviewSummaryModalDetails;
