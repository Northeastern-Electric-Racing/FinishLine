import { ChangeEvent, useState } from 'react';
import { IconButton, Popover } from '@mui/material';
import GanttChartFilters from './GanttChartFilters';
import { Tune } from '@mui/icons-material';

interface GanttChartFiltersButtonProps {
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

const GanttChartFiltersButton = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  overdueHandler,
  resetHandler,
  collapseHandler,
  expandHandler
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
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{ maxWidth: '100rem' }}
      >
        <GanttChartFilters
          carHandlers={carHandlers}
          teamTypeHandlers={teamTypeHandlers}
          teamHandlers={teamHandlers}
          overdueHandler={overdueHandler}
          resetHandler={resetHandler}
          collapseHandler={collapseHandler}
          expandHandler={expandHandler}
        />
      </Popover>
    </>
  );
};

export default GanttChartFiltersButton;
