/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DesignReviewCard from './DesignReviewCard';
import { useAllDesignReviews } from '../../../hooks/design-reviews.hooks';
import ErrorPage from '../../ErrorPage';
import { wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import { Box } from '@mui/material';
import { Error } from '@mui/icons-material';

const NoUpcomingDesignReviewsDisplay: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <EmptyPageBlockDisplay
        icon={<Error sx={{ fontSize: 70 }} />}
        heading={'No Upcoming Design Reviews'}
        message={'There are no Upcoming Design Reviews to Display'}
      />
    </Box>
  );
};

const UpcomingDesignReviews: React.FC = () => {
  const { data: designReviews, isLoading, isError, error } = useAllDesignReviews();

  if (isLoading || !designReviews) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredDesignReviews = designReviews.filter((review) => {
    const scheduledDate = review.dateScheduled;
    const currentDate = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(currentDate.getDate() + 14);
    return scheduledDate >= currentDate && scheduledDate <= inTwoWeeks && !review.status.includes('DONE');
  });

  const fullDisplay = (
    <ScrollablePageBlock title={`Upcoming Design Reviews (${designReviews.length})`}>
      {designReviews.length === 0 ? (
        <NoUpcomingDesignReviewsDisplay />
      ) : (
        designReviews.map((d) => <DesignReviewCard key={wbsPipe(d.wbsNum)} designReview={d} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default UpcomingDesignReviews;
