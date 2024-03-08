/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DesignReview } from 'shared';
import MonthSelector from './CalendarComponents/MonthSelector';
import DayCard from './CalendarComponents/CalendarDayCard';
import FillerCard from './CalendarComponents/FillerCalendarDayCard';
import { DAY_NAMES, EnumToArray, testDesignReview1 } from '../../utils/design-review.utils';
import ActionsMenu from '../../components/ActionsMenu';

const CalendarPage = () => {
  const theme = useTheme();

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());

  const EventDict = new Map<Number, DesignReview[]>();
  // TODO remove during wire up ticket
  EventDict.set(new Date().getDate(), [testDesignReview1]);

  const startOfEachWeek = [0, 7, 14, 21, 28, 35];

  const isDayInDifferentMonth = (day: number, week: number) => {
    return day < week - 7 || day < 1 || day > week + 7;
  };

  const daysInMonth = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  };

  const paddingDays = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth(), 0).getDay();
  };

  const paddingArrayStart = [...Array<number>(paddingDays(displayMonthYear)).keys()].map(
    (day) =>
      daysInMonth(new Date(displayMonthYear.getDate(), displayMonthYear.getMonth() - 1, displayMonthYear.getFullYear())) -
      day
  );
  const paddingArrayEnd = [
    ...Array<number>(7 - ((daysInMonth(displayMonthYear) + paddingDays(displayMonthYear)) % 7)).keys()
  ].map((day) => day + 1);
  const daysThisMonth = paddingArrayStart
    .concat([...Array(daysInMonth(displayMonthYear)).keys()])
    .map((day) => day + 1)
    .concat(paddingArrayEnd.length < 7 ? paddingArrayEnd : []);

  const unconfirmedDRSDropdown = (
    <ActionsMenu
      title="My Unconfirmed DRS"
      buttons={[
        {
          title: 'Mock Review #1',
          onClick: () => {},
          disabled: false
        },
        {
          title: 'Mock Review #2',
          onClick: () => {},
          disabled: false
        }
      ]}
    >
      My Unconfirmed DRs
    </ActionsMenu>
  );

  return (
    <PageLayout title="Design Review Calendar" headerRight={unconfirmedDRSDropdown}>
      <MonthSelector displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
      <Grid container alignItems="center">
        {EnumToArray(DAY_NAMES).map((day) => (
          <Grid item xs={12 / 7}>
            <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        <Grid container>
          {startOfEachWeek.map((week) => (
            <Grid container alignItems="center" justifyContent="center">
              {daysThisMonth.slice(week, week + 7).map((day) => {
                const myDate = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), day);
                return (
                  <Grid item xs={12 / 7} alignItems="center" justifyContent="center">
                    <Box marginLeft={1.5} marginTop={2}>
                      {isDayInDifferentMonth(day, week) ? (
                        <FillerCard day={day} />
                      ) : (
                        <DayCard myDate={myDate} events={EventDict.get(myDate.getDate()) ?? []} />
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
  );
};

export default CalendarPage;
