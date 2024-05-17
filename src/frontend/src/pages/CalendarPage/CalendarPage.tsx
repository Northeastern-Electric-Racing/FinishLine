/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DesignReview } from 'shared';
import CalendarDayCard, { getTeamTypeIcon } from './CalendarComponents/CalendarDayCard';
import FillerCalendarDayCard from './CalendarComponents/FillerCalendarDayCard';
import { DAY_NAMES, EnumToArray, calendarPaddingDays, daysInMonth, isConfirmed } from '../../utils/design-review.utils';
import ActionsMenu from '../../components/ActionsMenu';
import { useAllDesignReviews } from '../../hooks/design-reviews.hooks';
import ErrorPage from '../ErrorPage';
import { useCurrentUser } from '../../hooks/users.hooks';
import { datePipe } from '../../utils/pipes';
import { useAllTeamTypes } from '../../hooks/design-reviews.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import { DesignReviewAttendeeModal } from './DesignReviewAttendeeModal';
import TodayButton from './CalendarComponents/TodayButton';
import NextPreviousMonthButtons from './CalendarComponents/NextPreviousMonthButtons';

const CalendarPage = () => {
  const theme = useTheme();
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const { isLoading, isError, error, data: allDesignReviews } = useAllDesignReviews();
  const user = useCurrentUser();
  const [unconfirmedDesignReview, setUnconfirmedDesignReview] = useState<DesignReview>();

  if (isLoading || !allDesignReviews) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const confirmedDesignReviews = allDesignReviews.filter(isConfirmed);

  const eventDict = new Map<string, DesignReview[]>();
  confirmedDesignReviews.sort((designReview1, designReview2) => {
    if (designReview1.dateScheduled.getTime() === designReview2.dateScheduled.getTime()) {
      return designReview1.meetingTimes[0] - designReview2.meetingTimes[0];
    } else {
      return designReview1.dateScheduled.getTime() - designReview2.dateScheduled.getTime();
    }
  });

  confirmedDesignReviews.forEach((designReview) => {
    // Accessing the date actually converts it to local time, which causes the date to be off. This is a workaround.
    const date = datePipe(
      new Date(designReview.dateScheduled.getTime() - designReview.dateScheduled.getTimezoneOffset() * -60000)
    );
    if (eventDict.has(date)) {
      eventDict.get(date)?.push(designReview);
    } else {
      eventDict.set(date, [designReview]);
    }
  });

  const unconfirmedDesignReviews = allDesignReviews.filter(
    (designReview) => designReview.userCreated.userId === user.userId && !isConfirmed(designReview)
  );

  const startOfEachWeek = [0, 7, 14, 21, 28, 35];

  const isDayInDifferentMonth = (day: number, week: number) => {
    return day < week - 7 || day < 1 || day > week + 7;
  };

  const designReviewButtons = (designReviews: DesignReview[]) => {
    return designReviews.map((designReview) => {
      return {
        icon: getTeamTypeIcon(designReview.teamType.name),
        title: designReview.wbsName,
        onClick: () => {
          setUnconfirmedDesignReview(designReview);
        },
        disabled: false
      };
    });
  };

  const paddingArrayStart = [...Array<number>(calendarPaddingDays(displayMonthYear)).keys()]
    .map(
      (day) =>
        daysInMonth(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, displayMonthYear.getDate())) -
        day
    )
    .reverse();
  const paddingArrayEnd = [
    ...Array<number>(7 - ((daysInMonth(displayMonthYear) + calendarPaddingDays(displayMonthYear)) % 7)).keys()
  ].map((day) => day + 1);
  const daysThisMonth = paddingArrayStart
    .concat([...Array(daysInMonth(displayMonthYear)).keys()].map((day) => day + 1))
    .concat(paddingArrayEnd.length < 7 ? paddingArrayEnd : []);

  const unconfirmedDRSDropdown = (
    <ActionsMenu title="My Unconfirmed DRS" buttons={designReviewButtons(unconfirmedDesignReviews)}>
      My Unconfirmed DRs
    </ActionsMenu>
  );

  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;

  return (
    <>
      {unconfirmedDesignReview && (
        <DesignReviewAttendeeModal
          open={!!unconfirmedDesignReview}
          onHide={() => {
            setUnconfirmedDesignReview(undefined);
          }}
          designReview={unconfirmedDesignReview as DesignReview}
        />
      )}
      <PageLayout
        title="Calendar"
        headerRight={<Box marginLeft={1}>{unconfirmedDRSDropdown}</Box>}
        chips={
          <Stack direction="row" spacing={4} alignItems="center" marginLeft={5}>
            <TodayButton displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
            <NextPreviousMonthButtons displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
            <Typography variant="h5">
              {displayMonthYear.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </Typography>
          </Stack>
        }
      >
        <Grid container>
          {EnumToArray(DAY_NAMES).map((day) => (
            <Grid item xs={12 / 7}>
              <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Grid container marginBottom={2}>
            {startOfEachWeek.map((week) => (
              <Grid container>
                {daysThisMonth.slice(week, week + 7).map((day) => {
                  const cardDate = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), day);
                  return (
                    <Grid item xs={12 / 7}>
                      <Box marginLeft={1.5} marginTop={2} sx={{ justifyContent: 'center', display: 'flex' }}>
                        {isDayInDifferentMonth(day, week) ? (
                          <FillerCalendarDayCard day={day} />
                        ) : (
                          <CalendarDayCard
                            cardDate={cardDate}
                            events={
                              eventDict.get(
                                datePipe(new Date(cardDate.getTime() - cardDate.getTimezoneOffset() * -60000))
                              ) ?? []
                            }
                            teamTypes={allTeamTypes}
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ))}
          </Grid>
        </Box>
      </PageLayout>
    </>
  );
};

export default CalendarPage;
