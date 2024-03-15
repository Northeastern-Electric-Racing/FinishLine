import { DesignReview } from 'shared';
import NERModal from '../../../components/NERModal';
import { Box, Grid, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { DesignReviewDelayModal } from './SummaryComponents/DesignReviewDelayModal';
import StageGateWorkPackageModalContainer from '../../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';

import { getTeamTypeIcon } from '../../../utils/design-review.utils';
import DesignReviewSummaryModalDetails from './SummaryComponents/DesignReviewSummaryModalDetails';
import DesignReviewSummaryModalCheckBox from './SummaryComponents/DesignReviewSummaryCheckbox';
import DesignReviewSummaryModalButtons from './SummaryComponents/DesignReviewSummaryModalButtons';
import DesignReviewSummaryModalAttendees from './SummaryComponents/DesignReviewSummaryModalAttendees';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={designReview.wbsName}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
    >
      <Box width="500px">
        <Box position="absolute" right="16px" top="12px">
          {editing ? (
            <IconButton onClick={() => setEditing(false)}>
              <SaveIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <StageGateWorkPackageModalContainer
          wbsNum={designReview.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />

        <Grid container direction="column">
          <Grid item>
            <DesignReviewSummaryModalDetails designReview={designReview} editing={editing} />
          </Grid>

          <Grid item>
            <DesignReviewSummaryModalAttendees designReview={designReview} />
          </Grid>

          <Grid item>
            <DesignReviewSummaryModalCheckBox
              onChange={(checked) => {
                setChecked(checked);
              }}
              checked={checked}
            />
          </Grid>

          <Grid item>
            <DesignReviewSummaryModalButtons
              designReview={designReview}
              handleStageGateClick={() => setShowStageGateModal(true)}
              handleDelayClick={() => setShowDelayModal(true)}
              checked={checked}
            />
          </Grid>
        </Grid>
      </Box>
    </NERModal>
  );
};

export default DRCSummaryModal;
