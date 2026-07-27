import { Box, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ChecklistItemType } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERMarkdown from '../../../components/NERMarkdown';
import { useCheckedChecklists } from '../../../hooks/onboarding.hook';
import { groupChecklists } from '../../../utils/onboarding.utils';

/**
 * Read-only reference view of the onboarding checklist items a new member already completed.
 * Reuses useCheckedChecklists() (the same source of truth the interactive checklist reads from)
 * and never imports useToggleChecklist, so it can't affect checklist state.
 */
const NewMemberChecklistSummaryWidget: React.FC = () => {
  const theme = useTheme();
  const { data: checkedChecklists, isLoading, isError, error } = useCheckedChecklists();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !checkedChecklists) return <LoadingIndicator />;

  const checkedIds = new Set(checkedChecklists.map((checklist) => checklist.checklistId));
  const completedParents = checkedChecklists.filter((checklist) => !checklist.parentChecklistId);
  const groupedCompleted = groupChecklists(completedParents);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        padding: 3,
        width: '100%'
      }}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>
        What You Completed
      </Typography>
      {completedParents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nothing completed yet
        </Typography>
      ) : (
        Object.entries(groupedCompleted).map(([groupName, parents]) => (
          <Box key={groupName} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {groupName}
            </Typography>
            {parents.map((parent) => {
              const referenceItems = [...parent.subtasks]
                .filter((subtask) => subtask.itemType === ChecklistItemType.INFO || checkedIds.has(subtask.checklistId))
                .sort((a, b) => (a.displayIndex ?? 999) - (b.displayIndex ?? 999));

              return (
                <Box key={parent.checklistId} sx={{ mb: 2 }}>
                  <Typography fontWeight="bold">{parent.content}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, ml: 1 }}>
                    {referenceItems.map((item) =>
                      item.itemType === ChecklistItemType.INFO ? (
                        <Box
                          key={item.checklistId}
                          sx={{ backgroundColor: theme.palette.action.hover, borderRadius: 1, p: 1 }}
                        >
                          <NERMarkdown markdown={item.content} />
                        </Box>
                      ) : (
                        <Box key={item.checklistId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                          <Typography variant="body2">{item.content}</Typography>
                        </Box>
                      )
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))
      )}
    </Box>
  );
};

export default NewMemberChecklistSummaryWidget;
