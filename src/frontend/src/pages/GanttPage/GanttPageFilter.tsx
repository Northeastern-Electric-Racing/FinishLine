/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from 'shared';
import { Box, Button, Checkbox, Chip, FormLabel, Grid, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ChangeEvent, FC } from 'react';

interface FilterButton {
  label: string;
  onChange: () => void;
}

const FilterChipButton = ({
  buttonText,
  onChange
}: {
  buttonText: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => <Chip label={buttonText} sx={{ minWidth: '200px', borderRadius: '20px' }} onChange={onChange} />;

const FilterRow = ({ label, buttons }: { label: string; buttons: FilterButton[] }) => (
  <Grid item container xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
    <Grid item xs={3} sx={{ minHeight: '100%' }}>
      <FormLabel>
        <Typography variant="h6" textAlign="right">
          {label}
        </Typography>
      </FormLabel>
    </Grid>
    <Grid container spacing={1} item xs={9} sx={{ display: 'flex', alignItems: 'center' }}>
      {buttons.map((button) => (
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FilterChipButton buttonText={button.label} onChange={button.onChange} />
        </Grid>
      ))}
    </Grid>
  </Grid>
);

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
  const carFilterButtons: FilterButton[] = [
    { label: 'Car 1', onChange: () => {} },
    { label: 'Car 2', onChange: () => {} }
  ];
  const teamCategoryFilterButtons: FilterButton[] = [
    { label: 'Electrical', onChange: () => {} },
    { label: 'Mechanical', onChange: () => {} },
    { label: 'Software', onChange: () => {} },
    { label: 'Business', onChange: () => {} }
  ];
  const teamFilterButtons: FilterButton[] = [
    { label: 'Ergonomics', onChange: () => {} },
    { label: 'Tractive', onChange: () => {} },
    { label: 'Low Voltage', onChange: () => {} },
    { label: 'Data and Controls', onChange: () => {} },
    { label: 'Software', onChange: () => {} }
  ];
  const overdueFilterButtons: FilterButton[] = [{ label: 'Overdue', onChange: () => {} }];

  const buttons = (
    <Grid
      item
      container
      sx={{ justifyContent: 'end', alignItems: 'center', alignSelf: 'center', justifySelf: 'end', mt: 2 }}
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
    <Grid container rowSpacing={3} sx={{ justifyContent: 'start', alignItems: 'start', paddingY: 3, maxWidth: '50vw' }}>
      <FilterRow label="Cars" buttons={carFilterButtons} />
      <FilterRow label="Team Category" buttons={teamCategoryFilterButtons} />
      <FilterRow label="Team" buttons={teamFilterButtons} />
      <FilterRow label="Overdue" buttons={overdueFilterButtons} />
    </Grid>
  );
};

export default GanttPageFilter;
