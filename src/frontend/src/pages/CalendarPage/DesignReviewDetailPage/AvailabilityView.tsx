import { Grid } from '@mui/material';
import { DesignReview, DesignReviewStatus, User, UserWithScheduleSettings } from 'shared';
import { useState } from 'react';
import AvailabilityScheduleView from './AvailabilityScheduleView';
import UserAvailabilites from './UserAvailabilitesView';
import { getWeekDateRange } from '../../../utils/design-review.utils';
import { dateRangePipe } from '../../../utils/pipes';
import { DesignReviewEditData } from './DesignReviewDetailPage';

interface AvailabilityViewProps {
  designReview: DesignReview;
  allDesignReviews: DesignReview[];
  allUsers: UserWithScheduleSettings[];
  editPayload: DesignReviewEditData;
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({ designReview, allDesignReviews, allUsers, editPayload }) => {
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const existingMeetingData = new Map<number, string>();
  const usersToAvailabilities = new Map<User, number[]>();

  const { selectedDate, requiredUserIds, optionalUserIds } = editPayload;

  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);
  const [startDateRange, endDateRange] = getWeekDateRange(selectedDate);

  const currentWeekDesignReviews = allDesignReviews.filter((currDr) => {
    const drDate = new Date(currDr.dateScheduled).getTime();
    const startRange = startDateRange.getTime();
    const endRange = endDateRange.getTime();

    return drDate >= startRange && drDate <= endRange;
  });

  const conflictingDesignReviews = allDesignReviews.filter((currDr) => {
    const day = editPayload.selectedDate.getDay();
    const adjustedDay = day === 0 ? 6 : day - 1;
    const times = [];
    for (let i = adjustedDay * 12 + editPayload.startTime; i < adjustedDay * 12 + editPayload.endTime; i++) {
      times.push(i);
    }
    const cleanDate = new Date(currDr.dateScheduled.getTime() - currDr.dateScheduled.getTimezoneOffset() * -60000);
    return (
      currDr.status === DesignReviewStatus.SCHEDULED &&
      cleanDate.toLocaleDateString() === selectedDate.toLocaleDateString() &&
      times.some((time) => currDr.meetingTimes.includes(time)) &&
      currDr.designReviewId !== designReview.designReviewId
    );
  });

  currentWeekDesignReviews.forEach((dr) =>
    dr.meetingTimes.forEach((meetingTime) => {
      if (dr.status === DesignReviewStatus.SCHEDULED && dr.designReviewId !== designReview.designReviewId)
        existingMeetingData.set(meetingTime, dr.teamType.iconName);
    })
  );

  allUsers
    .filter((user) => requiredUserIds.concat(optionalUserIds).includes(user.userId))
    .forEach((user: UserWithScheduleSettings) => {
      usersToAvailabilities.set(user, user.scheduleSettings?.availability ?? []);
    });

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
          conflictingDesignReviews={conflictingDesignReviews}
          editPayload={editPayload}
        />
      </Grid>
    </Grid>
  );
};

export default AvailabilityView;
