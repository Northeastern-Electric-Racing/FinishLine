import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { ArcElement, Chart, ChartOptions, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BudgetHighlight, ExecutiveSummary } from 'shared';
import { useBudgetSummary, useEditExecutiveSummary, useSingleExecutiveSummary } from '../hooks/exec-summaries.hooks';
import { useToast } from '../hooks/toasts.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';

Chart.register(ArcElement, Tooltip, Legend);

// the executive panel is always a dark card, regardless of the app theme
const BACKGROUND = '#121212';

// accent shades first, then greys, so that adjacent divisions are easy to tell apart
const CHART_COLORS = ['#ef4345', '#9B3425', '#5E1A10', '#B3B3B3', '#808080', '#5C5C5C', '#3D3D3D', '#2A2A2A'];

interface ExecutiveSummaryBudgetProps {
  executiveSummary: ExecutiveSummary;
}

const formatDollars = (amount: number): string => `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

interface UnderlinedLabelProps {
  label: string;
  highlight?: BudgetHighlight;
  showOverbudget?: boolean;
}

const UnderlinedLabel: React.FC<UnderlinedLabelProps> = ({ label, highlight, showOverbudget }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="h5" sx={{ textDecoration: 'underline', lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography>
      {highlight ? `${highlight.label} (${formatDollars(highlight.amount)}${showOverbudget ? ' Overbudget' : ''})` : 'N/A'}
    </Typography>
  </Box>
);

const ExecutiveSummaryBudget: React.FC<ExecutiveSummaryBudgetProps> = ({ executiveSummary: initialSummary }) => {
  const { executiveSummaryId } = initialSummary;
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const {
    data: budgetSummary,
    isLoading: budgetIsLoading,
    isError: budgetIsError,
    error: budgetError
  } = useBudgetSummary(executiveSummaryId);
  // prefer the live copy of the summary so that notes and the edit payload never go stale
  const {
    data: latestSummary,
    isLoading: summaryIsLoading,
    isError: summaryIsError,
    error: summaryError
  } = useSingleExecutiveSummary(executiveSummaryId);
  const executiveSummary = latestSummary ?? initialSummary;
  const { mutateAsync: editExecutiveSummary, isLoading: isSaving } = useEditExecutiveSummary(executiveSummaryId);
  const toast = useToast();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(executiveSummary.budgetNotes);

  // keep the draft in sync with the saved notes whenever the user isn't mid-edit
  useEffect(() => {
    if (!isEditingNotes) setNotesDraft(executiveSummary.budgetNotes);
  }, [executiveSummary.budgetNotes, isEditingNotes]);

  if (budgetIsError) return <ErrorPage message={budgetError?.message} />;
  if (summaryIsError) return <ErrorPage message={summaryError?.message} />;
  if (budgetIsLoading || summaryIsLoading || !budgetSummary) return <LoadingIndicator />;

  const { budgetByDivision, totalBudget, totalSpent } = budgetSummary;
  const overage = totalSpent - totalBudget;

  const startEditing = () => {
    setNotesDraft(executiveSummary.budgetNotes);
    setIsEditingNotes(true);
  };

  const saveNotes = async () => {
    try {
      await editExecutiveSummary({
        seasonStartDate: executiveSummary.seasonStartDate,
        seasonEndDate: executiveSummary.seasonEndDate,
        goals: executiveSummary.goals,
        winsAndImprovements: executiveSummary.winsAndImprovements,
        budgetNotes: notesDraft,
        recruitmentNotes: executiveSummary.recruitmentNotes
      });
      setIsEditingNotes(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save budget notes');
    }
  };

  const chartData = {
    labels: budgetByDivision.values.map((v) => v.label),
    datasets: [
      {
        data: budgetByDivision.values.map((v) => v.value),
        backgroundColor: budgetByDivision.values.map((_, idx) => CHART_COLORS[idx % CHART_COLORS.length]),
        borderColor: BACKGROUND,
        borderWidth: 2
      }
    ]
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatDollars(ctx.parsed)} budgeted` } }
    }
  };

  const noteLines = executiveSummary.budgetNotes.split('\n').filter((line) => line.trim() !== '');

  const bannerText =
    overage > 0
      ? `${formatDollars(overage)} overbudget`
      : overage < 0
        ? `${formatDollars(-overage)} under budget`
        : 'Exactly on budget';

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: BACKGROUND, color: 'white', width: '100%', maxWidth: 1000 }}>
      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h2" textAlign="center" mb={2}>
          Budget
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={{ xs: 3, md: 5 }}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 360, aspectRatio: '1 / 1', flexShrink: 0 }}>
            <Doughnut data={chartData} options={chartOptions} />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '62%',
                height: '62%',
                borderRadius: '50%',
                border: `10px solid ${accent}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <Typography variant="h5">{formatDollars(totalSpent)}</Typography>
              <Typography variant="caption">spent of {formatDollars(totalBudget)}</Typography>
            </Box>
          </Box>

          <Box flexGrow={1} width="100%">
            <Box
              sx={{
                backgroundColor: overage > 0 ? accent : theme.palette.success.main,
                borderRadius: 3,
                py: 2,
                mb: 3,
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" sx={{ textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 400 }}>
                {bannerText}
              </Typography>
            </Box>

            <UnderlinedLabel label="Most Expensive Team" highlight={budgetSummary.mostExpensiveDivision} />
            <UnderlinedLabel label="Most Overbudget Team" highlight={budgetSummary.mostOverbudgetDivision} showOverbudget />
            <UnderlinedLabel
              label="Most Overbudget Project"
              highlight={budgetSummary.mostOverbudgetProject}
              showOverbudget
            />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={1} mt={1}>
          <Typography variant="h4">Notes</Typography>
          {!isEditingNotes ? (
            <IconButton aria-label="edit-budget-notes" onClick={startEditing} sx={{ color: 'white' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <>
              <Button
                color="error"
                variant="contained"
                size="small"
                onClick={() => setIsEditingNotes(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button color="success" variant="contained" size="small" onClick={saveNotes} disabled={isSaving || !latestSummary}>
                Save
              </Button>
            </>
          )}
        </Box>
        {isEditingNotes ? (
          <TextField
            multiline
            fullWidth
            minRows={3}
            placeholder="Add any notes about the overall budget (bullets or sentences) here!"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { backgroundColor: '#505050', borderRadius: 5, color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& textarea::placeholder': { color: 'white', opacity: 0.8 }
            }}
          />
        ) : noteLines.length === 0 ? (
          <Typography>No notes.</Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, pl: 3, maxWidth: 650, fontSize: '1.1rem' }}>
            {noteLines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutiveSummaryBudget;
