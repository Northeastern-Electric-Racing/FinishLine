import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useQueries } from 'react-query';
import { BudgetSummary } from 'shared';
import { getBudgetSummary } from '../apis/exec-summaries.api';
import { useGetAllExecutiveSummaries } from '../hooks/exec-summaries.hooks';
import { useAllTeamTypes } from '../hooks/team-types.hooks';
import { BUDGET_CHART_COLORS, EXEC_SUMMARY_BACKGROUND, formatDollars } from '../utils/exec-summary.utils';
import BudgetDonut from './BudgetDonut';
import ErrorPage from '../pages/ErrorPage';
import LoadingIndicator from './LoadingIndicator';

const ALL_TEAM_TYPES = 'all';
const CARS_SHOWN = 3;

const SpendingChange: React.FC<{ budgetSummary: BudgetSummary }> = ({ budgetSummary }) => {
  const { totalSpent, previousTotalSpent, previousCarName } = budgetSummary;
  if (previousTotalSpent === undefined) return <Typography variant="body2">No previous car to compare to</Typography>;

  const change = totalSpent - previousTotalSpent;
  const Icon = change >= 0 ? TrendingUpIcon : TrendingDownIcon;
  const dollars = `${change >= 0 ? '+' : '-'}${formatDollars(Math.abs(change))}`;
  const percent = previousTotalSpent
    ? `${((Math.abs(change) / previousTotalSpent) * 100).toFixed(1)}%`
    : 'no prior spending';

  return (
    <Box display="flex" alignItems="center" gap={1} border="1px solid white" borderRadius={1} px={2} py={0.75}>
      <Icon fontSize="small" />
      <Typography variant="body2">
        {dollars} ({percent}) from {previousCarName ?? 'previous car'}
      </Typography>
    </Box>
  );
};

/**
 * Compares the budget of up to three cars side by side, optionally filtered down to a single team type.
 */
const ExecutiveSummaryBudgetOverlay: React.FC = () => {
  const accent = useTheme().palette.primary.main;
  const [teamTypeId, setTeamTypeId] = useState<string>(ALL_TEAM_TYPES);
  // index (newest car first) of the first car shown; the next two older cars are shown with it
  const [startIndex, setStartIndex] = useState(0);
  const { data: teamTypes } = useAllTeamTypes();
  const { data: allSummaries, isLoading, isError, error } = useGetAllExecutiveSummaries();

  // a car can have several summaries, so only keep the newest for each, newest car first
  const summaries = (allSummaries ?? [])
    .filter((s) => !s.dateDeleted)
    .sort((a, b) => (b.seasonStartDate?.getTime() ?? 0) - (a.seasonStartDate?.getTime() ?? 0))
    .filter((s, idx, arr) => arr.findIndex((other) => other.car.name === s.car.name) === idx);
  const shown = summaries.slice(startIndex, startIndex + CARS_SHOWN);

  // same query key as useBudgetSummary, so these share its cache
  const budgetQueries = useQueries(
    shown.map((summary) => ({
      queryKey: [
        'executive-summaries',
        summary.executiveSummaryId,
        'budget',
        teamTypeId === ALL_TEAM_TYPES ? undefined : teamTypeId
      ],
      queryFn: async () =>
        (await getBudgetSummary(summary.executiveSummaryId, teamTypeId === ALL_TEAM_TYPES ? undefined : teamTypeId)).data
    }))
  );

  if (isError) return <ErrorPage message={error?.message} />;
  const failedQuery = budgetQueries.find((q) => q.isError);
  if (failedQuery) return <ErrorPage message={(failedQuery.error as Error | null)?.message} />;
  if (isLoading || !allSummaries) return <LoadingIndicator />;
  if (summaries.length === 0)
    return (
      <Typography textAlign="center" mt={4}>
        No executive summaries found.
      </Typography>
    );

  const budgets = budgetQueries.map((q) => q.data as BudgetSummary | undefined);

  // one color per division across every donut, so the shared legend matches all of them
  const colorsByLabel = new Map<string, string>();
  budgets.forEach((budget) =>
    budget?.spentByDivision.values.forEach(({ label }) => {
      if (!colorsByLabel.has(label))
        colorsByLabel.set(label, BUDGET_CHART_COLORS[colorsByLabel.size % BUDGET_CHART_COLORS.length]);
    })
  );

  return (
    <Box sx={{ backgroundColor: EXEC_SUMMARY_BACKGROUND, color: 'white', borderRadius: 5, p: 2 }}>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" gap={2} mb={3}>
        <Box display="flex" flexWrap="wrap" gap={3}>
          {[...colorsByLabel].map(([label, color]) => (
            <Box key={label} display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: color }} />
              <Typography>{label}</Typography>
            </Box>
          ))}
        </Box>
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
          <Box display="flex" flexWrap="wrap" gap={0.5} aria-label="car-range">
            {summaries.map((summary, idx) => {
              const inRange = idx >= startIndex && idx < startIndex + CARS_SHOWN;
              return (
                <Button
                  key={summary.executiveSummaryId}
                  size="small"
                  onClick={() => setStartIndex(idx)}
                  sx={{
                    color: inRange ? accent : 'white',
                    border: inRange ? `1px solid ${accent}` : '1px solid transparent'
                  }}
                >
                  {summary.car.name}
                </Button>
              );
            })}
          </Box>
          <TextField
            select
            size="small"
            label="Team Type"
            value={teamTypeId}
            onChange={(e) => setTeamTypeId(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value={ALL_TEAM_TYPES}>All Team Types</MenuItem>
            {(teamTypes ?? []).map((teamType) => (
              <MenuItem key={teamType.teamTypeId} value={teamType.teamTypeId}>
                {teamType.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{ xs: 'minmax(0, 1fr)', md: `repeat(${shown.length}, minmax(0, 1fr))` }}
      >
        {shown.map((summary, idx) => {
          const budget = budgets[idx];
          if (!budget) return <LoadingIndicator key={summary.executiveSummaryId} />;
          const overage = budget.totalSpent - budget.totalBudget;
          return (
            <Box
              key={summary.executiveSummaryId}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              sx={{ '&:not(:first-of-type)': { borderLeft: { md: '1px solid #505050' } } }}
            >
              <Typography variant="h6">{summary.car.name}</Typography>
              <BudgetDonut
                values={budget.spentByDivision.values}
                centerText={formatDollars(budget.totalSpent)}
                colorsByLabel={colorsByLabel}
                amountLabel="spent"
                maxSize={240}
              />
              <Typography variant="h6" sx={{ textTransform: 'uppercase', color: overage > 0 ? accent : 'success.main' }}>
                {overage > 0
                  ? `${formatDollars(overage)} overbudget`
                  : overage < 0
                    ? `${formatDollars(-overage)} under budget`
                    : 'Exactly on budget'}
              </Typography>
              <SpendingChange budgetSummary={budget} />
              <Box textAlign="center">
                <Typography sx={{ textDecoration: 'underline' }}>Most Over Budget Teams</Typography>
                {budget.overbudgetDivisions.length === 0 ? (
                  <Typography variant="body2">N/A</Typography>
                ) : (
                  <Box
                    component="ol"
                    sx={{ m: 0, p: 0, listStylePosition: 'inside', textAlign: 'left', display: 'inline-block' }}
                  >
                    {budget.overbudgetDivisions.map((division) => (
                      <li key={division.label}>
                        {division.label} ({formatDollars(division.amount)})
                      </li>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ExecutiveSummaryBudgetOverlay;
