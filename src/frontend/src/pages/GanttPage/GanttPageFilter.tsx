/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from 'shared';
import { Button, Checkbox, Chip, FormLabel, Grid, Typography, useTheme } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChangeEvent, FC } from 'react';

interface GanttPageFilterProps {
  car0Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  car1Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  car2Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamCategoriesHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamsHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  overdueHandler: (event: ChangeEvent<HTMLInputElement>) => void;
  status: string;
  selectedTeam: string;
  teamList: string[];
  teamHandler: (event: SelectChangeEvent) => void;
  currentStart: Date | null;
  currentEnd: Date | null;
  expandedHandler: (expanded: boolean) => void;
  resetHandler: () => void;
}

const GanttPageFilter: FC<GanttPageFilterProps> = ({
  car0Handler,
  car1Handler,
  car2Handler,
  carHandlers,
  teamCategoriesHandlers,
  teamsHandlers,
  overdueHandler,
  status,
  teamHandler,
  expandedHandler,
  teamList,
  selectedTeam,
  currentStart,
  currentEnd,
  resetHandler
}) => {
  const theme = useTheme();

  const FilterChipButton = ({
    buttonText,
    onChange
  }: {
    buttonText: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <Checkbox
      defaultChecked
      onChange={onChange}
      sx={{
        '&:hover': {
          backgroundColor: 'transparent'
        }
      }}
      icon={
        <Chip
          label={buttonText}
          sx={{ minWidth: '150px', borderRadius: '20px', backgroundColor: theme.palette.primary.main }}
        />
      }
      checkedIcon={<Chip label={buttonText} sx={{ minWidth: '150px', borderRadius: '20px' }} />}
    />
  );

  const FilterRow = ({
    label,
    buttons
  }: {
    label: string;
    buttons: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  }) => (
    <Grid item container xs={12} sx={{ display: 'flex', alignItems: 'center', maxWidth: '50vw' }}>
      <Grid item xs={3} sx={{ minHeight: '100%' }}>
        <FormLabel>
          <Typography variant="h6" textAlign="right">
            {label}
          </Typography>
        </FormLabel>
      </Grid>
      <Grid container item xs={9} sx={{ display: 'flex', alignItems: 'center' }}>
        {buttons.map((button) => (
          <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FilterChipButton buttonText={button.filterLabel} onChange={button.handler} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  const buttons = (
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

  return (
    <Grid container rowSpacing={2} sx={{ justifyContent: 'start', alignItems: 'start', paddingY: 3, maxWidth: '50vw' }}>
      <FilterRow label="Cars" buttons={carHandlers} />
      <FilterRow label="Team Category" buttons={teamCategoriesHandlers} />
      <FilterRow label="Team" buttons={teamsHandlers} />
      <FilterRow label="Overdue" buttons={[{ filterLabel: 'Overdue', handler: overdueHandler }]} />
      {buttons}
    </Grid>
  );
};

export default GanttPageFilter;
