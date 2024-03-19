import { DesignReview } from 'shared';
import NERModal from '../../components/NERModal';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { DesignReviewDelayModal } from './SummaryComponents/DesignReviewDelayModal';
import StageGateWorkPackageModalContainer from '../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import DesignReviewSummaryModalDetails from './SummaryComponents/DesignReviewSummaryModalDetails';
import DesignReviewSummaryModalCheckBox from './SummaryComponents/DesignReviewSummaryCheckbox';
import DesignReviewSummaryModalButtons from './SummaryComponents/DesignReviewSummaryModalButtons';
import DesignReviewSummaryModalAttendees from './SummaryComponents/DesignReviewSummaryModalAttendees';
import { getTeamTypeIcon } from './CalendarComponents/CalendarDayCard';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../utils/routes';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  console.log(designReview);
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={designReview.wbsName}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
    >
      <Box minWidth="500px">
        <Box position="absolute" right="16px" top="12px">
          <IconButton component={RouterLink} to={`${routes.CALENDAR}/${designReview.designReviewId}`}>
            <EditIcon />
          </IconButton>
        </Box>
        <StageGateWorkPackageModalContainer
          wbsNum={designReview.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />
        <Box>
          <DesignReviewSummaryModalDetails designReview={designReview} />
          <DesignReviewSummaryModalAttendees designReview={designReview} />
          <DesignReviewSummaryModalCheckBox
            onChange={(checked) => {
              setChecked(checked);
            }}
            checked={checked}
          />
          <DesignReviewSummaryModalButtons
            designReview={designReview}
            handleStageGateClick={() => setShowStageGateModal(true)}
            handleDelayClick={() => setShowDelayModal(true)}
            checked={checked}
          />
        </Box>
      </Box>
    </NERModal>
  );
};

export default DRCSummaryModal;
