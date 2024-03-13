/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DesignReview } from 'shared';
import MonthSelector from './CalendarComponents/MonthSelector';
import CalendarDayCard from './CalendarComponents/CalendarDayCard';
import FillerCalendarDayCard from './CalendarComponents/FillerCalendarDayCard';
import {
  DAY_NAMES,
  EnumToArray,
  calendarPaddingDays,
  daysInMonth,
  testDesignReview1
} from '../../utils/design-review.utils';
import ActionsMenu from '../../components/ActionsMenu';

const CalendarPage = () => {
  const theme = useTheme();

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());

  const EventDict = new Map<Number, DesignReview[]>();
  // TODO remove during wire up ticket
  EventDict.set(new Date().getDate(), [testDesignReview1]);
  EventDict.set(new Date().getDate() + 3, [testDesignReview1, testDesignReview1]);
  EventDict.set(new Date().getDate() + 4, [testDesignReview1, testDesignReview1, testDesignReview1]);

  const startOfEachWeek = [0, 7, 14, 21, 28, 35];

  const isDayInDifferentMonth = (day: number, week: number) => {
    return day < week - 7 || day < 1 || day > week + 7;
  };

  const paddingArrayStart = [...Array<number>(calendarPaddingDays(displayMonthYear)).keys()]
    .map(
      (day) =>
        daysInMonth(new Date(displayMonthYear.getDate(), displayMonthYear.getMonth() - 1, displayMonthYear.getFullYear())) -
        (day + 1)
    )
    .reverse();
  const paddingArrayEnd = [
    ...Array<number>(7 - ((daysInMonth(displayMonthYear) + calendarPaddingDays(displayMonthYear)) % 7)).keys()
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
    <PageLayout
      title="Design Review Calendar"
      headerRight={
        <Stack direction="row" justifyContent="flex-end">
          <MonthSelector displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
          <Box marginTop={0.9} marginLeft={1}>
            {unconfirmedDRSDropdown}
          </Box>
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
        <Grid container>
          {startOfEachWeek.map((week) => (
            <Grid container>
              {daysThisMonth.slice(week, week + 7).map((day) => {
                const cardDate = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), day);
                return (
                  <Grid item xs={12 / 7}>
                    <Box marginLeft={1.5} marginTop={2} sx={{ alignContent: 'center' }}>
                      {isDayInDifferentMonth(day, week) ? (
                        <FillerCalendarDayCard day={day} />
                      ) : (
                        <CalendarDayCard cardDate={cardDate} events={EventDict.get(cardDate.getDate()) ?? []} />
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
