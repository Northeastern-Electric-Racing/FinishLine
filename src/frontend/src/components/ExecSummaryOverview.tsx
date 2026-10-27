import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ExecutiveSummary, isAdmin } from 'shared';
import { useEditExecutiveSummary } from '../hooks/exec-summaries.hooks';
import { useToast } from '../hooks/toasts.hooks';
import { useCurrentUser } from '../hooks/users.hooks';
import EditableTextField from './EditableTextField';

interface ExecSummaryOverviewProps {
  executiveSummary: ExecutiveSummary;
}

type EditableSection = 'goals' | 'winsAndImprovements';

const formatDate = (date: Date): string =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const ExecSummaryOverview: React.FC<ExecSummaryOverviewProps> = ({ executiveSummary }) => {
  const { mutateAsync: editExecutiveSummary, isLoading: isSaving } = useEditExecutiveSummary(
    executiveSummary.executiveSummaryId
  );
  const toast = useToast();
  const user = useCurrentUser();
  const canEdit = isAdmin(user.role) || !!user.isOperations;
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);

  const saveSection = async (section: EditableSection, newText: string) => {
    try {
      await editExecutiveSummary({
        seasonStartDate: executiveSummary.seasonStartDate,
        seasonEndDate: executiveSummary.seasonEndDate,
        goals: executiveSummary.goals,
        winsAndImprovements: executiveSummary.winsAndImprovements,
        budgetNotes: executiveSummary.budgetNotes,
        recruitmentNotes: executiveSummary.recruitmentNotes,
        [section]: newText
      });
      setEditingSection(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save executive summary');
    }
  };

  const { car, seasonStartDate, seasonEndDate } = executiveSummary;
  const seasonText =
    seasonStartDate && seasonEndDate
      ? `${formatDate(seasonStartDate)} - ${formatDate(seasonEndDate)}`
      : 'Season dates have not been set.';

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box>
        <Typography variant="h5">Overview</Typography>
        <Typography>{car.name}</Typography>
        <Typography>{seasonText}</Typography>
      </Box>
      <EditableTextField
        label="Goals"
        value={executiveSummary.goals}
        emptyPlaceholder="No goals have been added yet."
        editPlaceholder="What did the team set out to accomplish this season?"
        isEditing={editingSection === 'goals'}
        isSaving={isSaving}
        canEdit={canEdit}
        onEditStart={() => setEditingSection('goals')}
        onCancel={() => setEditingSection(null)}
        onSave={(text) => saveSection('goals', text)}
      />
      <EditableTextField
        label="Wins + What to Improve"
        value={executiveSummary.winsAndImprovements}
        emptyPlaceholder="No wins or improvements have been added yet."
        editPlaceholder="What went well, and what should the team do better next season?"
        isEditing={editingSection === 'winsAndImprovements'}
        isSaving={isSaving}
        canEdit={canEdit}
        onEditStart={() => setEditingSection('winsAndImprovements')}
        onCancel={() => setEditingSection(null)}
        onSave={(text) => saveSection('winsAndImprovements', text)}
      />
    </Box>
  );
};

export default ExecSummaryOverview;
