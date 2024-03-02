/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, ListItemIcon, Menu, MenuItem, Typography, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NERButton } from '../../components/NERButton';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PageLayout from '../../components/PageLayout';
import { DesignReview, DesignReviewStatus } from 'shared';
import MonthSelector from './MonthSelector';
import DayCard from './DayCard';
import FillerCard from './FillerCard';
import { batman } from '../../../../backend/tests/test-data/users.test-data';

const DRCPage = () => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const EventDict = new Map<Number, DesignReview[]>();
  // Test data:
  EventDict.set(new Date().getDate(), [
    {
      designReviewId: 'Meeting',
      dateScheduled: new Date(),
      meetingTimes: [16],
      dateCreated: new Date(),
      userCreated: batman,
      status: DesignReviewStatus.UNCONFIRMED,
      teamType: { teamTypeId: 'Mechanical', name: 'Mechanical' },
      requiredMembers: [],
      optionalMembers: [],
      confirmedMembers: [],
      deniedMembers: [],
      isOnline: false,
      isInPerson: false,
      attendees: [],
      wbsName: 'bruh',
      wbsNum: { carNumber: 1, workPackageNumber: 1, projectNumber: 1 }
    }
  ]);
  console.log(EventDict);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const daysInMonth = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  };

  const paddingDays = (month: Date) => {
    return new Date(month.getFullYear(), month.getMonth(), 0).getDay();
  };

  const paddingArrayStart = [...Array<number>(paddingDays(displayMonth)).keys()].map(
    (day) => daysInMonth(new Date(displayMonth.getDate(), displayMonth.getMonth() - 1, displayMonth.getFullYear())) - day
  );
  const paddingArrayEnd = [...Array<number>(7 - ((daysInMonth(displayMonth) + paddingDays(displayMonth)) % 7)).keys()].map(
    (day) => day + 1
  );
  const daysThisMonth = paddingArrayStart
    .concat([...Array(daysInMonth(displayMonth)).keys()])
    .map((day) => day + 1)
    .concat(paddingArrayEnd.length < 7 ? paddingArrayEnd : []);

  const unconfirmedDRSDropdown = (
    <>
      <NERButton
        endIcon={<ArrowDropDownIcon style={{ fontSize: 28 }} />}
        variant="contained"
        id="unconfirmed-drs-dropdown"
        onClick={handleClick}
      >
        My Unconfirmed DRS
      </NERButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleDropdownClose}>
        <MenuItem
          onClick={() => {
            return;
          }}
        >
          <ListItemIcon>
            <NoteAddIcon fontSize="small" />
          </ListItemIcon>
          Mock Data
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <PageLayout title="Design Review Calendar" headerRight={unconfirmedDRSDropdown}>
      <MonthSelector
        displayMonth={displayMonth}
        setDisplayMonth={(date) => {
          setDisplayMonth(date);
        }}
      ></MonthSelector>
      <Grid container alignItems="center">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
          <Grid item xs={12 / 7}>
            <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        <Grid container>
          {[0, 7, 14, 21, 28, 35].map((week) => (
            <Grid container alignItems="center" justifyContent="center">
              {daysThisMonth.slice(week, week + 7).map((day) => {
                const myDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
                return (
                  <Grid item xs={12 / 7} alignItems="center" justifyContent="center">
                    <Box marginLeft={1.5} marginTop={2}>
                      {day < week - 7 || day < 1 || day > week + 7 ? (
                        <FillerCard day={day} />
                      ) : (
                        <DayCard myDate={myDate} events={EventDict.get(myDate.getDate())}></DayCard>
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

export default DRCPage;
