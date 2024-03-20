import { Grid } from '@mui/material';
import { DesignReview, User } from 'shared';
import { useState } from 'react';
import AvailabilityScheduleView from './AvailabilityScheduleView';
import UserAvailabilites from './UserAvailabilitesView';
import { getWeekDateRange } from '../../../utils/design-review.utils';
import { dateRangePipe } from '../../../utils/pipes';

interface AvailabilityViewProps {
  usersToAvailabilities: Map<User, number[]>;
  designReview: DesignReview;
  selectedDate: Date;
  allDesignReviews: DesignReview[];
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  usersToAvailabilities,
  designReview,
  selectedDate,
  allDesignReviews
}) => {
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const existingMeetingData = new Map<number, string>();

  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);
  const [startDateRange, endDateRange] = getWeekDateRange(selectedDate);

  const currentWeekDesignReviews = allDesignReviews.filter((currDr) => {
    const drDate = new Date(currDr.dateScheduled).getTime();
    const startRange = startDateRange.getTime();
    const endRange = endDateRange.getTime();

    return drDate >= startRange && drDate <= endRange;
  });

  const conflictingDesignReviews = allDesignReviews.filter(
    (currDr) =>
      currDr.dateScheduled.toLocaleDateString() === selectedDate.toLocaleDateString() &&
      allDesignReviews.some((designReview) =>
        designReview.meetingTimes.some((time) => currDr.meetingTimes.includes(time))
      ) &&
      currDr.designReviewId !== designReview.designReviewId
  );

  currentWeekDesignReviews.forEach((designReview) =>
    designReview.meetingTimes.forEach((meetingTime) => existingMeetingData.set(meetingTime, 'build'))
  );

  return (
    <Grid container>
      <Grid item xs={9}>
        <AvailabilityScheduleView
          availableUsers={availableUsers}
          unavailableUsers={unavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          existingMeetingData={existingMeetingData}
          setCurrentAvailableUsers={setCurrentAvailableUsers}
          setCurrentUnavailableUsers={setCurrentUnavailableUsers}
          dateRangeTitle={dateRangePipe(startDateRange, endDateRange)}
        />
      </Grid>
      <Grid item xs={3}>
        <UserAvailabilites
          currentAvailableUsers={currentAvailableUsers}
          currentUnavailableUsers={currentUnavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          designReview={designReview}
          selectedDate={selectedDate}
          conflictingDesignReviews={conflictingDesignReviews}
        />
      </Grid>
    </Grid>
  );
};

export default AvailabilityView;
