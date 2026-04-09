import { ChangeEvent, useState, useCallback } from 'react';
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
    defaultChecked?: boolean;
  }[];
  hideTasksHandler: {
    filterLabel: string;
    handler: (event: ChangeEvent<HTMLInputElement>) => void;
    defaultChecked?: boolean;
  }[];
  resetHandler: () => void;
}

const GanttChartFiltersButton = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  overdueHandler,
  hideTasksHandler,
  resetHandler
}: GanttChartFiltersButtonProps) => {
  const [anchorFilterEl, setAnchorFilterEl] = useState<HTMLButtonElement | null>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorFilterEl(event.currentTarget);
  };

  const handleFilterClose = useCallback(() => {
    setAnchorFilterEl(null);
  }, []);

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
          hideTasksHandler={hideTasksHandler}
          resetHandler={resetHandler}
        />
      </Popover>
    </>
  );
};

export default GanttChartFiltersButton;
