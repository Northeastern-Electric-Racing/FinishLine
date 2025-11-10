/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Stack, Tooltip, Typography, useMediaQuery, useTheme, Button } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DesignReview, DesignReviewStatus } from 'shared';
import MonthSelector from '../CalendarPage/CalendarComponents/MonthSelector';
import CalendarDayCard, { getTeamTypeIcon } from '../CalendarPage/CalendarComponents/CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import ActionsMenu from '../../components/ActionsMenu';
import { useAllDesignReviews } from '../../hooks/design-reviews.hooks';
import ErrorPage from '../ErrorPage';
import { useCurrentUser } from '../../hooks/users.hooks';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import DRCSummaryModal from '../CalendarPage/DesignReviewSummaryModal';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const NewCalendarPage = () => {
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
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));
  if (isLoading || !allDesignReviews) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  const confirmedDesignReviews = allDesignReviews;

  const eventDict = new Map<string, DesignReview[]>();
  confirmedDesignReviews.sort((designReview1, designReview2) => {
    if (designReview1.dateScheduled.getTime() === designReview2.dateScheduled.getTime()) {
      return designReview1.meetingTimes[0] - designReview2.meetingTimes[0];
    }
    return designReview1.dateScheduled.getTime() - designReview2.dateScheduled.getTime();
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

  const currentUserDesignReviews = allDesignReviews.filter(
    (designReview) => designReview.userCreated.userId === user.userId && designReview.status !== DesignReviewStatus.DONE
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

  const NoDRSButton = () => {
    return [
      {
        title: 'No Design Reviews',
        disabled: true,
        onClick: () => {}
      }
    ];
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
    <ActionsMenu
      title="My Design Reviews"
      buttons={currentUserDesignReviews.length === 0 ? NoDRSButton() : designReviewButtons(currentUserDesignReviews)}
    >
      My Unconfirmed DRs
    </ActionsMenu>
  );

  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;

  return (
    <>
      {unconfirmedDesignReview && (
        <DRCSummaryModal
          open={!!unconfirmedDesignReview}
          onHide={() => {
            setUnconfirmedDesignReview(undefined);
          }}
          designReview={unconfirmedDesignReview as DesignReview}
          teamTypes={allTeamTypes}
        />
      )}
      <PageLayout hidePageTitle>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h4"></Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', columnGap: 1, rowGap: 1 }}>
            {/* New Event Button (does not do anything yet) */}
            <Button
              variant="contained"
              disableElevation
              onClick={() => {}}
              endIcon={<AddCircleOutlineIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />}
              sx={{
                flexShrink: 0,
                height: { xs: 36, sm: 40 },
                px: { xs: 1, sm: 1 },
                textTransform: 'none',
                fontFamily: (t) => t.typography.h4.fontFamily,
                fontSize: { xs: 20, sm: 25 },
                fontWeight: 800,
                color: (t) => t.palette.common.white,
                bgcolor: '#F44336',
                '&:hover': { bgcolor: '#FF0000' },
                '& .MuiButton-endIcon svg': { fontSize: 30 }
              }}
            >
              New Event
            </Button>
            <Tooltip title="Click on a day to schedule an event">
              <HelpOutlineIcon fontSize="medium" sx={{ position: 'relative' }} />
            </Tooltip>
            <Box sx={{ ml: 1, flexBasis: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>{unconfirmedDRSDropdown}</Box>
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Grid container>
              {enumToArray(DAY_NAMES).map((day, index) => (
                <Grid item xs={12 / 7} key={index}>
                  <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
                    {
                      // Day of the week display based on current breakpoint
                      isLargerView ? day : isExtraSmallView ? day.charAt(0) : day.substring(0, 3)
                    }
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <Grid container marginBottom={2}>
                {startOfEachWeek.map((week, weekIndex) => (
                  <Grid container key={weekIndex}>
                    {daysThisMonth.slice(week, week + 7).map((day, dayIndex) => {
                      const cardDate = new Date(
                        displayMonthYear.getFullYear(),
                        displayMonthYear.getMonth() + (isDayInDifferentMonth(day, week) ? (day > 15 ? -1 : 1) : 0),
                        day
                      );
                      return (
                        <Grid item xs={12 / 7} key={dayIndex}>
                          <Box marginTop={2} sx={{ justifyContent: 'center', display: 'flex' }}>
                            <CalendarDayCard
                              cardDate={cardDate}
                              events={
                                eventDict.get(
                                  datePipe(new Date(cardDate.getTime() - cardDate.getTimezoneOffset() * -60000))
                                ) ?? []
                              }
                              teamTypes={allTeamTypes}
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
          <Box
            sx={{
              width: 320
            }}
          >
            <MonthSelector displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default NewCalendarPage;
