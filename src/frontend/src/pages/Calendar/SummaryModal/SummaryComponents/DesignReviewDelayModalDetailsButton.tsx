import { Box } from '@mui/system';
import { DesignReview } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../../utils/routes';
import NERFailButton from '../../../../components/NERFailButton';

interface DesignReviewSummaryModalDetailsButtonProps {
  designReview: DesignReview;
}

const DesignReviewSummaryModalDetailsButton: React.FC<DesignReviewSummaryModalDetailsButtonProps> = ({ designReview }) => {
  return (
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
      to={`${routes.CALENDAR}/1`}
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
  );
};

export default DesignReviewSummaryModalDetailsButton;
