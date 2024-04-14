/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { Button, Checkbox, Chip, Grid, Typography, useTheme } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChangeEvent, FC } from 'react';

interface GanttPageFilterProps {
  car1Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  car2Handler: (event: ChangeEvent<HTMLInputElement>) => void;
  carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamCategoriesHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamsHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  overdueHandler: (event: ChangeEvent<HTMLInputElement>) => void;

  teamList: string[];

  expandedHandler: (expanded: boolean) => void;
  resetHandler: () => void;
}

const FilterChipButton = ({
  buttonText,
  onChange
}: {
  buttonText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
      icon={<Chip label={buttonText} sx={{ minWidth: '150px', borderRadius: '20px' }} />}
      checkedIcon={
        <Chip
          label={buttonText}
          sx={{ minWidth: '150px', borderRadius: '20px', backgroundColor: theme.palette.primary.main }}
        />
      }
    />
  );
};

const GanttPageFilter: FC<GanttPageFilterProps> = ({
  car1Handler,
  car2Handler,
  carHandlers,
  teamCategoriesHandlers,
  teamsHandlers,
  overdueHandler,
  expandedHandler,
  resetHandler
}) => {
  const FilterRow = ({
    label,
    buttons
  }: {
    label: string;
    buttons: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  }) => (
    <Grid item container xs={12}>
      <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="h6" component="label" textAlign="right">
          {label}
        </Typography>
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
    <Grid
      container
      rowSpacing={2}
      sx={{ justifyContent: 'start', alignItems: 'start', paddingY: 3, paddingX: 5, minWidth: '550px', maxWidth: '550px' }}
    >
      <FilterRow label="Cars" buttons={carHandlers} />
      <FilterRow label="Team Category" buttons={teamCategoriesHandlers} />
      <FilterRow label="Team" buttons={teamsHandlers} />
      <FilterRow label="Overdue" buttons={[{ filterLabel: 'Overdue', handler: overdueHandler }]} />
      {buttons}
    </Grid>
  );
};

export default GanttPageFilter;
