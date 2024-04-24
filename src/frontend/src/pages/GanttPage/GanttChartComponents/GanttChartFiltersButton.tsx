import { ChangeEvent, useState } from 'react';
import { IconButton, Popover } from '@mui/material';
import GanttChartFilters from './GanttChartFilters';
import { Tune } from '@mui/icons-material';

interface GanttChartFiltersButtonProps {
  carHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamCategoriesHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  teamsHandlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void }[];
  overdueHandler: (event: ChangeEvent<HTMLInputElement>) => void;
  expandedHandler: (expanded: boolean) => void;
  resetHandler: () => void;
}

const GanttChartFiltersButton = ({
  carHandlers,
  teamCategoriesHandlers,
  teamsHandlers,
  overdueHandler,
  expandedHandler,
  resetHandler
}: GanttChartFiltersButtonProps) => {
  const [anchorFilterEl, setAnchorFilterEl] = useState<HTMLButtonElement | null>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorFilterEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorFilterEl(null);
  };

  const open = Boolean(anchorFilterEl);
  return (
    <>
      <IconButton onClick={handleFilterClick}>
        <Tune />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorFilterEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ dispaly: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <GanttChartFilters
          carHandlers={carHandlers}
          teamCategoriesHandlers={teamCategoriesHandlers}
          teamsHandlers={teamsHandlers}
          overdueHandler={overdueHandler}
          expandedHandler={expandedHandler}
          resetHandler={resetHandler}
        />
      </Popover>
    </>
  );
};

export default GanttChartFiltersButton;
