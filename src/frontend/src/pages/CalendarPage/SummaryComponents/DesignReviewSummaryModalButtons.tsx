import { Box } from '@mui/system';
import { DesignReview, TeamType } from 'shared';
import { NERButton } from '../../../components/NERButton';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { DesignReviewCreateModal } from '../DesignReviewCreateModal';
import { useState } from 'react';

interface DesignReviewSummaryModalButtonsProps {
  designReview: DesignReview;
  handleStageGateClick: () => void;
  handleDelayClick: () => void;
  teamTypes: TeamType[];
}

const DesignReviewSummaryModalButtons: React.FC<DesignReviewSummaryModalButtonsProps> = ({
  designReview,
  handleDelayClick,
  handleStageGateClick,
  teamTypes
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column" rowGap={1}>
      {isCreateModalOpen && (
        <DesignReviewCreateModal
          showModal={isCreateModalOpen}
          handleClose={() => {
            setIsCreateModalOpen(false);
          }}
          teamTypes={teamTypes}
          defaultDate={new Date()}
          defaultWbsNum={designReview.wbsNum}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <NERFailButton
          sx={{
            marginLeft: 1,
            fontWeight: 'bold',
            fontSize: 13
          }}
          onClick={handleDelayClick}
        >
          Request Delay
        </NERFailButton>
        <NERSuccessButton
          sx={{
            marginLeft: 1,
            fontWeight: 'bold',
            fontSize: 13
          }}
          onClick={handleStageGateClick}
        >
          Stage Gate
        </NERSuccessButton>
      </Box>
      <NERButton
        sx={{
          marginLeft: 1
        }}
        whiteVariant
        onClick={() => setIsCreateModalOpen(true)}
      >
        Schedule Another DR
      </NERButton>
    </Box>
  );
};

export default DesignReviewSummaryModalButtons;
