/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Grid, ListItemIcon, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { NERButton } from '../../components/NERButton';
import { useCurrentUser } from '../../hooks/users.hooks';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PageLayout from '../../components/PageLayout';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { isGuest } from 'shared';
import MonthSelector from './MonthSelector';
import DayCard from './DayCard';

const DRCPage = () => {
  const user = useCurrentUser();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const paddingDays = (month: number, year: number) => {
    return new Date(year, month, 0).getDay() - 1 > 0 ? new Date(year, month, 0).getDay() - 1 : 0;
  };

  const daysThisMonth = Array<number>(paddingDays(displayMonth.getMonth(), displayMonth.getFullYear()))
    .fill(0)
    .concat([...Array(daysInMonth(displayMonth.getMonth(), displayMonth.getFullYear())).keys()]);

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
        <MenuItem onClick={() => history.push(routes.NEW_REIMBURSEMENT_REQUEST)} disabled={isGuest(user.role)}>
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
      <Grid container>
        <Grid container>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <Grid item xs={12 / 7}>
              <Typography>{day}</Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container>
          {daysThisMonth.slice(0, 7).map((day) => {
            const myDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            console.log(myDate);
            return (
              <Grid item xs={12 / 7}>
                <DayCard myDate={myDate} events={[]}></DayCard>
              </Grid>
            );
          })}
        </Grid>
        <Grid container>
          {daysThisMonth.slice(7, 14).map((day) => {
            const myDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            console.log(myDate);
            return (
              <Grid item xs={12 / 7}>
                <DayCard myDate={myDate} events={[]}></DayCard>
              </Grid>
            );
          })}
        </Grid>
        <Grid container>
          {daysThisMonth.slice(14, 21).map((day) => {
            const myDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            console.log(myDate);
            return (
              <Grid item xs={12 / 7}>
                <DayCard myDate={myDate} events={[]}></DayCard>
              </Grid>
            );
          })}
        </Grid>
        <Grid container>
          {daysThisMonth.slice(21, 28).map((day) => {
            const myDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
            console.log(myDate);
            return (
              <Grid item xs={12 / 7}>
                <DayCard myDate={myDate} events={[]}></DayCard>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default DRCPage;
