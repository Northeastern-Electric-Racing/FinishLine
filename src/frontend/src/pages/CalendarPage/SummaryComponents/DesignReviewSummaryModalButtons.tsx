import { Box } from '@mui/system';
import { DesignReview, DesignReviewStatus } from 'shared';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
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
    <>
      {checked ? (
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
            disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
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
            disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
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
            disabled={designReview.status !== DesignReviewStatus.DONE || !checked}
          >
            Request Delay to WP
          </NERFailButton>
        </Box>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'row',
            textDecoration: 'none'
          }}
          component={RouterLink}
          to={`${routes.CALENDAR}/${designReview.designReviewId}`}
        >
          <NERFailButton
            sx={{
              marginLeft: 1,
              fontWeight: 'bold',
              fontSize: 13
            }}
          >
            Finalize Design Review
          </NERFailButton>
        </Box>
      )}
    </>
  );
};

export default DesignReviewSummaryModalButtons;
