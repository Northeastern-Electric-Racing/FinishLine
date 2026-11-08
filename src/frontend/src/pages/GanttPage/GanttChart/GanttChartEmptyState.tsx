import { Box, Button, Chip, Typography } from '@mui/material';

export interface GanttActiveFilter {
  label: string;
  value: string;
}

interface GanttChartEmptyStateProps {
  activeFilters: GanttActiveFilter[];
  onReset: () => void;
}

/**
 * Shown in place of the chart when the current filters match no projects, so a
 * filtered-to-nothing chart isn't mistaken for a page that failed to load.
 */
const GanttChartEmptyState = ({ activeFilters, onReset }: GanttChartEmptyStateProps) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
        py: 6,
        px: 2
      }}
    >
      <Typography variant="h6" fontWeight={400}>
        No projects match the current filters
      </Typography>
      {activeFilters.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary">
            Active filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, maxWidth: '40rem' }}>
            {activeFilters.map((filter) => (
              <Chip key={`${filter.label}-${filter.value}`} size="small" label={`${filter.label}: ${filter.value}`} />
            ))}
          </Box>
        </>
      )}
      <Button variant="contained" onClick={onReset}>
        Reset Filters
      </Button>
    </Box>
  );
};

export default GanttChartEmptyState;
