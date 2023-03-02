/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { Box, Button, Checkbox, FormControl, FormLabel, Grid, MenuItem, Select, TextField } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChangeEvent, FC } from 'react';
import { faCalendarXmark } from '@fortawesome/free-solid-svg-icons';

interface GanttPageFilterProps {
  car0Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  car1Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  car2Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  status: string;
  statusHandler: (event: SelectChangeEvent) => void;
  selectedTeam: string;
  teamList: string[];
  teamHandler: (event: SelectChangeEvent) => void;
  currentStart: Date | null;
  startHandler: (value: Date | null) => void;
  currentEnd: Date | null;
  endHandler: (value: Date | null) => void;
  expandedHandler: (expanded: boolean) => void;
  resetHandler: () => void;
}

const GanttPageFilter: FC<GanttPageFilterProps> = ({
  car0Handler,
  car1Handler,
  car2Handler,
  status,
  statusHandler,
  teamHandler,
  startHandler,
  endHandler,
  expandedHandler,
  teamList,
  selectedTeam,
  currentStart,
  currentEnd,
  resetHandler
}) => {
  const carFilters = (
    <Grid item container direction="column" xs={5} md={1} sx={{ justifyContent: 'start', alignItems: 'start' }}>
      <Grid item xs={12} md={1}>
        Car
      </Grid>
      <Grid item container xs={10} md={1} sx={{ flexWrap: 'nowrap' }}>
        <Grid item>
          <Checkbox
            defaultChecked
            icon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9 }}>0</Box>
              </Box>
            }
            checkedIcon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#ef4345'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9, color: 'white' }}>0</Box>
              </Box>
            }
            onChange={car0Handler}
            sx={{
              color: 'white',
              '&.Mui-checked': {
                color: '#ef4345'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2rem'
              },
              paddingLeft: 0
            }}
          />
        </Grid>
        <Grid item>
          <Checkbox
            defaultChecked
            icon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9 }}>1</Box>
              </Box>
            }
            checkedIcon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#ef4345'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9, color: 'white' }}>1</Box>
              </Box>
            }
            onChange={car1Handler}
            sx={{
              color: 'white',
              '&.Mui-checked': {
                color: '#ef4345'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2rem'
              },
              paddingLeft: 0
            }}
          />
        </Grid>
        <Grid item>
          <Checkbox
            defaultChecked
            icon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9 }}>2</Box>
              </Box>
            }
            checkedIcon={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid white',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#ef4345'
                }}
              >
                <Box sx={{ fontSize: '1.4rem', marginLeft: 0.9, color: 'white' }}>2</Box>
              </Box>
            }
            onChange={car2Handler}
            sx={{
              color: 'white',
              '&.Mui-checked': {
                color: '#ef4345'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2rem'
              },
              paddingLeft: 0
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  const buttons = (
    <Grid
      item
      container
      xs={12}
      md={3}
      spacing={1}
      sx={{ justifyContent: 'end', alignItems: 'center', alignSelf: 'center', justifySelf: 'end' }}
    >
      <Grid item>
        <Button
          onClick={() => {
            expandedHandler(true);
          }}
          startIcon={<UnfoldMoreIcon />}
        >
          Expand
        </Button>
      </Grid>
      <Grid item>
        <Button
          onClick={() => {
            expandedHandler(false);
          }}
          startIcon={<UnfoldLessIcon />}
        >
          Collapse
        </Button>
      </Grid>
      <Grid item>
        <Button onClick={resetHandler} startIcon={<RestartAltIcon />}>
          Reset
        </Button>
      </Grid>
    </Grid>
  );

  return (
    <PageBlock title="Filters" style={{ flexGrow: 1 }}>
      <Grid container rowSpacing={1} columnSpacing={1} sx={{ justifyContent: 'start', alignItems: 'start' }}>
        {carFilters}
        <Grid item xs={12} md={2}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>Status</FormLabel>
            <Select value={status} onChange={statusHandler}>
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              {Object.values(WbsElementStatus).map((status) => {
                return (
                  <MenuItem key={status} value={status}>
                    {status.length > 50 ? `${status.substring(0, 50)}...` : status}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>Team</FormLabel>
            <Select value={selectedTeam} onChange={teamHandler}>
              <MenuItem value="All Teams">All Teams</MenuItem>
              {teamList.map((team) => (
                <MenuItem key={team} value={team}>
                  {team.length > 50 ? `${team.substring(0, 50)}...` : team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>Start Date</FormLabel>
            <DatePicker
              inputFormat="yyyy-MM-dd"
              onChange={startHandler}
              className={'padding: 10'}
              value={currentStart}
              renderInput={(params) => <TextField autoComplete="off" {...params} />}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl sx={{ width: '100%' }}>
            <FormLabel>End Date</FormLabel>
            <DatePicker
              inputFormat="yyyy-MM-dd"
              onChange={endHandler}
              className={'padding: 10'}
              value={currentEnd}
              renderInput={(params) => <TextField autoComplete="off" {...params} />}
            />
          </FormControl>
        </Grid>
        {buttons}
      </Grid>
    </PageBlock>
  );
};

export default GanttPageFilter;
