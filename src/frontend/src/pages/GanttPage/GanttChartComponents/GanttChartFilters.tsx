/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Button, Checkbox, Chip, Grid, Typography, useTheme } from '@mui/material';
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
  overdueHandler: (event: ChangeEvent<HTMLInputElement>) => void;
  expandedHandler: (expanded: boolean) => void;
  resetHandler: () => void;
}

const GanttChartFilters = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  overdueHandler,
  expandedHandler,
  resetHandler
}: GanttChartFiltersProps) => {
  const FilterButtons = () => {
    return (
      <Grid item container xs={12} sx={{ justifyContent: 'center', alignItems: 'center', mt: 2 }}>
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
  };

  return (
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
      <FilterRow label="Overdue" buttons={[{ filterLabel: 'Overdue', handler: overdueHandler, defaultChecked: false }]} />
      <FilterButtons />
    </Grid>
  );
};

export default GanttChartFilters;
