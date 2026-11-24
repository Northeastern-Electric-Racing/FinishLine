/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
// import Button from '@mui/material/Button';
import { useState } from 'react';
import { CompetitionDocumentsSummary, DataSource, isAdmin } from 'shared';
import { useCurrentUser } from '../hooks/users.hooks';
import { useEditCompetitionDocumentsSummary } from '../hooks/exec-summaries.hooks';
import { useToast } from '../hooks/toasts.hooks';
import NERSuccessButton from './NERSuccessButton';
import NERFailButton from './NERFailButton';

interface CompetitionDocumentsProps {
  competitionDocumentsSummary: CompetitionDocumentsSummary;
}

interface CompetitionDocumentsForm {
  submittedOnTimeCount: string;
  firstSubmissionRejectedCount: string;
}

const PillInput = styled(InputBase)({
  backgroundColor: '#3a3a3a',
  color: 'white',
  borderRadius: 8,
  padding: '0 10px',
  fontSize: 20,
  fontWeight: 'bold',
  '& input': { padding: '4px 0', textAlign: 'center' }
});

// only allow whole, non-negative numbers (or an empty box while typing)
const NUMERIC_REGEX = /^\d*$/;

const numberToInput = (value?: number): string => (value === undefined ? '' : `${value}`);
const inputToNumber = (value: string): number | undefined => (value === '' ? undefined : Number(value));

interface StatBlockProps {
  value: string;
  label: string;
  editingContent?: React.ReactNode;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label, editingContent }) => (
  <Box textAlign="center">
    {editingContent ?? (
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    )}
    <Typography variant="body2" fontWeight="bold">
      {label}
    </Typography>
  </Box>
);

const CompetitionDocuments: React.FC<CompetitionDocumentsProps> = ({ competitionDocumentsSummary }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const canEdit = isAdmin(user.role) || !!user.isOperations;
  const { mutateAsync: editCompetitionDocumentsSummary, isLoading: isSaving } = useEditCompetitionDocumentsSummary(
    competitionDocumentsSummary.executiveSummaryId
  );
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CompetitionDocumentsForm>({ submittedOnTimeCount: '', firstSubmissionRejectedCount: '' });

  const submittedOnTime = competitionDocumentsSummary.submittedOnTimeCount ?? 0;
  const firstSubmissionRejected = competitionDocumentsSummary.firstSubmissionRejectedCount ?? 0;

  const startEditing = () => {
    setForm({
      submittedOnTimeCount: numberToInput(competitionDocumentsSummary.submittedOnTimeCount),
      firstSubmissionRejectedCount: numberToInput(competitionDocumentsSummary.firstSubmissionRejectedCount)
    });
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    try {
      await editCompetitionDocumentsSummary({
        submittedOnTimeCount: inputToNumber(form.submittedOnTimeCount),
        firstSubmissionRejectedCount: inputToNumber(form.firstSubmissionRejectedCount),
        source: DataSource.MANUAL
      });
      setIsEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save competition documents');
    }
  };

  const updateField = (key: keyof CompetitionDocumentsForm) => (value: string) => {
    if (!NUMERIC_REGEX.test(value)) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const statInput = (key: keyof CompetitionDocumentsForm, label: string) => (
    <PillInput
      value={form[key]}
      onChange={(e) => updateField(key)(e.target.value)}
      inputProps={{ 'aria-label': label, inputMode: 'numeric', pattern: '[0-9]*' }}
      sx={{ width: 80, height: 36, mb: 0.5 }}
    />
  );

  return (
    <Card
      sx={{
        borderRadius: 5,
        backgroundColor: '#1e1e1e',
        color: 'white',
        p: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Competition Documents
          </Typography>
          {canEdit && !isEditing && (
            <IconButton aria-label="Edit competition documents" onClick={startEditing} size="small" sx={{ color: 'white' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" gap={6} flexGrow={1}>
          <StatBlock
            value={`${submittedOnTime}`}
            label="Submitted On Time"
            editingContent={isEditing ? statInput('submittedOnTimeCount', 'Submitted On Time') : undefined}
          />
          <StatBlock
            value={`${firstSubmissionRejected}`}
            label="First Submission Rejected"
            editingContent={isEditing ? statInput('firstSubmissionRejectedCount', 'First Submission Rejected') : undefined}
          />
        </Box>

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <NERFailButton onClick={handleCancel} disabled={isSaving}>
              Cancel
            </NERFailButton>
            <NERSuccessButton onClick={handleSave} disabled={isSaving}>
              Save
            </NERSuccessButton>
          </Box>
        )}

        {/* <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#ef4345',
              borderRadius: 5,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#d63a3c' }
            }}
          >
            View More
          </Button>
        </Box> */}
      </CardContent>
    </Card>
  );
};

export default CompetitionDocuments;
