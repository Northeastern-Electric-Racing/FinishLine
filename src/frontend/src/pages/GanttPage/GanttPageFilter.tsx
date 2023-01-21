/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from 'shared';
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined';
import LooksTwoOutlinedIcon from '@mui/icons-material/LooksTwoOutlined';
import PageBlock from '../../layouts/PageBlock';
import { Button, Checkbox, FormControl, FormLabel, Grid, MenuItem, Select, TextField } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { ChangeEvent, FC } from 'react';

interface GanttPageFilterProps {
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
}

const GanttPageFilter: FC<GanttPageFilterProps> = ({
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
  currentEnd
}) => (
  <PageBlock title="Filters" style={{ flexGrow: 1 }}>
    <Grid container rowSpacing={1} columnSpacing={1} sx={{ justifyContent: 'start', alignItems: 'start' }}>
      <Grid item container direction="column" xs={12} md={1} sx={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
        <Grid item xs={12} md={1}>
          Car
        </Grid>
        <Grid item container xs={12} md={1} sx={{ justifyContent: 'space-evenly', alignItems: 'center' }}>
          <Grid item>
            <Checkbox
              defaultChecked
              icon={<LooksOneOutlinedIcon />}
              checkedIcon={<LooksOneOutlinedIcon />}
              onChange={car1Handler}
              sx={{
                color: 'white',
                '&.Mui-checked': {
                  color: '#ef4345'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '2rem'
                }
              }}
            />
          </Grid>
          <Grid item>
            <Checkbox
              defaultChecked
              icon={<LooksTwoOutlinedIcon />}
              checkedIcon={<LooksTwoOutlinedIcon />}
              onChange={car2Handler}
              sx={{
                color: 'white',
                '&.Mui-checked': {
                  color: '#ef4345'
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '2rem'
                }
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={2}>
        <FormControl sx={{ width: '100%' }}>
          <FormLabel>Status</FormLabel>
          <Select value={status} onChange={statusHandler}>
            <MenuItem value="All Statuses">All Statuses</MenuItem>
            {Object.values(WbsElementStatus).map((status) => {
              return <MenuItem value={status}>{status}</MenuItem>;
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
              <MenuItem value={team}>{team}</MenuItem>
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
      <Grid
        item
        container
        xs={12}
        md={3}
        sx={{ justifyContent: 'end', alignItems: 'center', alignSelf: 'center', justifySelf: 'end' }}
      >
        <Grid item>
          <Button
            color="secondary"
            size="large"
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
            color="secondary"
            size="large"
            onClick={() => {
              expandedHandler(false);
            }}
            startIcon={<UnfoldLessIcon />}
          >
            Collapse
          </Button>
        </Grid>
      </Grid>
    </Grid>
  </PageBlock>
);

export default GanttPageFilter;
