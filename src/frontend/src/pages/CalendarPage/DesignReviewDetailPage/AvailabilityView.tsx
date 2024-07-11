import { Grid } from '@mui/material';
import {
  DesignReview,
  DesignReviewStatus,
  getAvailabilityForGivenWeekOfDateOrMostRecent,
  User,
  UserWithScheduleSettings
} from 'shared';
import { useState } from 'react';
import AvailabilityScheduleView from './AvailabilityScheduleView';
import UserAvailabilites from './UserAvailabilitesView';
import { getWeekDateRange } from '../../../utils/design-review.utils';
import { dateRangePipe } from '../../../utils/pipes';
import { FinalizeReviewInformation } from './DesignReviewDetailPage';

interface AvailabilityViewProps {
  designReview: DesignReview;
  allDesignReviews: DesignReview[];
  allUsers: UserWithScheduleSettings[];
  handleEdit: (data?: FinalizeReviewInformation) => void;
  selectedDate: Date;
  setSelectDate: (date: Date) => void;
  startTime: number;
  endTime: number;
  setStartTime: (time: number) => void;
  setEndTime: (time: number) => void;
  requiredUserIds: string[];
  optionalUserIds: string[];
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  designReview,
  allDesignReviews,
  allUsers,
  handleEdit,
  selectedDate,
  setSelectDate,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  requiredUserIds,
  optionalUserIds
}) => {
  const availableUsers = new Map<number, User[]>();
  const unavailableUsers = new Map<number, User[]>();
  const existingMeetingData = new Map<number, string>();
  const usersToAvailabilities = new Map<User, number[]>();

  const [currentAvailableUsers, setCurrentAvailableUsers] = useState<User[]>([]);
  const [currentUnavailableUsers, setCurrentUnavailableUsers] = useState<User[]>([]);
  const [startDateRange, endDateRange] = getWeekDateRange(selectedDate);

  const currentWeekDesignReviews = allDesignReviews.filter((currDr) => {
    const drDate = new Date(currDr.dateScheduled).getTime();
    const startRange = startDateRange.getTime();
    const endRange = endDateRange.getTime();

    return drDate >= startRange && drDate <= endRange;
  });

  const convertTimeSlotToDate = (index: number) => {
    const day = Math.floor(index / 12);
    const date = new Date(startDateRange);
    date.setDate(date.getDate() + day);
    return date;
  };

  const onSelectedTimeslotChanged = (index: number | null) => {
    if (index === null) return;
    const date = convertTimeSlotToDate(index);
    const startTime = index % 12;
    setStartTime(startTime);
    setEndTime(startTime + 1);
    setSelectDate(date);
  };

  const conflictingDesignReviews = allDesignReviews.filter((currDr) => {
    const day = selectedDate.getDay();
    const adjustedDay = day === 0 ? 6 : day - 1;
    const times = [];
    for (let i = adjustedDay * 12 + startTime; i < adjustedDay * 12 + endTime; i++) {
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
      const availability = getAvailabilityForGivenWeekOfDateOrMostRecent(
        user.scheduleSettings?.availabilities ?? [],
        selectedDate
      );

      usersToAvailabilities.set(user, availability?.availability ?? []);
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
          onSelectedTimeslotChanged={onSelectedTimeslotChanged}
        />
      </Grid>
      <Grid item xs={3}>
        <UserAvailabilites
          currentAvailableUsers={currentAvailableUsers}
          currentUnavailableUsers={currentUnavailableUsers}
          usersToAvailabilities={usersToAvailabilities}
          designReview={designReview}
          conflictingDesignReviews={conflictingDesignReviews}
          handleEdit={handleEdit}
          selectedDate={selectedDate}
          startTime={startTime}
        />
      </Grid>
    </Grid>
  );
};

export default AvailabilityView;
