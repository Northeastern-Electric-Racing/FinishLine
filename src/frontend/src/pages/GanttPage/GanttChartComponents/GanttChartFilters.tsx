/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Checkbox, Chip, Grid, Typography, useTheme } from '@mui/material';
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
    <Grid item container xs={12}>
      <Typography variant="h6" component="label" textAlign="right">
        {label}
      </Typography>

      <Grid container item xs={12} sx={{ display: 'flex', alignItems: 'cenƒter' }}>
        {buttons.map((button) => (
          <FilterChipButton
            buttonText={button.filterLabel}
            onChange={button.handler}
            defaultChecked={button.defaultChecked}
            checked={checkedMap[button.filterLabel]}
          />
        ))}
      </Grid>
    </Grid>
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
}

const GanttChartFilters = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  overdueHandler,
  resetHandler,
  collapseHandler
}: GanttChartFiltersProps) => {
  const FilterButtons = () => {
    return (
      <Grid item container xs={12} sx={{ justifyContent: 'right', alignItems: 'right' }}>
        {/* TODO: Expand & Collapse buttons
        <Grid item>
          <Button onClick={() => {}} startIcon={<UnfoldMoreIcon />}>
            Expand
          </Button>
        </Grid>
        <Grid item>
          <Button onClick={collapseHandler} startIcon={<UnfoldLessIcon />}>
            Collapse
          </Button>
        </Grid>*/}
        <Grid item>
          <Button onClick={resetHandler} startIcon={<RestartAltIcon />}>
            Reset
          </Button>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid>
      <Grid item px={2} pt={1}>
        <FilterButtons />
      </Grid>
      <Grid
        container
        rowSpacing={2}
        sx={{
          justifyContent: 'start',
          alignItems: 'start',
          padding: 2,
          paddingX: 4,
          minWidth: { xs: '100%', md: '30rem' },
          maxWidth: { xs: '100%', md: '30rem' }
        }}
      >
        <FilterRow label="Car" buttons={carHandlers} />
        <FilterRow label="Subteam" buttons={teamTypeHandlers} />
        <FilterRow label="Team" buttons={teamHandlers} />
        <FilterRow label="Overdue" buttons={overdueHandler} />
      </Grid>
    </Grid>
  );
};

export default GanttChartFilters;
