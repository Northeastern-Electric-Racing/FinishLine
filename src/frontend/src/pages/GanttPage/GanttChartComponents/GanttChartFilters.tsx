/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Checkbox, Chip, IconButton, Typography, useTheme } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChangeEvent } from 'react';

const FilterChipButton = ({
  buttonText,
  onChange,
  defaultChecked,
  checked
}: {
  buttonText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  defaultChecked: boolean;
  checked: boolean;
}) => {
  const theme = useTheme();

  return (
    <Checkbox
      onChange={onChange}
      sx={{
        '&:hover': {
          backgroundColor: 'transparent'
        }
      }}
      icon={<Chip label={buttonText} sx={{ borderRadius: '20px', paddingX: 1 }} />}
      checkedIcon={
        <Chip label={buttonText} sx={{ borderRadius: '20px', paddingX: 1, backgroundColor: theme.palette.primary.main }} />
      }
      defaultChecked={defaultChecked}
      checked={checked}
    />
  );
};

const FilterRow = ({
  label,
  buttons
}: {
  label: string;
  buttons: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void; defaultChecked: boolean }[];
}) => {
  const checkedMap: { [filterLabel: string]: boolean } = {};

  buttons.forEach((button) => {
    checkedMap[button.filterLabel] = button.defaultChecked;
  });
  return (
    <Box width={label === 'Team' ? '60%' : undefined}>
      <Typography variant="h6" component="label" textAlign="right">
        {label}
      </Typography>
      <Box display={'flex'} flexDirection={label === 'Team' ? undefined : 'column'} flexWrap={'wrap'}>
        {buttons.map((button) => (
          <FilterChipButton
            buttonText={button.filterLabel}
            onChange={button.handler}
            defaultChecked={button.defaultChecked}
            checked={checkedMap[button.filterLabel]}
          />
        ))}
      </Box>
    </Box>
  );
};

interface GanttChartFiltersProps {
  carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void; defaultChecked: boolean }[];
  teamTypeHandlers: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[];
  teamHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void; defaultChecked: boolean }[];
  overdueHandler: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked: boolean;
  }[];
  resetHandler: () => void;
  collapseHandler: () => void;
  expandHandler: () => void;
}

const GanttChartFilters = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  overdueHandler,
  resetHandler,
  collapseHandler,
  expandHandler
}: GanttChartFiltersProps) => {
  const FilterButtons = () => {
    return (
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'} mt={-1} mb={1}>
        <IconButton onClick={expandHandler}>
          <UnfoldMoreIcon sx={{ color: '#ef4345' }} />
        </IconButton>
        <Typography fontSize={'10px'} sx={{ color: '#ef4345' }}>
          Expand
        </Typography>
        <IconButton onClick={collapseHandler}>
          <UnfoldLessIcon sx={{ color: '#ef4345' }} />
        </IconButton>
        <Typography fontSize={'10px'} sx={{ color: '#ef4345' }}>
          Collapse
        </Typography>
        <IconButton onClick={resetHandler}>
          <RestartAltIcon sx={{ color: '#ef4345' }} />
        </IconButton>
        <Typography fontSize={'10px'} sx={{ color: '#ef4345' }}>
          Reset
        </Typography>
        <Checkbox
          onChange={overdueHandler[0].handler}
          sx={{
            '&:hover': {
              backgroundColor: 'transparent'
            },
            color: '#ef4345'
          }}
          defaultChecked={overdueHandler[0].defaultChecked}
          checked={overdueHandler[0].defaultChecked}
        />
        <Typography fontSize={'10px'} sx={{ color: '#ef4345' }}>
          Overdue
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      display={'flex'}
      sx={{
        justifyContent: 'start',
        alignItems: 'start',
        paddingLeft: 2,
        paddingTop: 2,
        maxWidth: '45rem'
      }}
    >
      <FilterRow label="Car" buttons={carHandlers} />
      <FilterRow label="Subteam" buttons={teamTypeHandlers} />
      <FilterRow label="Team" buttons={teamHandlers} />
      <FilterButtons />
    </Box>
  );
};

export default GanttChartFilters;
