/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { Rule } from 'shared';
import NERModal from '../../../components/NERModal';
import NERAutocomplete from '../../../components/NERAutocomplete';
import { useAddRuleReferences } from '../../../hooks/rules.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

interface AddReferencedRuleModalProps {
  open: boolean;
  onClose: () => void;
  // The rule recieving a reference, whose "+" menu was used to open this modal
  ruleId: string | null;
  allRules: Rule[];
}

type RuleOption = { label: string; id: string };

/**
 * Modal for attaching an existing rule as a referenced rule to the currently-edited rule
 */
const AddReferencedRuleModal: React.FC<AddReferencedRuleModalProps> = ({ open, onClose, ruleId, allRules }) => {
  const [selected, setSelected] = useState<RuleOption | null>(null);
  const { mutateAsync: addReferences, isLoading } = useAddRuleReferences();
  const toast = useToast();

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

  if (!activeRule) return null;

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ruleId || !selected) return;
    try {
      await addReferences({ ruleId, referencedRuleId: selected.id });
      toast.success('Referenced rule added successfully');
      handleClose();
    } catch (err) {
      toast.error('Failed to add referenced rule');
    }
  };

  return (
    <NERModal
      open={open}
      onHide={handleClose}
      title="Add Referenced Rule"
      onSubmit={handleSubmit}
      submitText="Submit"
      disabled={!selected || isLoading}
      showCloseButton
    >
      <Box sx={{ minWidth: '500px', py: 1 }}>
        <NERAutocomplete
          id="referenced-rule-autocomplete"
          options={options}
          value={selected}
          onChange={(_event, value) => setSelected(value)}
          size="small"
          placeholder="Search for an existing rule"
          filterSelectedOptions
        />
      </Box>
    </NERModal>
  );
};

export default AddReferencedRuleModal;
