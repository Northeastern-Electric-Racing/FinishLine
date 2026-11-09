import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { BudgetHighlight, ExecutiveSummary, isAdmin } from 'shared';
import { useBudgetSummary, useEditExecutiveSummary } from '../hooks/exec-summaries.hooks';
import { useToast } from '../hooks/toasts.hooks';
import { useCurrentUser } from '../hooks/users.hooks';
import LoadingIndicator from './LoadingIndicator';
import ErrorPage from '../pages/ErrorPage';
import BudgetDonut from './BudgetDonut';
import { EXEC_SUMMARY_BACKGROUND, formatDollars } from '../utils/exec-summary.utils';

interface ExecutiveSummaryBudgetProps {
  executiveSummary: ExecutiveSummary;
}

interface UnderlinedLabelProps {
  label: string;
  highlight?: BudgetHighlight;
  showOverbudget?: boolean;
}

const UnderlinedLabel: React.FC<UnderlinedLabelProps> = ({ label, highlight, showOverbudget }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="h6" sx={{ textDecoration: 'underline', lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography variant="body2">
      {highlight ? `${highlight.label} (${formatDollars(highlight.amount)}${showOverbudget ? ' Overbudget' : ''})` : 'N/A'}
    </Typography>
  </Box>
);

const ExecutiveSummaryBudget: React.FC<ExecutiveSummaryBudgetProps> = ({ executiveSummary }) => {
  const { executiveSummaryId } = executiveSummary;
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const {
    data: budgetSummary,
    isLoading: budgetIsLoading,
    isError: budgetIsError,
    error: budgetError
  } = useBudgetSummary(executiveSummaryId);
  const { mutateAsync: editExecutiveSummary, isLoading: isSaving } = useEditExecutiveSummary(executiveSummaryId);
  const toast = useToast();
  const user = useCurrentUser();
  const canEdit = isAdmin(user.role) || !!user.isOperations;
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  if (budgetIsError) return <ErrorPage message={budgetError?.message} />;
  if (budgetIsLoading || !budgetSummary) return <LoadingIndicator />;

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

  const noteLines = executiveSummary.budgetNotes.split('\n').filter((line) => line.trim() !== '');

  const bannerText =
    overage > 0
      ? `${formatDollars(overage)} overbudget`
      : overage < 0
        ? `${formatDollars(-overage)} under budget`
        : 'Exactly on budget';

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: EXEC_SUMMARY_BACKGROUND, color: 'white', width: '100%', height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
          Budget
        </Typography>

        <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" gap={2}>
          <BudgetDonut values={budgetByDivision.values} centerText={formatDollars(totalSpent)} />

          <Box flex="1 1 190px" minWidth={0}>
            <Box
              sx={{
                backgroundColor: overage > 0 ? accent : theme.palette.success.main,
                borderRadius: 3,
                py: 1,
                mb: 2,
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" sx={{ textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 400 }}>
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
          <Typography variant="h6">Notes</Typography>
          {!isEditingNotes ? (
            canEdit && (
              <IconButton aria-label="edit-budget-notes" onClick={startEditing} sx={{ color: 'white' }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )
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
              <Button color="success" variant="contained" size="small" onClick={saveNotes} disabled={isSaving}>
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
          <Box component="ul" sx={{ m: 0, pl: 3, maxWidth: 650, fontSize: '0.95rem' }}>
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
