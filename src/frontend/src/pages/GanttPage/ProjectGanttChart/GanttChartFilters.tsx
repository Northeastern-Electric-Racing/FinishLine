/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Box,
  Checkbox,
  Typography,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { ChangeEvent, useState } from 'react';

const FilterCheckboxes = ({
  handlers
}: {
  handlers: { filterLabel: string; handler: (event: ChangeEvent<HTMLInputElement>) => void; defaultChecked: boolean }[];
}) => (
  <Box display="flex" flexDirection="column">
    {handlers.map((handler) => (
      <FormControlLabel
        key={handler.filterLabel}
        slotProps={{ typography: { fontSize: '14px' } }}
        control={
          <Checkbox
            size="small"
            onChange={handler.handler}
            defaultChecked={handler.defaultChecked}
            sx={{ padding: '2px 7px' }}
          />
        }
        label={handler.filterLabel}
      />
    ))}
  </Box>
);

const FilterAccordion = ({
  label,
  children,
  expanded,
  onChange
}: {
  label: string;
  children: React.ReactNode;
  expanded: boolean;
  onChange: () => void;
}) => {
  const theme = useTheme();

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={onChange}
      sx={{
        backgroundColor: 'transparent',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.secondary }} />}
        sx={{
          minHeight: '36px',
          px: 0,
          flexDirection: 'row-reverse',
          gap: 1,
          '& .MuiAccordionSummary-expandIconWrapper': { marginRight: 0, marginLeft: 0 },
          '& .MuiAccordionSummary-content': { margin: '6px 0' }
        }}
      >
        <Typography variant="h6" fontWeight="normal" color="text.primary">
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 0 0 36px' }}>{children}</AccordionDetails>
    </Accordion>
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
  showTasks?: boolean;
  showTasksHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
  resetHandler: () => void;
  onClose: () => void;
}

const GanttChartFilters = ({
  carHandlers,
  teamTypeHandlers,
  teamHandlers,
  showTasks,
  showTasksHandler,
  resetHandler,
  onClose
}: GanttChartFiltersProps) => {
  const theme = useTheme();

  const [expanded, setExpanded] = useState({
    car: true,
    division: true,
    team: true
  });

  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    resetHandler();
  };

  const toggle = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ padding: 2, width: '20rem', backgroundColor: theme.palette.background.paper, borderRadius: 1 }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="h5" fontWeight="normal" color="text.primary">
          Filters
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box display="flex" flexDirection="row" alignItems="center" gap={0.5} sx={{ mb: -0.5 }}>
        <Typography
          fontSize="14px"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={handleReset}
        >
          Reset
        </Typography>
        <Typography sx={{ color: theme.palette.text.primary, lineHeight: 2.75, fontSize: '0.5rem' }}>•</Typography>
        <Typography
          fontSize="13px"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setExpanded({ car: true, division: true, team: true })}
        >
          Expand All
        </Typography>
        <Typography sx={{ color: theme.palette.text.primary, lineHeight: 2.75, fontSize: '0.5rem' }}>•</Typography>
        <Typography
          fontSize="13px"
          sx={{ color: theme.palette.primary.main, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => setExpanded({ car: false, division: false, team: false })}
        >
          Collapse All
        </Typography>
      </Box>

      <FilterAccordion label="Car" expanded={expanded.car} onChange={() => toggle('car')}>
        <FilterCheckboxes key={`car-${resetKey}`} handlers={carHandlers} />
      </FilterAccordion>

      <FilterAccordion label="Division" expanded={expanded.division} onChange={() => toggle('division')}>
        <FilterCheckboxes key={`division-${resetKey}`} handlers={teamTypeHandlers} />
      </FilterAccordion>

      <FilterAccordion label="Team" expanded={expanded.team} onChange={() => toggle('team')}>
        <FilterCheckboxes key={`team-${resetKey}`} handlers={teamHandlers} />
      </FilterAccordion>

      {showTasksHandler && (
        <FormControlLabel
          key={`show-tasks-${resetKey}`}
          slotProps={{ typography: { fontSize: '14px' } }}
          sx={{ ml: 0, mt: 1 }}
          control={
            <Checkbox
              size="small"
              onChange={showTasksHandler}
              defaultChecked={showTasks ?? true}
              sx={{ padding: '2px 7px' }}
            />
          }
          label="Show Tasks"
        />
      )}
    </Box>
  );
};

export default GanttChartFilters;
