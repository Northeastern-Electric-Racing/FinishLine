/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DesignReviewCard from './DesignReviewCard';
import { useAllDesignReviews } from '../../../hooks/design-reviews.hooks';
import ErrorPage from '../../ErrorPage';
import { AuthenticatedUser, DesignReviewStatus, wbsPipe } from 'shared';
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
    <EmptyPageBlockDisplay
      icon={<Error sx={{ fontSize: 70 }} />}
      heading={'No Upcoming Design Reviews'}
      message={'There are no Upcoming Design Reviews to Display'}
    />
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

    const memberUserIds = [
      ...review.requiredMembers.map((user) => user.userId),
      ...review.optionalMembers.map((user) => user.userId)
    ];
    return (
      scheduledDate >= currentDate &&
      scheduledDate <= inTwoWeeks &&
      review.status !== DesignReviewStatus.DONE &&
      memberUserIds.includes(user.userId)
    );
  });

  const fullDisplay = (
    <ScrollablePageBlock title={`Upcoming Design Reviews (${filteredDesignReviews.length})`}>
      {filteredDesignReviews.length === 0 ? (
        <NoUpcomingDesignReviewsDisplay />
      ) : (
        filteredDesignReviews.map((d) => <DesignReviewCard key={wbsPipe(d.wbsNum)} designReview={d} user={user} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default UpcomingDesignReviews;
