/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { Rule } from 'shared';
import NERModal from '../../../components/NERModal';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useAddRuleReferences } from '../../../hooks/rules.hooks';

interface AddReferencedRuleModalProps {
  open: boolean;
  onClose: () => void;
  // The rule receiving a reference, whose "+" menu was used to open this modal
  ruleId: string | null;
  rulesetId: string;
  allRules: Rule[];
  isAllRulesLoading: boolean;
  isAllRulesError: boolean;
}

type RuleOption = { label: string; id: string };

/**
 * Modal for attaching an existing rule as a referenced rule to the currently-edited rule
 */
const AddReferencedRuleModal: React.FC<AddReferencedRuleModalProps> = ({
  open,
  onClose,
  ruleId,
  rulesetId,
  allRules,
  isAllRulesLoading,
  isAllRulesError
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState<RuleOption | null>(null);
  const { mutateAsync: addReferences, isLoading } = useAddRuleReferences(rulesetId);

  const activeRule = ruleId ? allRules.find((r) => r.ruleId === ruleId) : undefined;

  // Can attach any rule in the ruleset except the active rule itself and its already-referenced rules
  const options = useMemo<RuleOption[]>(() => {
    const excluded = new Set<string>([
      ...(activeRule ? [activeRule.ruleId] : []),
      ...(activeRule?.referencedRules ?? []).map((ref) => ref.ruleId)
    ]);
    return allRules
      .filter((r) => !excluded.has(r.ruleId))
      .sort((a, b) => a.ruleCode.localeCompare(b.ruleCode, undefined, { numeric: true }))
      .map((r) => ({ label: r.ruleCode, id: r.ruleId }));
  }, [allRules, activeRule]);

  // once loading finishes with no error, a missing activeRule means the ruleId doesn't exist, so there's nothing to show
  if (!isAllRulesLoading && !isAllRulesError && !activeRule) return null;

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ruleId || !selected) return;
    try {
      await addReferences({ ruleId, referencedRuleId: selected.id, referencedRuleCode: selected.label });
      handleClose();
    } catch {
      // the modal stays open so the reference can be retried
    }
  };

  return (
    <NERModal
      open={open}
      onHide={handleClose}
      title="Add Referenced Rule"
      onSubmit={handleSubmit}
      submitText="Submit"
      disabled={!selected || isLoading || isAllRulesLoading || isAllRulesError || !activeRule}
      showCloseButton
    >
      <Box sx={{ minWidth: '500px', py: 1 }}>
        {isAllRulesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : isAllRulesError ? (
          <Typography color="error">Failed to load rules. Please close and try again.</Typography>
        ) : (
          <NERAutocomplete
            id="referenced-rule-autocomplete"
            options={options}
            value={selected}
            onChange={(_event, value) => setSelected(value)}
            size="small"
            placeholder="Search for an existing rule"
            filterSelectedOptions
            sx={{
              backgroundColor: 'transparent',
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.default
              }
            }}
          />
        )}
      </Box>
    </NERModal>
  );
};

export default AddReferencedRuleModal;
