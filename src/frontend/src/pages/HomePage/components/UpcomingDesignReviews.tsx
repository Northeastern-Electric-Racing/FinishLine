/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DesignReviewCard from './DesignReviewCard';
import { useAllDesignReviews } from '../../../hooks/design-reviews.hooks';
import ErrorPage from '../../ErrorPage';
import { AuthenticatedUser, wbsPipe } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import { Box } from '@mui/material';
import { Error } from '@mui/icons-material';

interface UpcomingDesignReviewProps {
  user: AuthenticatedUser;
}

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

const UpcomingDesignReviews: React.FC<UpcomingDesignReviewProps> = ({ user }) => {
  const { data: designReviews, isLoading, isError, error } = useAllDesignReviews();

  if (isLoading || !designReviews) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredDesignReviews = designReviews.filter((review) => {
    const scheduledDate = review.dateScheduled;
    const currentDate = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(currentDate.getDate() + 14);

    /*
  Since this is on the leads page, leads shouldn't see all design reviews here. 
  We should filter the design reviews on whether the current user is found the the 
  design review's required or optional members field
*/
    return (
      scheduledDate >= currentDate &&
      scheduledDate <= inTwoWeeks &&
      !review.status.includes('DONE') &&
      (review.requiredMembers.includes(user) || review.optionalMembers.includes(user))
    );
  });

  const fullDisplay = (
    <ScrollablePageBlock title={`Upcoming Design Reviews (${designReviews.length})`}>
      {designReviews.length === 0 ? (
        <NoUpcomingDesignReviewsDisplay />
      ) : (
        designReviews.map((d) => <DesignReviewCard key={wbsPipe(d.wbsNum)} designReview={d} user={user} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default UpcomingDesignReviews;
