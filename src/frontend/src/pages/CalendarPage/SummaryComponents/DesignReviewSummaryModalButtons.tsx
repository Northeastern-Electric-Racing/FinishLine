import { Box } from '@mui/system';
import { DesignReview } from 'shared';
import { NERButton } from '../../../components/NERButton';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';

interface DesignReviewSummaryModalButtonsProps {
  designReview: DesignReview;
  checked: boolean;
  handleStageGateClick: () => void;
  handleDelayClick: () => void;
}

const DesignReviewSummaryModalButtons: React.FC<DesignReviewSummaryModalButtonsProps> = ({
  designReview,
  checked,
  handleDelayClick,
  handleStageGateClick
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      <NERButton
        sx={{
          marginLeft: 1
        }}
        disabled={!checked}
        whiteVariant
      >
        Schedule Another DR
      </NERButton>
      <NERSuccessButton
        sx={{
          marginLeft: 1,
          fontWeight: 'bold',
          fontSize: 13
        }}
        onClick={handleStageGateClick}
        disabled={!checked}
      >
        Stage Gate
      </NERSuccessButton>
      <NERFailButton
        sx={{
          marginLeft: 1,
          fontWeight: 'bold',
          fontSize: 13
        }}
        onClick={handleDelayClick}
        disabled={!checked}
      >
        Request Delay to WP
      </NERFailButton>
    </Box>
  );
};

export default DesignReviewSummaryModalButtons;
